import sys
import json
import numpy as np
from sklearn.ensemble import IsolationForest

def main():
    try:
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input data provided"}))
            sys.exit(1)
            
        data = json.loads(input_data)
        baseline = np.array(data.get("baseline", []))
        target = np.array(data.get("target", []))
        
        if baseline.shape[0] < 3:
            # Not enough data to build a meaningful baseline
            print(json.dumps({
                "score": 0.3,
                "suspicious": False,
                "reason": "Building baseline — insufficient data"
            }))
            return

        target = target.reshape(1, -1)
        
        # Train isolation forest on the baseline data
        clf = IsolationForest(n_estimators=50, max_samples='auto', contamination=0.1, random_state=42)
        clf.fit(baseline)
        
        # score_samples returns opposite of anomaly score. 
        # Typically values are between -1 (highly anomalous) and 0 (normal)
        score = clf.score_samples(target)[0]
        
        # Invert the score (so higher = more anomalous)
        anomaly_score = float(-score)
        
        # Normalize roughly to a 0.0 - 1.0 range
        # Empirically, normal is ~0.35 - 0.5; extreme anomaly ~0.65 - 0.8
        # We use a more forgiving scale so normal variance doesn't lock accounts
        mapped_score = min(max((anomaly_score - 0.45) * 2.0, 0.0), 1.0)
        
        # Determine if suspicious based on a threshold of 0.62
        suspicious = mapped_score > 0.62
        
        print(json.dumps({
            "score": round(mapped_score, 3),
            "raw_score": round(anomaly_score, 3),
            "suspicious": suspicious,
            "reason": "Behavioral anomaly detected by AI Model" if suspicious else "Normal behavior"
        }))
        
    except Exception as e:
        print(json.dumps({
            "error": str(e),
            "score": 0.5,
            "suspicious": False,
            "reason": "Error running ML model"
        }))

if __name__ == "__main__":
    main()
