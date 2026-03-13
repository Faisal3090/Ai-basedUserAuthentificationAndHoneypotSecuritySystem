import express from 'express';
import Session from '../models/Session.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const sessions = await Session.find().sort({ createdAt: -1 }).limit(100);
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
