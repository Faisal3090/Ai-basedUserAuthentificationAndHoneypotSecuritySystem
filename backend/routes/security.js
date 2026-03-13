import express from 'express';
import SecurityIncident from '../models/SecurityIncident.js';

const router = express.Router();

// 1. Attacker world map data
router.get('/attacks', async (req, res) => {
    try {
        const attacks = await SecurityIncident.find({}, {
            ip: 1, country: 1, lat: 1, lng: 1, anomalyScore: 1, timestamp: 1
        }).sort({ timestamp: -1 }).limit(100);

        // Map response exactly to requested format: { ip, country, lat, lng, score, timestamp }
        const formatted = attacks.map(a => ({
            ip: a.ip,
            country: a.country,
            lat: a.lat,
            lng: a.lng,
            score: a.anomalyScore,
            timestamp: a.timestamp
        }));
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch attacks map data' });
    }
});

// 2. Attack timeline (grouped by hour)
router.get('/timeline', async (req, res) => {
    try {
        // Note: This matches the timezone of the MongoDB server. For UTC, it works perfectly.
        const timeline = await SecurityIncident.aggregate([
            {
                $group: {
                    // Group by date, hour
                    _id: {
                        year: { $year: "$timestamp" },
                        month: { $month: "$timestamp" },
                        day: { $dayOfMonth: "$timestamp" },
                        hour: { $hour: "$timestamp" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.hour": 1 } },
            { $limit: 24 } // last 24 hours of data
        ]);

        const formatted = timeline.map(point => ({
            hour: `${point._id.hour}:00`,
            date: `${point._id.year}-${String(point._id.month).padStart(2, '0')}-${String(point._id.day).padStart(2, '0')}`,
            attacks: point.count
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch timeline data' });
    }
});

// 3. Top attacker countries
router.get('/countries', async (req, res) => {
    try {
        const countries = await SecurityIncident.aggregate([
            {
                $group: {
                    _id: { $ifNull: ["$country", "Unknown"] },
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);
        res.json(countries.map(c => ({ country: c._id, count: c.count })));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch top countries' });
    }
});

// 4. ASN / ISP analysis
router.get('/asn', async (req, res) => {
    try {
        const asns = await SecurityIncident.aggregate([
            {
                $group: {
                    _id: { $ifNull: ["$asn", "Unknown"] },
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);
        res.json(asns.map(a => ({ asn: a._id, count: a.count })));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch top ASNs' });
    }
});

// 5. Recent incidents table
router.get('/recent', async (req, res) => {
    try {
        const recent = await SecurityIncident.find({}, {
            username: 1, ip: 1, country: 1, asn: 1, browser: 1, device: 1, anomalyScore: 1, timestamp: 1
        }).sort({ timestamp: -1 }).limit(50);

        const formatted = recent.map(r => ({
            id: r._id,
            username: r.username,
            ip: r.ip,
            country: r.country,
            asn: r.asn,
            browser: r.browser,
            device: r.device,
            score: r.anomalyScore,
            timestamp: r.timestamp
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch recent incidents' });
    }
});

export default router;
