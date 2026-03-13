import mongoose from 'mongoose';

const honeypotLogSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    ip: String,
    geo: mongoose.Schema.Types.Mixed,
    device: String,
    browser: String,
    os: String,
    fingerprint: String,
    anomalyScore: Number,
    pagesVisited: [String],
    actionsPerformed: [String],
    entryTime: {
        type: Date,
        default: Date.now
    },
    duration: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

export default mongoose.models.HoneypotLog || mongoose.model('HoneypotLog', honeypotLogSchema);
