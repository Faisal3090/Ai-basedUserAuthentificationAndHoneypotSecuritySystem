import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    meta: {
        ip: String,
        geo: mongoose.Schema.Types.Mixed,
        browser: String,
        os: String,
        device: String,
        screenWidth: Number,
        screenHeight: Number,
        fingerprint: String,
        typingSpeed: Number,
        mouseMovements: Number,
        formSubmitTime: Number,
        timezoneOffset: Number,
        cpuCores: mongoose.Schema.Types.Mixed,
        deviceMemory: mongoose.Schema.Types.Mixed,
        platform: String,
        languages: String
    },
    analysis: {
        score: Number,
        suspicious: Boolean,
        reason: String
    },
    isHoneypot: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export default mongoose.models.Session || mongoose.model('Session', sessionSchema);
