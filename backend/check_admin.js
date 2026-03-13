import mongoose from 'mongoose';
import User from './models/User.js';
import Session from './models/Session.js';
import fs from 'fs';

mongoose.connect('mongodb://127.0.0.1:27017/behavioral-auth')
    .then(async () => {
        const user = await User.findOne({ username: 'admin' }).lean();
        fs.writeFileSync('admin.json', JSON.stringify(user, null, 2));
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
