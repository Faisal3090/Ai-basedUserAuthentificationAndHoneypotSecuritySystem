import express from 'express';
import User from '../models/User.js';
import Session from '../models/Session.js';
import Baseline from '../models/Baseline.js';
import HoneypotLog from '../models/HoneypotLog.js';
import SecurityIncident from '../models/SecurityIncident.js';
import { hybridAnalyze, extractFeatureArray, updateUserProfile } from '../services/anomalyEngine.js';
import { resolveIp } from '../services/ipResolver.js';

const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        const { username, password, meta } = req.body;

        const user = await User.findOne({ username });

        let fullMeta = { ...meta };

        // Resolve IP if missing or unavailable early for locked account messages
        if (!fullMeta.geo || !fullMeta.geo.city || fullMeta.geo.city === 'unknown' || fullMeta.geo.city === '?') {
            const geo = await resolveIp(fullMeta.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress);
            fullMeta.ip = geo.ip;
            fullMeta.geo = geo;
        }

        if (!user || user.password !== password) {
            if (user) {
                user.failedAttempts += 1;
                await user.save();
            }
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (user.accountLocked) {
            if (new Date() > new Date(user.unlockAt)) {
                user.accountLocked = false;
                user.lockReason = null;
                user.lockTime = null;
                user.unlockAt = null;
                user.failedAttempts = 0;
                await user.save();
            } else {
                return res.status(401).json({ error: "Session expired. Please try again later." });
            }
        }

        user.loginCount += 1;
        await user.save();

        // Get Baseline
        const baselines = await Baseline.find({ username }).limit(20);
        const targetFeatures = extractFeatureArray(fullMeta);

        // Call Python Anomaly Engine & Hard Rules
        const analysis = await hybridAnalyze(username, baselines, targetFeatures, fullMeta);

        // SECTION 5: THREE-TIER ACTION SYSTEM
        if (analysis.action === "TERMINATE") {
            const isSimulated = fullMeta.geo?.source === 'simulated';

            // Only lock real accounts — simulated attacks must not permanently block the user
            if (!isSimulated) {
                user.accountLocked = true;
                user.lockTime = new Date();
                user.unlockAt = new Date(Date.now() + 10 * 60000); // 10 minutes
                await user.save();
            }

            // Always log security incident (real or simulated)
            await SecurityIncident.create({
                username,
                ip: fullMeta.ip,
                country: fullMeta.geo?.country,
                city: fullMeta.geo?.city,
                asn: fullMeta.geo?.org,
                isp: fullMeta.geo?.org,
                lat: fullMeta.geo?.lat,
                lng: fullMeta.geo?.lng,
                browser: fullMeta.browser,
                os: fullMeta.os,
                device: fullMeta.device,
                fingerprint: fullMeta.fingerprint,
                anomalyScore: analysis.finalScore,
                reason: analysis.reason
            });

            // "Show a fake 'Session expired' or generic error — do NOT reveal detection"
            return res.status(401).json({ error: "Session expired. Please try again later." });

        } else if (analysis.action === "HONEYPOT") {
            const sessionId = `sess_${Date.now()}`;
            const session = await Session.create({
                username,
                sessionId,
                meta: fullMeta,
                analysis,
                isHoneypot: true
            });

            // Log to SecurityIncident so the SOC map and analytics pick it up
            await SecurityIncident.create({
                username,
                ip: fullMeta.ip,
                country: fullMeta.geo?.country,
                city: fullMeta.geo?.city,
                asn: fullMeta.geo?.org,
                isp: fullMeta.geo?.org,
                lat: fullMeta.geo?.lat,
                lng: fullMeta.geo?.lng,
                browser: fullMeta.browser,
                os: fullMeta.os,
                device: fullMeta.device,
                fingerprint: fullMeta.fingerprint,
                anomalyScore: analysis.finalScore,
                reason: analysis.reason
            });

            await HoneypotLog.create({
                sessionId,
                username,
                ip: fullMeta.ip,
                geo: fullMeta.geo,
                device: fullMeta.device,
                browser: fullMeta.browser,
                os: fullMeta.os,
                fingerprint: fullMeta.fingerprint,
                anomalyScore: analysis.finalScore,
                pagesVisited: [],
                actionsPerformed: []
            });

            // Simulated attacks: incident is logged but login is blocked — no dashboard access
            if (fullMeta.geo?.source === 'simulated') {
                return res.status(401).json({ error: "Session expired. Please try again later." });
            }

            return res.json({ success: true, isHoneypot: true, sessionId, analysis });

        } else {
            // Legitimate user — update their profile and allow in
            updateUserProfile(username, fullMeta);

            // Save to Baseline if it's a realistic login (or even if we are building it)
            if (analysis.finalScore < 0.55 || baselines.length < 8) {
                await Baseline.create({ username, features: targetFeatures });
            }

            const sessionId = `sess_${Date.now()}`;
            const session = await Session.create({
                username,
                sessionId,
                meta: fullMeta,
                analysis,
                isHoneypot: false
            });

            return res.json({ success: true, isHoneypot: false, sessionId, analysis, user: { username, role: user.role } });
        }

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/unlock-all', async (req, res) => {
    try {
        await User.updateMany({}, {
            $set: {
                accountLocked: false,
                unlockAt: null,
                failedAttempts: 0,
                lockReason: null,
                lockTime: null
            }
        });
        res.json({ success: true, message: 'All accounts unlocked successfully' });
    } catch (error) {
        console.error('Unlock error:', error);
        res.status(500).json({ error: 'Internal server error during unlock' });
    }
});

export default router;
