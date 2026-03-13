import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Adjust path to point to backend/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import User from '../models/User.js';
import Session from '../models/Session.js';
import Baseline from '../models/Baseline.js';
import HoneypotLog from '../models/HoneypotLog.js';
import SecurityIncident from '../models/SecurityIncident.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/behavioral-auth';

async function seedData() {
    try {
        console.log(`🔌 Connecting to MongoDB at ${MONGO_URI}...`);
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected successfully.\n');

        console.log('🧹 Clearing existing collections...');
        await User.deleteMany({});
        await Session.deleteMany({});
        await Baseline.deleteMany({});
        await HoneypotLog.deleteMany({});
        await SecurityIncident.deleteMany({});
        console.log('✅ Collections cleared.\n');

        console.log('🌱 Seeding fresh demo users...');
        const users = [
            { username: 'admin', password: 'admin123', role: 'admin' },
            { username: 'alice', password: 'alice123', role: 'user' },
            { username: 'bob', password: 'bob123', role: 'user' }
        ];

        for (const u of users) {
            await User.create(u);
            console.log(`  👤 Created user: ${u.username}`);
        }

        console.log('\n🎉 Database successfully reset for demonstration!');
        console.log('You can now show a clean login flow to the judges.\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
}

seedData();
