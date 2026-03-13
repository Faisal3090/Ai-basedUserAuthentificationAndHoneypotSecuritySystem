import { useState, useCallback, useEffect } from 'react';
import { api } from '../services/api';
import { collectRealMeta, collectAttackMeta, parseBrowser, parseOS, parseDevice, getScreen, getHardware, getTZ, getCanvasFingerprint } from '../services/deviceFingerprint';
import { initBehaviorTracking } from '../services/behaviorCollector';
import DevicePreview from './DevicePreview';

export default function Login({ onLoginComplete }) {
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadMsg, setLoadMsg] = useState("");
    const [attackMode, setAttackMode] = useState(false);
    const [preview, setPreview] = useState(null);
    const [ipStatus, setIpStatus] = useState("fetching");
    const [tracker, setTracker] = useState(null);

    useEffect(() => {
        const t = initBehaviorTracking();
        setTracker(t);
        return () => t.cleanup();
    }, []);

    useEffect(() => {
        const ua = navigator.userAgent, scr = getScreen(), tz = getTZ(), hw = getHardware(), fp = getCanvasFingerprint();
        setPreview({
            browser: parseBrowser(ua), os: parseOS(ua), device: parseDevice(ua),
            screen: `${scr.width}×${scr.height}`, pixelRatio: `${scr.pixelRatio}x DPR`,
            colorDepth: `${scr.colorDepth}-bit`, orientation: scr.orientation,
            timezone: tz.name, tzOffset: `UTC${tz.offset <= 0 ? "+" : "-"}${Math.abs(tz.offset / 60)}`,
            fingerprint: fp, platform: hw.platform, cpuCores: String(hw.cpuCores),
            deviceMemory: hw.deviceMemory, languages: hw.languages,
            touch: navigator.maxTouchPoints > 0 ? `Yes (${navigator.maxTouchPoints} pts)` : "No",
            ip: "Fetching...", location: "Fetching...", org: "Fetching...", ipSource: ""
        });

        api.getIpInfo().then(g => {
            setPreview(prev => ({
                ...prev,
                ip: g.ip,
                location: [g.city, g.region, g.country].filter(x => x && x !== "unknown" && x !== "?").join(", ") || "unknown",
                org: g.org || "unknown",
                ipSource: g.source || "server proxy",
            }));
            setIpStatus("success");
        }).catch(() => {
            setPreview(prev => ({
                ...prev,
                ip: "Could not resolve", location: "Could not resolve", org: "Could not resolve", ipSource: "All APIs failed",
            }));
            setIpStatus("failed");
        });
    }, []);

    const handleLogin = useCallback(async () => {
        if (!form.username || !form.password) { setError("Enter credentials"); return; }
        setLoading(true); setError("");

        setLoadMsg("COLLECTING BEHAVIORAL METADATA...");
        const meta = attackMode
            ? await collectAttackMeta(tracker.state)
            : await collectRealMeta(tracker.state);

        // Inject username to help backend track login frequency by user and circumvent localhost IP mapping
        meta.username = form.username;

        setLoadMsg("EVALUATING WITH ML ISOLATION FOREST...");
        try {
            const response = await api.login(form.username, form.password, meta);
            onLoginComplete(response);
        } catch (err) {
            try {
                const parsed = JSON.parse(err.message);
                if (parsed.status === "locked") {
                    setError(`locked:${parsed.reason}|${parsed.ip}|${parsed.country}|${parsed.score || ""}`);
                } else {
                    setError(err.message);
                }
            } catch (e) {
                setError(err.message);
            }
        } finally {
            setLoading(false);
            tracker.reset();
        }
    }, [form, attackMode, tracker, onLoginComplete]);

    const S = {
        page: { minHeight: "100vh", background: "#050a0f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Courier New',monospace", position: "relative", overflow: "hidden" },
        grid: { position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,255,100,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,100,0.04) 1px,transparent 1px)", backgroundSize: "40px 40px" },
        card: { background: "rgba(0,20,10,0.92)", border: "1px solid #1a3a2a", borderTop: "2px solid #00ff64", padding: 24 },
    };

    return (
        <div style={S.page}>
            <div style={S.grid} />
            <div style={{ width: "min(1000px,96vw)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, position: "relative", zIndex: 10, padding: 16 }}>
                <div>
                    <div style={{ textAlign: "center", marginBottom: 22 }}>
                        <div style={{ color: "#00ff64", fontSize: 11, letterSpacing: "0.28em", marginBottom: 4 }}>BEHAVIORAL AUTHENTICATION SYSTEM</div>
                        <div style={{ color: "#1a4a2a", fontSize: 8, letterSpacing: "0.18em" }}>REAL-TIME DEVICE FINGERPRINTING ACTIVE</div>
                    </div>
                    <div style={S.card}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, padding: "9px 12px", background: attackMode ? "rgba(255,50,50,0.08)" : "rgba(0,255,100,0.04)", border: `1px solid ${attackMode ? "rgba(255,50,50,0.3)" : "rgba(0,255,100,0.12)"}` }}>
                            <div>
                                <div style={{ color: attackMode ? "#ff4444" : "#00ff64", fontSize: 9, fontWeight: "bold", letterSpacing: "0.12em" }}>{attackMode ? "⚠ ATTACK SIMULATION" : "● NORMAL MODE"}</div>
                                <div style={{ color: "#4a6a5a", fontSize: 8, marginTop: 2 }}>{attackMode ? "Spoofed IP + bot behavior injected" : "Your real device is fingerprinted"}</div>
                            </div>
                            <button onClick={() => setAttackMode(!attackMode)} style={{ background: attackMode ? "rgba(255,50,50,0.15)" : "rgba(0,255,100,0.08)", border: `1px solid ${attackMode ? "#ff4444" : "#00ff64"}`, color: attackMode ? "#ff4444" : "#00ff64", padding: "4px 10px", cursor: "pointer", fontSize: 8, letterSpacing: "0.1em", fontFamily: "'Courier New',monospace" }}>
                                {attackMode ? "DEACTIVATE" : "SIMULATE ATTACK"}
                            </button>
                        </div>

                        <div style={{ marginBottom: 14 }}>
                            <label style={{ color: "#4a7a5a", fontSize: 8, letterSpacing: "0.2em", display: "block", marginBottom: 5 }}>USERNAME</label>
                            <input type="text" value={form.username} onChange={e => { tracker?.onType(); setForm(p => ({ ...p, username: e.target.value })); }} placeholder="admin / alice / bob"
                                style={{ width: "100%", background: "rgba(0,255,100,0.03)", border: "1px solid #1a3a2a", borderBottom: "1px solid #00ff64", color: "#00ff64", padding: "9px 11px", fontSize: 12, fontFamily: "'Courier New',monospace", outline: "none", boxSizing: "border-box" }} />
                        </div>
                        <div style={{ marginBottom: 18 }}>
                            <label style={{ color: "#4a7a5a", fontSize: 8, letterSpacing: "0.2em", display: "block", marginBottom: 5 }}>PASSWORD</label>
                            <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="••••••••"
                                style={{ width: "100%", background: "rgba(0,255,100,0.03)", border: "1px solid #1a3a2a", borderBottom: "1px solid #00ff64", color: "#00ff64", padding: "9px 11px", fontSize: 12, fontFamily: "'Courier New',monospace", outline: "none", boxSizing: "border-box" }} />
                        </div>

                        {error && error.startsWith("locked:") ? (() => {
                            const [reason, ip, country, score] = error.replace("locked:", "").split("|");
                            return (
                                <div style={{ color: "#ff4444", fontSize: 9, marginBottom: 12, padding: "12px", background: "rgba(255,0,0,0.08)", border: "1px solid rgba(255,0,0,0.4)" }}>
                                    <div style={{ fontSize: 11, fontWeight: "bold", letterSpacing: "0.1em", marginBottom: 6 }}>⚠ SECURITY ALERT</div>
                                    <div style={{ marginBottom: 6 }}>Your account has been locked due to a high risk login attempt.</div>
                                    <div style={{ color: "#ff9999", fontSize: 8 }}>
                                        Reason: {reason}<br />
                                        IP: {ip}<br />
                                        Location: {country}
                                        {score && <><br />Score: {score}</>}
                                    </div>
                                </div>
                            );
                        })() : error ? (
                            <div style={{ color: "#ff4444", fontSize: 9, marginBottom: 12, padding: "6px 10px", background: "rgba(255,0,0,0.05)", border: "1px solid rgba(255,0,0,0.2)" }}>✗ {error}</div>
                        ) : null}

                        <button onClick={handleLogin} disabled={loading} style={{ width: "100%", padding: 12, background: loading ? "rgba(0,255,100,0.04)" : attackMode ? "rgba(255,50,50,0.12)" : "rgba(0,255,100,0.08)", border: `1px solid ${attackMode ? "#ff4444" : "#00ff64"}`, color: attackMode ? "#ff4444" : "#00ff64", fontSize: 10, letterSpacing: "0.2em", cursor: loading ? "wait" : "pointer", fontFamily: "'Courier New',monospace" }}>
                            {loading ? loadMsg : "AUTHENTICATE"}
                        </button>

                        <div style={{ marginTop: 14, padding: "9px 11px", background: "rgba(0,0,0,0.3)", border: "1px solid #0a2a1a" }}>
                            <div style={{ color: "#2a5a3a", fontSize: 7, letterSpacing: "0.15em", marginBottom: 5 }}>DEMO CREDENTIALS — click to fill (admin, alice, bob)</div>
                            {[["admin", "admin123"], ["alice", "alice456"], ["bob", "bob789"]].map(([u, p]) => (
                                <div key={u} style={{ display: "flex", gap: 8, marginBottom: 3, cursor: "pointer" }} onClick={() => setForm({ username: u, password: p })}>
                                    <span style={{ color: "#00ff64", fontSize: 10, opacity: 0.8, fontFamily: "monospace" }}>{u}</span>
                                    <span style={{ color: "#2a5a3a", fontSize: 10 }}>/</span>
                                    <span style={{ color: "#4a8a6a", fontSize: 10, fontFamily: "monospace" }}>{p}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div>
                    <DevicePreview previewData={preview} ipStatus={ipStatus} />
                </div>
            </div>
        </div>
    );
}
