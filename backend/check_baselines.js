import mongoose from 'mongoose';
import Baseline from './models/Baseline.js';
import fs from 'fs';

mongoose.connect('mongodb://127.0.0.1:27017/behavioral-auth')
    .then(async () => {
        const baselines = await Baseline.find({ username: 'admin' }).lean();
        fs.writeFileSync('baselines.json', JSON.stringify(baselines.map(b => b.features), null, 2));
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
