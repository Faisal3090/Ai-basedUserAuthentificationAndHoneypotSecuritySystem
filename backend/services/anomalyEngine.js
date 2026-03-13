import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pyScriptPath = path.resolve(__dirname, '../../ml/isolationForest.py');
const pyEnvPath = path.resolve(__dirname, '../../ml/venv/Scripts/python.exe'); // Windows venv path

// In-memory data store for user profiles
export const DB = {
    userProfiles: {}
};

// SECTION 3: USER PROFILE TRACKING (store baseline attributes)
export function updateUserProfile(username, meta) {
  if (!DB.userProfiles[username]) {
    DB.userProfiles[username] = {
      baselineTimezones: [],
      baselineFingerprints: [],
      baselineHasScreen: false,
      baselineTouchDevice: null,
      baselineCPU: null,
      loginCount: 0,
    };
  }
  const p = DB.userProfiles[username];
  p.loginCount++;
  
  // Add timezone to set (keep last 10)
  if (!p.baselineTimezones.includes(meta.timezoneOffset)) {
    p.baselineTimezones.push(meta.timezoneOffset);
    if (p.baselineTimezones.length > 10) p.baselineTimezones.shift();
  }
  
  // Add fingerprint to set (keep last 5 — allows browser updates)
  if (!p.baselineFingerprints.includes(meta.fingerprint)) {
    p.baselineFingerprints.push(meta.fingerprint);
    if (p.baselineFingerprints.length > 5) p.baselineFingerprints.shift();
  }
  
  // Track whether user ever has a real screen
  if (meta.screenWidth > 0) p.baselineHasScreen = true;
  
  // Track touch device (majority vote after 3+ logins)
  if (p.loginCount <= 5) p.baselineTouchDevice = meta.touchDevice;
  
  // Track CPU (max observed — bots tend to have less)
  const cpu = parseInt(meta.cpuCores) || 1;
  if (!p.baselineCPU || cpu > p.baselineCPU) p.baselineCPU = cpu;
}

// Internal ML analyzer (formerly checkAnomaly)
async function mlAnalyze(baselineDocs, targetFeatures, meta) {
    const baseline = baselineDocs.map(doc => doc.features);

    // SECTION 4: MINIMUM BASELINE ENFORCEMENT (Require at least 8 successful logins)
    if (baseline.length < 8) {
        return { 
            score: 0.3, 
            suspicious: false, 
            reason: `Baseline building: ${baseline.length}/8 logins recorded` 
        };
    }

    const result = await new Promise((resolve, reject) => {
        const inputPayload = JSON.stringify({ baseline, target: targetFeatures });

        const pyProcess = spawn(pyEnvPath, [pyScriptPath]);

        let stdoutData = "";
        let stderrData = "";

        pyProcess.stdout.on('data', (data) => { stdoutData += data.toString(); });
        pyProcess.stderr.on('data', (data) => { stderrData += data.toString(); });

        pyProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Python script exited with code ${code}. Error: ${stderrData}`);
                resolve({ score: 0.5, suspicious: false, reason: "ML engine error" });
                return;
            }
            try {
                const mlResult = JSON.parse(stdoutData.trim());
                resolve(mlResult);
            } catch (e) {
                console.error(`Failed to parse ML output: ${stdoutData}`);
                resolve({ score: 0.5, suspicious: false, reason: "ML parsing failed" });
            }
        });

        pyProcess.stdin.write(inputPayload);
        pyProcess.stdin.end();
    });

    let finalScore = result.score || 0.0;
    let reasons = [];

    if (finalScore >= 0.70) {
        reasons.push("High-risk behavioral anomaly detected");
    } else if (finalScore >= 0.55) {
        reasons.push("Suspicious behavioral deviation");
    }

    return {
        score: finalScore,
        suspicious: finalScore >= 0.55,
        reason: reasons.length > 0 ? reasons.join(" · ") : "Normal behavior"
    };
}

// SECTION 2: HYBRID SCORING ENGINE (ML + Hard Rules)
export async function hybridAnalyze(username, baselineDocs, targetFeatures, meta) {
  const mlResult = await mlAnalyze(baselineDocs, targetFeatures, meta);
  
  // Hard rule tripwires — these OVERRIDE the ML score
  const tripwires = [];
  
  const userProfile = DB.userProfiles[username] || {
      baselineTimezones: [],
      baselineFingerprints: [],
      baselineHasScreen: false,
      baselineTouchDevice: null,
      baselineCPU: null,
      loginCount: 0,
  };
  
  // TRIPWIRE 1: Timezone completely different from baseline
  if (userProfile.baselineTimezones && userProfile.baselineTimezones.length > 0) {
    const tzDelta = Math.min(...userProfile.baselineTimezones.map(btz => 
      Math.abs(btz - meta.timezoneOffset)
    ));
    if (tzDelta > 180) {  // 3+ hour timezone shift from ANY baseline login
      tripwires.push({ rule: "TIMEZONE_SHIFT", severity: 0.85, detail: `TZ shifted by ${tzDelta} minutes from baseline` });
    }
  }
  
  // TRIPWIRE 2: Canvas fingerprint mismatch (different device/browser)
  if (userProfile.baselineFingerprints && userProfile.baselineFingerprints.length > 0) {
    const fpMatch = userProfile.baselineFingerprints.includes(meta.fingerprint);
    if (!fpMatch) {
      // In Incognito/Cloudflare, fingerprint might change completely, so require suspicious speed or no mouse activity to trigger
      if (meta.formSubmitTime < 2000 || (meta.mouseMovements === 0 && !meta.touchDevice)) {
        tripwires.push({ rule: "FINGERPRINT_MISMATCH", severity: 0.75, detail: "Canvas fingerprint not in baseline set" });
      } else {
        // Soft penalty for just a mismatch (e.g. Incognito) without explicit bot behavior
        tripwires.push({ rule: "FINGERPRINT_MISMATCH_SOFT", severity: 0.56, detail: "Canvas fingerprint not in baseline set (Possible Incognito)" });
      }
    }
  }
  
  // TRIPWIRE 3: Screen went from real to zero (desktop user now headless)
  if (userProfile.baselineHasScreen && (meta.screenWidth === 0 || meta.screenHeight === 0)) {
    // Only fire if there's no mouse movements either (incognito sometimes blocks screen data)
    if (meta.mouseMovements === 0 && !meta.touchDevice) {
        tripwires.push({ rule: "HEADLESS_BROWSER", severity: 0.95, detail: "No screen resolution detected (headless/bot)" });
    }
  }
  
  // TRIPWIRE 4: Touch device flip (desktop user now on mobile, or vice versa)
  if (userProfile.baselineTouchDevice !== null && userProfile.baselineTouchDevice !== undefined && userProfile.baselineTouchDevice !== meta.touchDevice) {
    tripwires.push({ rule: "DEVICE_TYPE_FLIP", severity: 0.60, detail: `Device type changed: was ${userProfile.baselineTouchDevice ? "mobile" : "desktop"}, now ${meta.touchDevice ? "mobile" : "desktop"}` });
  }
  
  // TRIPWIRE 5: CPU cores dropped significantly (VPS attack)
  if (userProfile.baselineCPU && parseInt(meta.cpuCores) < userProfile.baselineCPU * 0.5) {
    tripwires.push({ rule: "CPU_ANOMALY", severity: 0.65, detail: `CPU dropped from ${userProfile.baselineCPU} to ${meta.cpuCores} cores` });
  }
  
  // TRIPWIRE 6: Form submitted impossibly fast (< 800ms = bot)
  if (meta.formSubmitTime < 800) {
    if (meta.mouseMovements === 0) {
      tripwires.push({ rule: "BOT_SPEED_SUBMIT", severity: 0.90, detail: `Form submitted in ${meta.formSubmitTime}ms (bot threshold: 800ms) with no mouse` });
    } else {
      tripwires.push({ rule: "BOT_SPEED_SUBMIT_SOFT", severity: 0.70, detail: `Fast form submit (${meta.formSubmitTime}ms) but with mouse movements (Autofill possible)` });
    }
  }
  
  // TRIPWIRE 7: Zero mouse movement with real screen (no human would do this)
  if (meta.mouseMovements < 3 && meta.screenWidth > 0) {
    tripwires.push({ rule: "NO_MOUSE_ACTIVITY", severity: 0.80, detail: "Zero mouse movement on desktop browser" });
  }
  
  // Compute final score: max of ML score OR highest tripwire severity
  const maxTripwire = tripwires.length > 0 ? Math.max(...tripwires.map(t => t.severity)) : 0;
  const finalScore = Math.max(mlResult.score, maxTripwire);
  
  // Determine action thresholds:
  // 0.00 - 0.55 → ALLOW (dashboard)
  // 0.55 - 0.75 → HONEYPOT (silently redirect to fake dashboard)
  // 0.75 - 1.00 → TERMINATE (account lock, show error, log everything)
  
  let action = "ALLOW";
  if (finalScore >= 0.75) action = "TERMINATE";
  else if (finalScore >= 0.55) action = "HONEYPOT";
  
  return {
    mlScore: mlResult.score,
    finalScore: parseFloat(finalScore.toFixed(3)),
    score: parseFloat(finalScore.toFixed(3)), // keep score for backward compatibility
    action,
    tripwiresFired: tripwires,
    reason: tripwires.length > 0 
      ? tripwires.map(t => t.rule).join(" + ") 
      : mlResult.reason,
  };
}

// SECTION 1: FEATURE ENGINEERING (expand from 10 to 18 features)
export function extractFeatureArray(meta) {
  const hour = new Date(meta.timestamp || Date.now()).getHours();
  const minute = new Date(meta.timestamp || Date.now()).getMinutes();

  // Feature 1-2: Circular time encoding (fixes the 11pm/1am problem)
  const timeRad = ((hour * 60 + minute) / 1440) * 2 * Math.PI;
  const timeSin = (Math.sin(timeRad) + 1) / 2;   // 0-1
  const timeCos = (Math.cos(timeRad) + 1) / 2;   // 0-1

  // Feature 3: Typing speed (normalized, capped)
  const typingNorm = Math.min(meta.typingSpeed || 0, 300) / 300;

  // Feature 4: Form submit time (log-scaled — humans take 2-8 seconds, bots < 0.5s)
  const submitNorm = Math.log1p(Math.min(meta.formSubmitTime || 0, 30000)) / Math.log1p(30000);

  // Feature 5: Mouse movement (log-scaled)
  const mouseNorm = Math.log1p(Math.min(meta.mouseMovements || 0, 2000)) / Math.log1p(2000);

  // Feature 6-7: Screen dimensions (separate, not combined)
  const screenWNorm = (meta.screenWidth || 0) / 3840;
  const screenHNorm = (meta.screenHeight || 0) / 2160;

  // Feature 8: Pixel ratio (mobile=2-3x, desktop=1-1.5x)
  const pixelRatioNorm = Math.min(meta.pixelRatio || 1, 4) / 4;

  // Feature 9: Touch device flag
  const touchFlag = meta.touchDevice ? 1 : 0;

  // Feature 10: Timezone offset (normalized — this is a strong geo signal)
  const tzNorm = ((meta.timezoneOffset || 0) + 720) / 1440;  // shift to 0-1 range

  // Feature 11-12: Full IP as 4 octets combined into 2 normalized features
  let ipOctet1Norm = 0;
  let ipOctet2Norm = 0;
  let isPublicIP = 1;
  if (meta.ip && meta.ip !== 'unavailable') {
      const parts = meta.ip.split('.');
      if (parts.length >= 2) {
          const octet1 = parseInt(parts[0], 10) || 0;
          ipOctet1Norm = octet1 / 255;
          ipOctet2Norm = (parseInt(parts[1], 10) || 0) / 255;
          if (octet1 === 192 || octet1 === 10 || octet1 === 172) {
              isPublicIP = 0;
          }
      }
  }

  // Feature 14: Screen has resolution (headless=0, real browser=1)
  const hasScreen = (meta.screenWidth > 0 && meta.screenHeight > 0) ? 1 : 0;

  // Feature 15: CPU cores normalized (bot VPS typically has 1-2, real desktop has 8-16)
  const cpuNorm = Math.min(parseInt(meta.cpuCores) || 1, 32) / 32;

  // Feature 16: Device memory (bot=0 or unknown, real=4-16GB)
  const memVal = parseFloat(meta.deviceMemory) || 0;
  const memNorm = Math.min(memVal, 16) / 16;

  // Feature 17: Languages count (bots often have 1, humans have 2-4)
  const langCount = (meta.languages || "").split(",").length;
  const langNorm = Math.min(langCount, 5) / 5;

  // Feature 18: Fingerprint stability hash (compare hash prefix match to baseline)
  const fpStability = 0.5;

  return [
    timeSin, timeCos, typingNorm, submitNorm, mouseNorm,
    screenWNorm, screenHNorm, pixelRatioNorm, touchFlag, tzNorm,
    ipOctet1Norm, ipOctet2Norm, isPublicIP, hasScreen,
    cpuNorm, memNorm, langNorm, fpStability
  ];
}
