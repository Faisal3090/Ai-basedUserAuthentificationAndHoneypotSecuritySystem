import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const pyScriptPath = path.resolve('./ml/isolationForest.py');
const pyEnvPath = path.resolve('./ml/venv/Scripts/python.exe');

const testFeature = [0.5, 0.2, 0.1, 0.1, 0.5, 0.5, 0.2, 0, 0.5, 0.5];
const baseline = [
    testFeature, testFeature, testFeature, testFeature, testFeature
];

const inputPayload = JSON.stringify({ baseline, target: testFeature });

const pyProcess = spawn(pyEnvPath, [pyScriptPath]);

let stdoutData = "";
let stderrData = "";

pyProcess.stdout.on('data', (data) => { stdoutData += data.toString(); });
pyProcess.stderr.on('data', (data) => { stderrData += data.toString(); });

pyProcess.on('close', (code) => {
    console.log("Exit code:", code);
    console.log("Stdout:", stdoutData);
    console.log("Stderr:", stderrData);
});

pyProcess.stdin.write(inputPayload);
pyProcess.stdin.end();
