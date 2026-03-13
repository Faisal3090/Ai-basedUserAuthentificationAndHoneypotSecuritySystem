import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import sessionRoutes from './routes/sessions.js';
import honeypotRoutes from './routes/honeypot.js';
import ipRoutes from './routes/ipinfo.js';
import securityRoutes from './routes/security.js';
import User from './models/User.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/behavioral-auth';

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/honeypot', honeypotRoutes);
app.use('/api/ip', ipRoutes);
app.use('/api/security', securityRoutes);

// Database connection
mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        // Seed initial users for demo
        const users = ['admin', 'alice', 'bob'];
        for (const u of users) {
            const exists = await User.findOne({ username: u });
            if (!exists) {
                await User.create({ username: u, password: `${u}123`, role: u === 'admin' ? 'admin' : 'user' });
            }
        }

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });
