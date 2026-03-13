import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const pyScriptPath = path.resolve('../ml/isolationForest.py');
const pyEnvPath = path.resolve('../ml/venv/Scripts/python.exe');

const baselines = JSON.parse(fs.readFileSync('baselines.json', 'utf8'));

const testFeature = baselines[baselines.length - 1];
const priorBaselines = baselines.slice(0, baselines.length - 1);
const inputPayload = JSON.stringify({ baseline: priorBaselines, target: testFeature });

const pyProcess = spawn(pyEnvPath, [pyScriptPath]);
let stdoutData = "";
let stderrData = "";

pyProcess.stdout.on('data', (data) => { stdoutData += data.toString(); });
pyProcess.stderr.on('data', (data) => { stderrData += data.toString(); });

pyProcess.on('close', (code) => {
    console.log("Stdout:", stdoutData);
    if (stderrData) console.error("Stderr:", stderrData);
});

pyProcess.stdin.write(inputPayload);
pyProcess.stdin.end();
