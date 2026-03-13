import mongoose from 'mongoose';
import User from './models/User.js';

mongoose.connect('mongodb://127.0.0.1:27017/behavioral-auth')
    .then(async () => {
        console.log('Connected to DB');
        const res = await User.updateMany({}, { $set: { accountLocked: false, unlockAt: null, failedAttempts: 0, lockReason: null, lockTime: null } });
        console.log(`Unlocked ${res.modifiedCount} accounts.`);
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
