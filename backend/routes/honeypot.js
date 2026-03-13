import express from 'express';
import HoneypotLog from '../models/HoneypotLog.js';

const router = express.Router();

router.post('/log', async (req, res) => {
    try {
        const { sessionId, action, page } = req.body;

        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID required' });
        }

        const log = await HoneypotLog.findOne({ sessionId });
        if (!log) {
            return res.status(404).json({ error: 'Honeypot session not found' });
        }

        if (page && !log.pagesVisited.includes(page)) {
            log.pagesVisited.push(page);
        }
        if (action) {
            log.actionsPerformed.push(action);
        }

        log.duration = Math.floor((Date.now() - new Date(log.entryTime).getTime()) / 1000);

        await log.save();
        return res.json({ success: true });

    } catch (error) {
        console.error('Honeypot log error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/history', async (req, res) => {
    try {
        const logs = await HoneypotLog.find().sort({ createdAt: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
