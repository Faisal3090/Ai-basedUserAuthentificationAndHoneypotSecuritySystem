import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Dashboard({ currentUser, role, onLogout, onOpenSOC }) {
    const [tab, setTab] = useState("overview");
    const [sessions, setSessions] = useState([]);
    const [hpLogs, setHpLogs] = useState([]);
    const [selSess, setSelSess] = useState(null);

    useEffect(() => {
        // Load data from backend
        api.getSessions().then(setSessions).catch(console.error);
        api.getHoneypotLogs().then(setHpLogs).catch(console.error);
    }, []);

    const normalS = sessions.filter(s => !s.isHoneypot);
    const susS = sessions.filter(s => s.isHoneypot);

    return (
        <div style={{ minHeight: "100vh", background: "#050a0f", fontFamily: "'Courier New',monospace", color: "#c9d1d9" }}>
            <style>{`
                .dash-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 24px; }
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
                    <div>
                        <div className="dash-grid">
                            {[{ l: "TOTAL LOGINS", v: sessions.length, c: "#00ff64", i: "◈" }, { l: "NORMAL SESSIONS", v: normalS.length, c: "#00cc50", i: "✓" }, { l: "SUSPICIOUS", v: susS.length, c: "#ff6644", i: "⚠" }, { l: "HONEYPOT TRIGGERS", v: hpLogs.length, c: "#ffaa00", i: "🕵" }].map(s => (
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
                        <div style={{ background: "rgba(255,100,68,0.05)", border: "1px solid rgba(255,100,68,0.2)", padding: 16 }}>
                            <div style={{ color: "#ff6644", fontSize: 8, letterSpacing: "0.2em", marginBottom: 8 }}>HOW TO TRIGGER HONEYPOT</div>
                            <div style={{ fontSize: 11, color: "#8a9a8a", lineHeight: 1.9 }}>
                                1. Login normally 2–3 times to build your behavioral baseline<br />
                                2. <strong style={{ color: "#ff6644" }}>LOGOUT</strong> → enable <strong style={{ color: "#ff6644" }}>SIMULATE ATTACK</strong> → login with same credentials<br />
                                3. Isolation Forest detects anomaly (fake IP + bot signals) → silently routes to honeypot<br />
                                4. Interact with fake admin dashboard → come back to see the attacker captured
                            </div>
                        </div>
                    </div>
                )}

                {tab === "sessions" && (
                    <div>
                        <div style={{ color: "#4a8a6a", fontSize: 8, letterSpacing: "0.2em", marginBottom: 16 }}>ALL LOGIN SESSIONS // {sessions.length} TOTAL</div>
                        {sessions.length === 0 && <div style={{ color: "#2a5a3a", textAlign: "center", padding: 50, border: "1px dashed #1a3a2a" }}>No sessions yet. Login to create one.</div>}
                        {sessions.map(s => (
                            <div key={s.sessionId} onClick={() => setSelSess(selSess?.sessionId === s.sessionId ? null : s)} style={{ background: "rgba(0,20,10,0.8)", border: `1px solid ${s.isHoneypot ? "rgba(255,100,68,0.4)" : "rgba(0,255,100,0.15)"}`, borderLeft: `3px solid ${s.isHoneypot ? "#ff6644" : "#00ff64"}`, padding: "12px 16px", marginBottom: 7, cursor: "pointer" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                                        <span style={{ fontSize: 8, color: s.isHoneypot ? "#ff6644" : "#00ff64" }}>{s.isHoneypot ? "⚠ HONEYPOT" : "✓ NORMAL"}</span>
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
                        ))}
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
