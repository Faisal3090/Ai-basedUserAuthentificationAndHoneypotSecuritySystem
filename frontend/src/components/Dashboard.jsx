import { useState, useEffect } from 'react';
import { api } from '../services/api';
import DevicePreview from './DevicePreview';
import { parseBrowser, parseOS, parseDevice, getScreen, getHardware, getTZ, getCanvasFingerprint } from '../services/deviceFingerprint';
import LoginSessionChart from './LoginSessionChart';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function Dashboard({ currentUser, role, onLogout, onOpenSOC }) {
    const [tab, setTab] = useState("overview");
    const [sessions, setSessions] = useState([]);
    const [hpLogs, setHpLogs] = useState([]);
    const [selSess, setSelSess] = useState(null);
    const [attacks, setAttacks] = useState([]);

    // Live Preview State (moved from Login)
    const [preview, setPreview] = useState(null);
    const [ipStatus, setIpStatus] = useState("fetching");

    useEffect(() => {
        // Load data from backend
        api.getSessions().then(setSessions).catch(console.error);
        api.getHoneypotLogs().then(setHpLogs).catch(console.error);
        fetch('/api/security/attacks').then(r => r.json()).then(setAttacks).catch(console.error);

        // Live Data Collection
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

    const normalS  = sessions.filter(s => !s.isHoneypot && s.status !== 'bot-attack');
    const susS     = sessions.filter(s =>  s.isHoneypot);
    const botAttks = sessions.filter(s =>  s.status === 'bot-attack');

    return (
        <div style={{ minHeight: "100vh", background: "#050a0f", fontFamily: "'Courier New',monospace", color: "#c9d1d9" }}>
            <style>{`
                .dash-grid { display: grid; grid-template-columns: repeat(5,1fr); gap: 14px; margin-bottom: 24px; }
                .info-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; }
                .hp-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 9px; margin-bottom: 12px; }
                .analysis-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 18px; }
                @media (max-width: 900px) {
                    .dash-grid, .info-grid, .hp-grid { grid-template-columns: repeat(2,1fr); }
                    .analysis-grid { grid-template-columns: 1fr; }
                }
                @media (max-width: 600px) {
                    .dash-grid, .hp-grid { grid-template-columns: 1fr; }
                    .info-grid { grid-template-columns: repeat(2,1fr); gap: 6px; }
                    .nav-bar-container { flex-direction: column; height: auto !important; padding: 12px 20px !important; gap: 12px; }
                    .nav-buttons-container { flex-wrap: wrap; justify-content: center; }
                    .header-title-container { flex-wrap: wrap; justify-content: center; }
                    .nav-btn { padding: 10px 12px !important; font-size: 8px !important; }
                }
            `}</style>
            <div className="nav-bar-container" style={{ background: "rgba(0,20,10,0.95)", borderBottom: "1px solid #1a3a2a", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
                <div className="header-title-container" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ color: "#00ff64", fontSize: 11, letterSpacing: "0.2em", fontWeight: "bold" }}>◈ BEHAVIORAL AUTH SYSTEM</span>
                    <span style={{ fontSize: 7, color: "#00ff64", background: "rgba(0,255,100,0.1)", border: "1px solid rgba(0,255,100,0.2)", padding: "2px 7px", letterSpacing: "0.15em" }}>LIVE MONITORING</span>
                </div>
                <div className="nav-buttons-container" style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <span style={{ fontSize: 9, color: "#4a8a6a" }}>SESSION: <span style={{ color: "#00ff64" }}>{currentUser?.toUpperCase()}</span></span>
                    {role === "admin" && (
                        <button onClick={onOpenSOC} style={{ background: "rgba(250,82,82,0.1)", border: "1px solid #fa5252", color: "#fa5252", padding: "4px 11px", cursor: "pointer", fontSize: 8, fontFamily: "'Courier New',monospace", fontWeight: "bold" }}>SOC DASHBOARD</button>
                    )}
                    {role === "admin" && (
                        <button onClick={() => {
                            fetch('/api/auth/unlock-all', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
                                .then(r => r.json())
                                .then(() => alert('✓ All accounts unlocked'))
                                .catch(() => alert('✗ Unlock failed — check backend'));
                        }} style={{ background: "rgba(0,255,100,0.07)", border: "1px solid #1a5a3a", color: "#00cc50", padding: "4px 11px", cursor: "pointer", fontSize: 8, fontFamily: "'Courier New',monospace" }}>UNLOCK ALL</button>
                    )}
                    <button onClick={onLogout} style={{ background: "transparent", border: "1px solid #1a3a2a", color: "#4a7a5a", padding: "4px 11px", cursor: "pointer", fontSize: 8, fontFamily: "'Courier New',monospace" }}>LOGOUT</button>
                </div>
            </div>
            <div className="nav-buttons-container" style={{ background: "rgba(0,15,8,0.8)", borderBottom: "1px solid #0a2a1a", padding: "0 28px", display: "flex" }}>
                {["overview", "sessions", "honeypot", "analysis"].map(t => (
                    <button className="nav-btn" key={t} onClick={() => setTab(t)} style={{ padding: "11px 20px", background: "transparent", border: "none", borderBottom: tab === t ? "2px solid #00ff64" : "2px solid transparent", color: tab === t ? "#00ff64" : "#4a7a5a", fontSize: 9, letterSpacing: "0.15em", cursor: "pointer", textTransform: "uppercase", fontFamily: "'Courier New',monospace" }}>{t}</button>
                ))}
            </div>

            <div style={{ padding: "24px 28px", maxWidth: 1280, margin: "0 auto" }}>
                {tab === "overview" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
                        <div>
                            <div className="dash-grid">
                                {[{ l: "TOTAL LOGINS", v: sessions.length, c: "#00ff64", i: "◈" }, { l: "NORMAL SESSIONS", v: normalS.length, c: "#00cc50", i: "✓" }, { l: "SUSPICIOUS", v: susS.length, c: "#ff6644", i: "⚠" }, { l: "HONEYPOT TRIGGERS", v: hpLogs.length, c: "#ffaa00", i: "🕵" }, { l: "BOT ATTACKS", v: botAttks.length, c: "#ff2244", i: "⚡" }].map(s => (
                                    <div key={s.l} style={{ background: "rgba(0,20,10,0.8)", border: "1px solid #1a3a2a", borderTop: `2px solid ${s.c}`, padding: "16px 18px" }}>
                                        <div style={{ fontSize: 20, marginBottom: 6 }}>{s.i}</div>
                                        <div style={{ fontSize: 30, fontWeight: "bold", color: s.c, marginBottom: 3 }}>{s.v}</div>
                                        <div style={{ fontSize: 7, letterSpacing: "0.2em", color: "#4a7a5a" }}>{s.l}</div>
                                    </div>
                                ))}
                            </div>
                            {sessions.length > 0 && (
                                <div style={{ background: "rgba(0,20,10,0.8)", border: "1px solid #1a3a2a", padding: 20, marginBottom: 18 }}>
                                    <div style={{ color: "#00ff64", fontSize: 8, letterSpacing: "0.2em", marginBottom: 12 }}>YOUR REAL DEVICE — LAST LOGIN</div>
                                    <div className="info-grid">
                                        {[
                                            ["IP", sessions[0]?.meta.ip],
                                            ["LOCATION", `${sessions[0]?.meta.geo?.city || '?'}, ${sessions[0]?.meta.geo?.country || '?'}`],
                                            ["BROWSER", sessions[0]?.meta.browser],
                                            ["OS", sessions[0]?.meta.os],
                                            ["DEVICE", sessions[0]?.meta.device],
                                            ["SCREEN", `${sessions[0]?.meta.screenWidth}×${sessions[0]?.meta.screenHeight}`],
                                            ["TIMEZONE", sessions[0]?.meta.timezoneName],
                                            ["CANVAS FP", sessions[0]?.meta.fingerprint]
                                        ].map(([k, v]) => (
                                            <div key={k} style={{ background: "rgba(0,0,0,0.3)", padding: "7px 9px" }}>
                                                <div style={{ fontSize: 7, color: "#3a7a5a", letterSpacing: "0.1em", marginBottom: 2 }}>{k}</div>
                                                <div style={{ fontSize: 9, color: "#00ff64" }}>{v || "—"}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div style={{ background: "rgba(255,42,42,0.04)", border: "1px solid rgba(255,100,68,0.2)", padding: 16 }}>
                                <div style={{ color: "#ff6644", fontSize: 8, letterSpacing: "0.2em", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ff2a2a", display: "inline-block", boxShadow: "0 0 7px #ff2a2a" }} />
                                    SOC GLOBAL THREAT MAP
                                    <span style={{ marginLeft: "auto", fontSize: 7, color: "#7a4a4a", letterSpacing: "0.1em" }}>{attacks.length} EVENTS</span>
                                </div>
                                {attacks.length === 0 ? (
                                    <div style={{ padding: "32px 0", textAlign: "center", color: "#5a3a3a", fontSize: 9, letterSpacing: "0.1em", border: "1px dashed rgba(255,100,68,0.15)" }}>
                                        NO ATTACK EVENTS RECORDED
                                    </div>
                                ) : (
                                    <div style={{ height: 300, overflow: "hidden", border: "1px solid rgba(255,42,42,0.2)" }}>
                                        <MapContainer center={[20, 0]} zoom={2} style={{ height: "100%", width: "100%", background: "#020408" }} zoomControl={false} attributionControl={false}>
                                            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                                            {attacks.map((a, i) => a.lat && a.lng ? (
                                                <CircleMarker
                                                    key={i}
                                                    center={[a.lat, a.lng]}
                                                    radius={Math.max(4, (a.score || 0) * 10)}
                                                    fillOpacity={0.7}
                                                    color={a.score > 0.8 ? "#ff2a2a" : "#fa5252"}
                                                    weight={1}
                                                >
                                                    <Popup>
                                                        <div style={{ background: "#0d1117", color: "#c9d1d9", padding: "6px 4px", fontFamily: "'Courier New',monospace", fontSize: 10, minWidth: 160 }}>
                                                            <div style={{ color: "#fa5252", fontWeight: "bold", marginBottom: 5 }}>⚠ THREAT DETECTED</div>
                                                            <div style={{ marginBottom: 2 }}>IP: <span style={{ color: "#ff8080" }}>{a.ip}</span></div>
                                                            <div style={{ marginBottom: 2 }}>Country: <span style={{ color: "#c9d1d9" }}>{a.country || "Unknown"}</span></div>
                                                            <div style={{ marginBottom: 2 }}>Score: <span style={{ color: a.score > 0.8 ? "#ff2a2a" : "#fa5252", fontWeight: "bold" }}>{a.score}</span></div>
                                                            <div style={{ color: "#4a7a5a", fontSize: 9 }}>{new Date(a.timestamp).toLocaleString()}</div>
                                                        </div>
                                                    </Popup>
                                                </CircleMarker>
                                            ) : null)}
                                        </MapContainer>
                                    </div>
                                )}
                            </div>
                            <LoginSessionChart />
                        </div>
                        <div style={{ position: "sticky", top: 24, height: "fit-content" }}>
                             <DevicePreview previewData={preview} ipStatus={ipStatus} />
                        </div>
                    </div>
                )}

                {tab === "sessions" && (
                    <div>
                        <div style={{ color: "#4a8a6a", fontSize: 8, letterSpacing: "0.2em", marginBottom: 16 }}>ALL LOGIN SESSIONS // {sessions.length} TOTAL</div>
                        {sessions.length === 0 && <div style={{ color: "#2a5a3a", textAlign: "center", padding: 50, border: "1px dashed #1a3a2a" }}>No sessions yet. Login to create one.</div>}
                        {sessions.map(s => {
                            const isBotAttack = s.status === 'bot-attack';
                            const borderColor = isBotAttack ? "rgba(255,34,68,0.5)" : s.isHoneypot ? "rgba(255,100,68,0.4)" : "rgba(0,255,100,0.15)";
                            const accentColor = isBotAttack ? "#ff2244" : s.isHoneypot ? "#ff6644" : "#00ff64";
                            const badgeLabel  = isBotAttack ? "⚡ BOT ATTACK" : s.isHoneypot ? "⚠ HONEYPOT" : "✓ NORMAL";
                            return (
                            <div key={s.sessionId} onClick={() => setSelSess(selSess?.sessionId === s.sessionId ? null : s)} style={{ background: isBotAttack ? "rgba(40,0,10,0.85)" : "rgba(0,20,10,0.8)", border: `1px solid ${borderColor}`, borderLeft: `3px solid ${accentColor}`, padding: "12px 16px", marginBottom: 7, cursor: "pointer" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                                        <span style={{ fontSize: 8, color: accentColor }}>{badgeLabel}</span>
                                        <span style={{ fontSize: 11, color: "#c9d1d9" }}>{s.username}</span>
                                        <span style={{ fontSize: 9, color: "#4a7a5a" }}>{s.meta.ip}</span>
                                        <span style={{ fontSize: 9, color: "#4a7a5a" }}>{s.meta.geo?.city}, {s.meta.geo?.countryCode}</span>
                                        <span style={{ fontSize: 9, color: "#3a6a5a" }}>{s.meta.browser}</span>
                                    </div>
                                    <div style={{ display: "flex", gap: 12 }}>
                                        <span style={{ fontSize: 9, color: s.analysis.score > 0.62 ? "#ff6644" : "#00ff64" }}>Score: {s.analysis.score}</span>
                                        <span style={{ fontSize: 8, color: "#4a7a5a" }}>{new Date(s.createdAt).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                                {selSess?.sessionId === s.sessionId && (
                                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #1a3a2a" }}>
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 9 }}>
                                            {[["Browser", s.meta.browser], ["OS", s.meta.os], ["Device", s.meta.device], ["Screen", `${s.meta.screenWidth}×${s.meta.screenHeight}`], ["Canvas FP", s.meta.fingerprint], ["Timezone", s.meta.timezoneName], ["Typing Speed", `${s.meta.typingSpeed} c/min`], ["Mouse Events", String(s.meta.mouseMovements)], ["Submit Time", `${(s.meta.formSubmitTime / 1000).toFixed(2)}s`], ["Anomaly Reason", s.analysis.reason]].map(([k, v]) => (
                                                <div key={k} style={{ background: "rgba(0,0,0,0.3)", padding: "6px 9px" }}>
                                                    <div style={{ fontSize: 7, color: "#4a7a5a", letterSpacing: "0.1em", marginBottom: 2 }}>{k}</div>
                                                    <div style={{ fontSize: 9, color: "#a9c9b9" }}>{v}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            );
                        })}
                    </div>
                )}

                {tab === "honeypot" && (
                    <div>
                        <div style={{ color: "#ff6644", fontSize: 8, letterSpacing: "0.2em", marginBottom: 16 }}>HONEYPOT ACTIVATIONS // {hpLogs.length} CAPTURED</div>
                        {hpLogs.length === 0 && <div style={{ color: "#4a3a2a", textAlign: "center", padding: 50, border: "1px dashed #3a2a1a" }}>No honeypot activations yet. Use attack simulation to trigger.</div>}
                        {hpLogs.map(log => (
                            <div key={log.sessionId} style={{ background: "rgba(30,10,5,0.8)", border: "1px solid rgba(255,100,68,0.3)", borderLeft: "3px solid #ff6644", padding: "16px 20px", marginBottom: 14 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                                    <div>
                                        <div style={{ color: "#ff6644", fontSize: 11, fontWeight: "bold", marginBottom: 3 }}>🕵 ATTACKER CAPTURED — {log.username.toUpperCase()}</div>
                                        <div style={{ fontSize: 8, color: "#7a5a4a" }}>Session: {log.sessionId}</div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ color: "#ffaa00", fontSize: 20, fontWeight: "bold" }}>{log.anomalyScore}</div>
                                        <div style={{ fontSize: 7, color: "#7a5a4a" }}>ANOMALY SCORE</div>
                                    </div>
                                </div>
                                <div className="hp-grid">
                                    {[["IP", log.ip], ["LOCATION", `${log.geo?.city}, ${log.geo?.country}`], ["DEVICE", log.device], ["BROWSER", log.browser], ["OS", log.os], ["FINGERPRINT", log.fingerprint], ["PAGES VISITED", String(log.pagesVisited.length)], ["DURATION", `${log.duration}s`]].map(([k, v]) => (
                                        <div key={k} style={{ background: "rgba(0,0,0,0.3)", padding: "6px 9px" }}>
                                            <div style={{ fontSize: 7, color: "#7a5a4a", letterSpacing: "0.1em", marginBottom: 2 }}>{k}</div>
                                            <div style={{ fontSize: 9, color: "#ffa090" }}>{v}</div>
                                        </div>
                                    ))}
                                </div>
                                {log.actionsPerformed.length > 0 && (
                                    <div style={{ background: "rgba(0,0,0,0.3)", padding: 9 }}>
                                        <div style={{ fontSize: 7, color: "#7a5a4a", letterSpacing: "0.1em", marginBottom: 5 }}>ACTIONS PERFORMED</div>
                                        {log.actionsPerformed.map((a, i) => (
                                            <div key={i} style={{ fontSize: 9, color: "#ff9070", padding: "2px 0", borderBottom: "1px solid #1a0a08" }}>
                                                <span style={{ color: "#5a2a2a", marginRight: 7 }}>{String(i + 1).padStart(2, "0")}</span>{a}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {tab === "analysis" && (
                    <div>
                        <div style={{ color: "#4a8a6a", fontSize: 8, letterSpacing: "0.2em", marginBottom: 16 }}>AI MODEL // ISOLATION FOREST</div>
                        <div className="analysis-grid">
                            <div style={{ background: "rgba(0,20,10,0.8)", border: "1px solid #1a3a2a", padding: 18 }}>
                                <div style={{ color: "#00ff64", fontSize: 8, letterSpacing: "0.2em", marginBottom: 12 }}>MODEL PARAMETERS</div>
                                {[["Algorithm", "Isolation Forest"], ["Trees", "50"], ["Sample Size", "32"], ["Max Depth", "8"], ["Anomaly Threshold", "0.62"], ["Feature Dimensions", "10"]].map(([k, v]) => (
                                    <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #0a2a1a", fontSize: 10 }}>
                                        <span style={{ color: "#4a7a5a" }}>{k}</span><span style={{ color: "#00ff64" }}>{v}</span>
                                    </div>
                                ))}
                            </div>
                            <div style={{ background: "rgba(0,20,10,0.8)", border: "1px solid #1a3a2a", padding: 18 }}>
                                <div style={{ color: "#00ff64", fontSize: 8, letterSpacing: "0.2em", marginBottom: 12 }}>REAL FEATURES COLLECTED</div>
                                {[["Login Hour", "Time-of-day from browser clock"], ["Typing Speed", "Measured from your keypress timing"], ["Form Submit Time", "Real interaction duration"], ["Mouse Movements", "Your actual cursor event count"], ["Screen Resolution", "Real display dimensions"], ["Timezone Offset", "Browser Intl API timezone"], ["Touch Device", "Hardware capability detection"], ["IP Octets", "Network address segments"]].map(([f, d]) => (
                                    <div key={f} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #0a2a1a", fontSize: 9, gap: 8 }}>
                                        <span style={{ color: "#4a9a6a", whiteSpace: "nowrap" }}>{f}</span>
                                        <span style={{ color: "#3a6a5a", fontSize: 8, textAlign: "right" }}>{d}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {sessions.length > 0 && (
                            <div style={{ background: "rgba(0,20,10,0.8)", border: "1px solid #1a3a2a", padding: 20 }}>
                                <div style={{ color: "#4a8a6a", fontSize: 8, letterSpacing: "0.2em", marginBottom: 16 }}>ANOMALY SCORE HISTORY</div>
                                {sessions.map(s => (
                                    <div key={s.sessionId} style={{ marginBottom: 14 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                            <span style={{ fontSize: 9, color: "#8a9a8a" }}>{s.username} — {s.meta.browser} — {s.meta.geo?.city}{s.isHoneypot && <span style={{ color: "#ff6644", marginLeft: 7 }}>HONEYPOT</span>}</span>
                                            <span style={{ fontSize: 10, color: s.analysis.score > 0.62 ? "#ff6644" : "#00ff64" }}>{s.analysis.score}</span>
                                        </div>
                                        <div style={{ background: "#0a2a1a", height: 6, borderRadius: 3, overflow: "hidden" }}>
                                            <div style={{ height: "100%", width: `${s.analysis.score * 100}%`, background: s.analysis.score > 0.62 ? "linear-gradient(90deg,#ff6644,#ff2200)" : "linear-gradient(90deg,#00aa40,#00ff64)", borderRadius: 3 }} />
                                        </div>
                                        <div style={{ fontSize: 8, color: "#4a7a5a", marginTop: 2 }}>{s.analysis.reason}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
