import mongoose from 'mongoose';
import User from './models/User.js';
import Session from './models/Session.js';
import SecurityIncident from './models/SecurityIncident.js';
import HoneypotLog from './models/HoneypotLog.js';

const mongoURI = 'mongodb://127.0.0.1:27017/behavioral-auth';

async function resetSystem() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoURI);
        console.log('Connected.');

        // 1. Unlock all accounts
        const userRes = await User.updateMany({}, { 
            $set: { 
                accountLocked: false, 
                unlockAt: null, 
                failedAttempts: 0, 
                lockReason: null, 
                lockTime: null 
            } 
        });
        console.log(`- Unlocked ${userRes.modifiedCount} accounts.`);

        // 2. Clear all active sessions
        const sessionRes = await Session.deleteMany({});
        console.log(`- Cleared ${sessionRes.deletedCount} sessions.`);

        // 3. Clear all security incidents
        const incidentRes = await SecurityIncident.deleteMany({});
        console.log(`- Deleted ${incidentRes.deletedCount} security incidents.`);

        // 4. Clear honeypot logs
        const hpRes = await HoneypotLog.deleteMany({});
        console.log(`- Deleted ${hpRes.deletedCount} honeypot records.`);

        console.log('\n✅ System refresh complete. You can now log in normally.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Reset failed:', err);
        process.exit(1);
    }
}

resetSystem();
