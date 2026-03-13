import express from 'express';
import { resolveIp } from '../services/ipResolver.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
        // Extract first IP if multiple
        const ip = typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : rawIp;

        // Convert IPv6 local to generic local
        const normalizedIp = (ip === '::1' || ip === '::ffff:127.0.0.1') ? '127.0.0.1' : ip;

        const geoData = await resolveIp(normalizedIp);
        res.json(geoData);
    } catch (error) {
        console.error('IP info error:', error);
        res.status(500).json({ error: 'Failed to resolve IP' });
    }
});

export default router;
