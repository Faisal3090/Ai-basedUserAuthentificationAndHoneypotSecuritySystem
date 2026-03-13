import mongoose from 'mongoose';
import Session from './models/Session.js';
import fs from 'fs';

mongoose.connect('mongodb://127.0.0.1:27017/behavioral-auth')
    .then(async () => {
        const sessions = await Session.find().sort({ timestamp: -1 }).limit(10).lean();
        fs.writeFileSync('output.json', JSON.stringify(sessions.map(s => ({
            u: s.username,
            hp: s.isHoneypot,
            score: s.analysis?.score,
            reason: s.analysis?.reason
        })), null, 2));
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
