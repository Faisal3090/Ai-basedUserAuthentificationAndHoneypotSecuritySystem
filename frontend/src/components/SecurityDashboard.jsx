import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import 'leaflet/dist/leaflet.css';

export default function SecurityDashboard({ onLogout }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getSecurityStats()
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(console.error);
    }, []);

    if (loading) {
        return <div style={{ minHeight: "100vh", background: "#050a0f", color: "#00ff64", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace" }}>INITIALIZING SOC DASHBOARD...</div>;
    }

    const { attacks, timeline, countries, asn, recent } = stats;

    return (
        <div style={{ minHeight: "100vh", background: "#050a0f", fontFamily: "'Inter', system-ui, sans-serif", color: "#c9d1d9" }}>
            {/* Header */}
            <div style={{ background: "#161b22", borderBottom: "1px solid #30363d", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#c92a2a,#fa5252)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🛡</div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 16, color: "#fff", letterSpacing: "0.02em" }}>Security Operations Center // SOC</div>
                        <div style={{ fontSize: 11, color: "#ff8787", fontFamily: "monospace", letterSpacing: "0.05em" }}>LIVE THREAT INTELLIGENCE</div>
                    </div>
                </div>
                <button onClick={onLogout} style={{ background: "transparent", border: "1px solid #30363d", color: "#8b949e", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 500 }}>EXIT SOC</button>
            </div>

            <div style={{ padding: 24, paddingBottom: 40, maxWidth: 1400, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>

                {/* Top Section - Map */}
                <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 10, overflow: "hidden", height: 400, position: "relative" }}>
                    <div style={{ position: "absolute", top: 16, left: 20, zIndex: 400, background: "rgba(13,17,23,0.85)", backdropFilter: "blur(4px)", padding: "8px 14px", borderRadius: 6, border: "1px solid #30363d", color: "#fff", fontWeight: 600, fontSize: 13, display: "flex", gap: 10, alignItems: "center" }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#fa5252", boxShadow: "0 0 10px #fa5252" }}></span>
                        ATTACK ORIGINS (World Map)
                    </div>
                    <MapContainer center={[20, 0]} zoom={2} style={{ height: "100%", width: "100%", background: "#020408" }}>
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
                        />
                        {attacks.map((attack, i) => (
                            attack.lat && attack.lng ? (
                                <CircleMarker
                                    key={i}
                                    center={[attack.lat, attack.lng]}
                                    radius={Math.max(4, attack.score * 10)}
                                    fillOpacity={0.6}
                                    color={attack.score > 0.8 ? "#ff2a2a" : "#fa5252"}
                                    weight={1}
                                >
                                    <Popup>
                                        <div style={{ background: "#161b22", color: "#c9d1d9", padding: "4px 2px", fontFamily: "monospace" }}>
                                            <div style={{ color: "#fa5252", fontWeight: "bold", marginBottom: 4 }}>Risk Score: {attack.score}</div>
                                            <div>IP: {attack.ip}</div>
                                            <div>Loc: {attack.country}</div>
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            ) : null
                        ))}
                    </MapContainer>
                </div>

                {/* Middle Section - Charts */}
                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: 24, height: 320 }}>

                    {/* Timeline Chart */}
                    <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 10, padding: 20 }}>
                        <h2 style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 16 }}>ATTACK TIMELINE (Last 24h)</h2>
                        <ResponsiveContainer width="100%" height="85%">
                            <LineChart data={timeline}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
                                <XAxis dataKey="hour" stroke="#8b949e" fontSize={11} tickMargin={10} />
                                <YAxis stroke="#8b949e" fontSize={11} allowDecimals={false} />
                                <RechartsTooltip contentStyle={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 6, color: "#fff", fontSize: 12 }} />
                                <Line type="monotone" dataKey="attacks" stroke="#fa5252" strokeWidth={3} dot={{ r: 3, fill: "#fa5252", strokeWidth: 0 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Top Countries */}
                    <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 10, padding: 20 }}>
                        <h2 style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 16 }}>TOP COUNTRIES</h2>
                        <ResponsiveContainer width="100%" height="85%">
                            <BarChart data={countries} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" horizontal={false} />
                                <XAxis type="number" stroke="#8b949e" fontSize={11} />
                                <YAxis dataKey="country" type="category" stroke="#8b949e" fontSize={11} width={80} />
                                <RechartsTooltip cursor={{ fill: "rgba(255,255,255,0.05)" }} contentStyle={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 6, color: "#fff", fontSize: 12 }} />
                                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Top ASNs */}
                    <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 10, padding: 20 }}>
                        <h2 style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 16 }}>TOP ASN / NETWORKS</h2>
                        <ResponsiveContainer width="100%" height="85%">
                            <BarChart data={asn} layout="vertical" margin={{ left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" horizontal={false} />
                                <XAxis type="number" stroke="#8b949e" fontSize={11} />
                                <YAxis dataKey="asn" type="category" stroke="#8b949e" fontSize={10} width={90} />
                                <RechartsTooltip cursor={{ fill: "rgba(255,255,255,0.05)" }} contentStyle={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 6, color: "#fff", fontSize: 12 }} />
                                <Bar dataKey="count" fill="#eab308" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                </div>

                {/* Bottom Section - Recent Incidents Table */}
                <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 10, padding: 20 }}>
                    <h2 style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 16 }}>RECENT INCIDENTS & HIGH-RISK LOGINS</h2>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, textAlign: "left" }}>
                            <thead>
                                <tr style={{ background: "#161b22", color: "#8b949e", textTransform: "uppercase", fontSize: 10, letterSpacing: "0.05em" }}>
                                    <th style={{ padding: "12px 14px", fontWeight: 600, borderRadius: "6px 0 0 6px" }}>Time</th>
                                    <th style={{ padding: "12px 14px", fontWeight: 600 }}>Target User</th>
                                    <th style={{ padding: "12px 14px", fontWeight: 600 }}>IP & Location</th>
                                    <th style={{ padding: "12px 14px", fontWeight: 600 }}>Network (ASN)</th>
                                    <th style={{ padding: "12px 14px", fontWeight: 600 }}>Browser / Device</th>
                                    <th style={{ padding: "12px 14px", fontWeight: 600, borderRadius: "0 6px 6px 0", textAlign: "right" }}>Risk Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent.length === 0 && <tr><td colSpan={6} style={{ padding: 30, textAlign: "center", color: "#8b949e" }}>No security incidents captured yet.</td></tr>}
                                {recent.map((row, idx) => (
                                    <tr key={row.id} style={{ borderBottom: idx !== recent.length - 1 ? "1px solid #21262d" : "none" }}>
                                        <td style={{ padding: "14px", color: "#8b949e", whiteSpace: "nowrap" }}>
                                            {new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </td>
                                        <td style={{ padding: "14px", fontWeight: 500, color: "#fff" }}>{row.username}</td>
                                        <td style={{ padding: "14px" }}>
                                            <div style={{ color: "#fa5252", fontFamily: "monospace", fontSize: 11 }}>{row.ip}</div>
                                            <div style={{ color: "#8b949e", fontSize: 10 }}>{row.country || "Unknown"}</div>
                                        </td>
                                        <td style={{ padding: "14px", color: "#c9d1d9", maxWidth: 180, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={row.asn}>
                                            {row.asn || "Unknown"}
                                        </td>
                                        <td style={{ padding: "14px" }}>
                                            <div style={{ color: "#c9d1d9" }}>{row.browser}</div>
                                            <div style={{ color: "#8b949e", fontSize: 10 }}>{row.device}</div>
                                        </td>
                                        <td style={{ padding: "14px", textAlign: "right" }}>
                                            <span style={{ background: row.score > 0.85 ? "rgba(250,82,82,0.15)" : "rgba(250,176,5,0.15)", color: row.score > 0.85 ? "#fa5252" : "#fab005", padding: "4px 8px", borderRadius: 4, fontWeight: 700, fontSize: 11 }}>
                                                {(row.score * 100).toFixed(1)}% RISK
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}
