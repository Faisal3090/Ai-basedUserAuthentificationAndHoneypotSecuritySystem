import mongoose from 'mongoose';
import SecurityIncident from './models/SecurityIncident.js';
import fs from 'fs';

mongoose.connect('mongodb://127.0.0.1:27017/behavioral-auth')
    .then(async () => {
        const incidents = await SecurityIncident.find({ username: 'admin' }).sort({ timestamp: -1 }).limit(5).lean();
        fs.writeFileSync('incidents.json', JSON.stringify(incidents.map(i => ({
            score: i.anomalyScore,
            reason: i.reason,
            time: i.timestamp
        })), null, 2), 'utf8');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
