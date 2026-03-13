import mongoose from 'mongoose';

const securityIncidentSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    ip: String,
    country: String,
    city: String,
    asn: String,
    isp: String,
    lat: Number,
    lng: Number,
    browser: String,
    os: String,
    device: String,
    fingerprint: String,
    anomalyScore: Number,
    reason: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.models.SecurityIncident || mongoose.model('SecurityIncident', securityIncidentSchema);
