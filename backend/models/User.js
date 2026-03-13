import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: { // Using plain text to match existing behavior for demo purposes (INSECURE for prod)
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'user'
    },
    loginCount: {
        type: Number,
        default: 0
    },
    accountLocked: {
        type: Boolean,
        default: false
    },
    lockReason: {
        type: String,
        default: null
    },
    lockTime: {
        type: Date,
        default: null
    },
    unlockAt: {
        type: Date,
        default: null
    },
    failedAttempts: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);
