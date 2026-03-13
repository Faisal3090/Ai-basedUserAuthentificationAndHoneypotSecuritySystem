import { useState } from 'react';
import { api } from '../services/api';

export default function Honeypot({ hpUser, sessionId, onLogout }) {
    const [hpPage, setHpPage] = useState("dashboard");

    const nav = [
        { id: "dashboard", label: "📊  Dashboard", path: "/admin/dashboard" },
        { id: "database", label: "🗄  Database", path: "/admin/database" },
        { id: "payments", label: "💳  Payments", path: "/admin/payments" },
        { id: "apikeys", label: "🔑  API Keys", path: "/admin/api-keys" }
    ];
    const rows = [{ id: "001", email: "john.doe@corp.com", role: "admin", login: "2026-03-07" }, { id: "002", email: "sarah.k@corp.com", role: "user", login: "2026-03-08" }, { id: "003", email: "mark.t@corp.com", role: "manager", login: "2026-03-06" }];
    const keys = [{ name: "Production API", key: "sk-prod-***3f8a", created: "2026-01-15", perms: "read/write" }, { name: "Analytics Key", key: "sk-anal-***7c2d", created: "2026-02-01", perms: "read" }];
    const txns = [{ id: "TXN-8821", amt: "$12,400", status: "Completed", date: "2026-03-08" }, { id: "TXN-8820", amt: "$3,200", status: "Pending", date: "2026-03-08" }, { id: "TXN-8819", amt: "$89,100", status: "Completed", date: "2026-03-07" }];

    const logHp = (action) => api.logHoneypotAction(sessionId, action, hpPage);

    return (
        <div style={{ minHeight: "100vh", background: "#0f1117", color: "#c9d1d9", fontFamily: "system-ui,sans-serif" }}>
            <div style={{ background: "#161b22", borderBottom: "1px solid #30363d", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 54 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#238636,#2ea043)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🛡</div>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>SecureAdmin Pro</span>
                    <span style={{ background: "#1f6feb", color: "#fff", fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>Enterprise</span>
                </div>
                <span style={{ fontSize: 12, color: "#8b949e" }}>Welcome, <strong style={{ color: "#c9d1d9" }}>{hpUser}</strong></span>
            </div>
            <div style={{ display: "flex", height: "calc(100vh - 54px)" }}>
                <div style={{ width: 210, background: "#161b22", borderRight: "1px solid #30363d", padding: "12px 0" }}>
                    {nav.map(item => (
                        <div key={item.id} onClick={() => { setHpPage(item.id); logHp(`Visited ${item.path}`); }} style={{ padding: "10px 18px", cursor: "pointer", fontSize: 13, background: hpPage === item.id ? "rgba(35,134,54,0.15)" : "transparent", borderLeft: hpPage === item.id ? "2px solid #238636" : "2px solid transparent", color: hpPage === item.id ? "#c9d1d9" : "#8b949e" }}>{item.label}</div>
                    ))}
                </div>
                <div style={{ flex: 1, padding: 28, overflow: "auto" }}>
                    {hpPage === "dashboard" && <div><h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 20 }}>Overview</h1><div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>{[["👥", "Users", "12,847"], ["💰", "Revenue", "$284,921"], ["🔗", "Sessions", "342"], ["⚡", "API/hr", "94,281"]].map(([i, l, v]) => <div key={l} style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 8, padding: 18 }}><div style={{ fontSize: 22, marginBottom: 6 }}>{i}</div><div style={{ fontSize: 20, fontWeight: 700, marginBottom: 3 }}>{v}</div><div style={{ fontSize: 11, color: "#8b949e" }}>{l}</div></div>)}</div></div>}
                    {hpPage === "database" && <div><h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 20 }}>Database Explorer</h1><div style={{ display: "flex", gap: 8, marginBottom: 16 }}>{["users", "transactions", "api_keys", "sessions", "audit_logs"].map(t => <button key={t} onClick={() => logHp(`Queried table: ${t}`)} style={{ background: "#21262d", border: "1px solid #30363d", color: "#c9d1d9", padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>{t}</button>)}</div><div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 8, overflow: "hidden" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}><thead><tr style={{ background: "#21262d" }}>{["ID", "Email", "Role", "Last Login", "Action"].map(h => <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#8b949e", fontWeight: 500 }}>{h}</th>)}</tr></thead><tbody>{rows.map(r => <tr key={r.id} style={{ borderBottom: "1px solid #21262d" }}><td style={{ padding: "10px 14px" }}>{r.id}</td><td style={{ padding: "10px 14px" }}>{r.email}</td><td style={{ padding: "10px 14px" }}><span style={{ background: "#1f6feb22", color: "#1f6feb", padding: "2px 8px", borderRadius: 20, fontSize: 11 }}>{r.role}</span></td><td style={{ padding: "10px 14px", color: "#8b949e" }}>{r.login}</td><td style={{ padding: "10px 14px" }}><button onClick={() => logHp(`Exported: ${r.email}`)} style={{ background: "transparent", border: "1px solid #30363d", color: "#8b949e", padding: "3px 10px", borderRadius: 4, cursor: "pointer", fontSize: 11 }}>Export</button></td></tr>)}</tbody></table></div></div>}
                    {hpPage === "payments" && <div><h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 20 }}>Transactions</h1><div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 8, overflow: "hidden" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}><thead><tr style={{ background: "#21262d" }}>{["TXN ID", "Amount", "Status", "Date", "Action"].map(h => <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#8b949e", fontWeight: 500 }}>{h}</th>)}</tr></thead><tbody>{txns.map(t => <tr key={t.id} style={{ borderBottom: "1px solid #21262d" }}><td style={{ padding: "10px 14px", fontFamily: "monospace" }}>{t.id}</td><td style={{ padding: "10px 14px", fontWeight: 700 }}>{t.amt}</td><td style={{ padding: "10px 14px" }}><span style={{ background: t.status === "Completed" ? "#23863622" : "#fb8f4422", color: t.status === "Completed" ? "#238636" : "#fb8f44", padding: "2px 8px", borderRadius: 20, fontSize: 11 }}>{t.status}</span></td><td style={{ padding: "10px 14px", color: "#8b949e" }}>{t.date}</td><td style={{ padding: "10px 14px" }}><button onClick={() => logHp(`Refund: ${t.id}`)} style={{ background: "transparent", border: "1px solid #30363d", color: "#8b949e", padding: "3px 10px", borderRadius: 4, cursor: "pointer", fontSize: 11 }}>Refund</button></td></tr>)}</tbody></table></div></div>}
                    {hpPage === "apikeys" && <div><h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 20 }}>API Keys</h1>{keys.map(k => <div key={k.name} style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 8, padding: 20, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><div style={{ fontWeight: 600, marginBottom: 4 }}>{k.name}</div><div style={{ fontFamily: "monospace", color: "#8b949e", fontSize: 13 }}>{k.key}</div><div style={{ color: "#484f58", fontSize: 11, marginTop: 4 }}>Created {k.created} · {k.perms}</div></div><div style={{ display: "flex", gap: 8 }}><button onClick={() => logHp(`Revealed: ${k.name}`)} style={{ background: "#1f6feb", border: "none", color: "#fff", padding: "7px 14px", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>Reveal</button><button onClick={() => logHp(`Rotated: ${k.name}`)} style={{ background: "transparent", border: "1px solid #f8514922", color: "#f85149", padding: "7px 14px", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>Rotate</button></div></div>)}</div>}
                </div>
            </div>
            <div style={{ position: "fixed", bottom: 16, right: 16, background: "rgba(200,40,40,0.93)", color: "#fff", padding: "8px 16px", borderRadius: 6, fontSize: 11, fontFamily: "monospace", zIndex: 9999, boxShadow: "0 4px 20px rgba(255,0,0,0.4)" }}>
                🕵️ HONEYPOT ACTIVE — All actions logged
                <button onClick={onLogout} style={{ marginLeft: 12, background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", padding: "2px 8px", borderRadius: 4, cursor: "pointer", fontSize: 10 }}>→ Exit</button>
            </div>
        </div>
    );
}
