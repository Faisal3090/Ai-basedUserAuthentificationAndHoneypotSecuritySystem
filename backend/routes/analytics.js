import express from 'express';
import Session from '../models/Session.js';
import HoneypotLog from '../models/HoneypotLog.js';
import SecurityIncident from '../models/SecurityIncident.js';

const router = express.Router();

// GET /api/login-analytics
// Returns per-day login counts: normal, suspicious, honeypot
// Read-only — does not modify any existing data or schema
router.get('/', async (req, res) => {
    try {
        // 1. Session collection — normal + honeypot sessions
        const sessionAgg = await Session.aggregate([
            {
                $group: {
                    _id: {
                        year:  { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day:   { $dayOfMonth: '$createdAt' }
                    },
                    normal:   { $sum: { $cond: [{ $eq: ['$isHoneypot', false] }, 1, 0] } },
                    honeypot: { $sum: { $cond: [{ $eq: ['$isHoneypot', true]  }, 1, 0] } }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
            { $limit: 30 }
        ]);

        // 2. HoneypotLog by day (supplements honeypot count)
        const hpAgg = await HoneypotLog.aggregate([
            {
                $group: {
                    _id: {
                        year:  { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day:   { $dayOfMonth: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);

        // 3. SecurityIncident by day — authoritative source for ALL flagged logins
        //    Covers TERMINATE-path attacks which never produce a Session record
        //    Note: SecurityIncident uses 'timestamp' not 'createdAt'
        const incidentAgg = await SecurityIncident.aggregate([
            {
                $group: {
                    _id: {
                        year:  { $year: '$timestamp' },
                        month: { $month: '$timestamp' },
                        day:   { $dayOfMonth: '$timestamp' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);

        // Build lookup maps keyed by "YYYY-MM-DD"
        const toKey = p =>
            `${p._id.year}-${String(p._id.month).padStart(2,'0')}-${String(p._id.day).padStart(2,'0')}`;

        const hpMap = {};
        for (const p of hpAgg) { hpMap[toKey(p)] = (hpMap[toKey(p)] || 0) + p.count; }

        const incidentMap = {};
        for (const p of incidentAgg) { incidentMap[toKey(p)] = (incidentMap[toKey(p)] || 0) + p.count; }

        // Merge all dates across all three sources
        const allDates = new Set([
            ...sessionAgg.map(toKey),
            ...Object.keys(hpMap),
            ...Object.keys(incidentMap)
        ]);

        const result = [];
        for (const date of allDates) {
            const sess = sessionAgg.find(p => toKey(p) === date);
            result.push({
                date,
                normal:     sess ? sess.normal   : 0,
                suspicious: incidentMap[date]    || 0,   // all SecurityIncident records
                honeypot:   Math.max(sess ? sess.honeypot : 0, hpMap[date] || 0)
            });
        }

        result.sort((a, b) => a.date.localeCompare(b.date));
        res.json(result);

    } catch (error) {
        console.error('login-analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch login analytics' });
    }
});

export default router;
