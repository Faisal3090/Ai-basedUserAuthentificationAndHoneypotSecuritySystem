import mongoose from 'mongoose';

const baselineSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    features: {
        type: [Number], // The 10-12 dimensional normalized feature array
        required: true
    }
}, { timestamps: true });

export default mongoose.models.Baseline || mongoose.model('Baseline', baselineSchema);
