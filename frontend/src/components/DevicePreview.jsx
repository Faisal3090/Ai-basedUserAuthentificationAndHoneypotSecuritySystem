import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function DevicePreview({ previewData, ipStatus }) {
    if (!previewData) {
        return <div style={{ color: "#2a5a3a", fontSize: 11, padding: 20 }}>Loading device data…</div>;
    }

    return (
        <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ color: "#00ff64", fontSize: 8, letterSpacing: "0.22em" }}>◈ YOUR REAL BROWSER DATA — LIVE</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: ipStatus === "success" ? "#00ff64" : ipStatus === "fetching" ? "#ffaa00" : "#ff4444", boxShadow: ipStatus === "fetching" ? "0 0 6px #ffaa00" : "none" }} />
                    <span style={{ fontSize: 7, color: ipStatus === "success" ? "#00ff64" : ipStatus === "fetching" ? "#ffaa00" : "#ff4444", letterSpacing: "0.1em" }}>
                        {ipStatus === "success" ? "IP RESOLVED" : ipStatus === "fetching" ? "RESOLVING…" : "IP FAILED"}
                    </span>
                </div>
            </div>

            <div style={{ background: "rgba(0,20,10,0.92)", border: "1px solid #1a3a2a", padding: 18, height: "calc(100% - 30px)", boxSizing: "border-box", overflowY: "auto" }}>
                <div style={{ background: "rgba(0,255,100,0.05)", border: "1px solid rgba(0,255,100,0.15)", padding: "10px 12px", marginBottom: 14, borderRadius: 2 }}>
                    <div style={{ color: "#2a6a4a", fontSize: 7, letterSpacing: "0.15em", marginBottom: 8 }}>NETWORK IDENTITY</div>
                    {[
                        ["PUBLIC IP", previewData.ip, ipStatus === "fetching" ? "#ffaa44" : ipStatus === "success" ? "#00ff64" : "#ff6644"],
                        ["LOCATION", previewData.location, ipStatus === "fetching" ? "#ffaa44" : ipStatus === "success" ? "#00ff64" : "#ff6644"],
                        ["ISP / ORG", previewData.org, ipStatus === "fetching" ? "#ffaa44" : ipStatus === "success" ? "#00ff64" : "#ff6644"],
                    ].map(([l, v, c]) => (
                        <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #0a2a1a", gap: 8 }}>
                            <span style={{ fontSize: 7, color: "#3a7a5a", whiteSpace: "nowrap", flexShrink: 0, letterSpacing: "0.08em" }}>{l}</span>
                            <span style={{ fontSize: 9, color: c, textAlign: "right", wordBreak: "break-all" }}>{v}</span>
                        </div>
                    ))}
                    {previewData.ipSource && (
                        <div style={{ marginTop: 5, fontSize: 7, color: "#2a5a3a", textAlign: "right" }}>source: {previewData.ipSource}</div>
                    )}
                </div>

                {[
                    ["BROWSER", previewData.browser, "#00ff64"],
                    ["OPERATING SYSTEM", previewData.os, "#00ff64"],
                    ["DEVICE TYPE", previewData.device, "#00ff64"],
                    ["SCREEN", previewData.screen, "#00ff64"],
                    ["PIXEL RATIO", previewData.pixelRatio, "#00ff64"],
                    ["COLOR DEPTH", previewData.colorDepth, "#00ff64"],
                    ["ORIENTATION", previewData.orientation, "#00ff64"],
                    ["TIMEZONE", previewData.timezone, "#00ff64"],
                    ["TZ OFFSET", previewData.tzOffset, "#00ff64"],
                    ["CANVAS FINGERPRINT", previewData.fingerprint, "#ffaa44"],
                    ["PLATFORM", previewData.platform, "#00ff64"],
                    ["CPU CORES", previewData.cpuCores, "#00ff64"],
                    ["DEVICE MEMORY", previewData.deviceMemory, "#00ff64"],
                    ["LANGUAGES", previewData.languages, "#00ff64"],
                    ["TOUCH SUPPORT", previewData.touch, "#00ff64"],
                ].map(([l, v, c]) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #0a2a1a", gap: 8 }}>
                        <span style={{ fontSize: 7, color: "#3a7a5a", letterSpacing: "0.07em", whiteSpace: "nowrap", flexShrink: 0 }}>{l}</span>
                        <span style={{ fontSize: 9, color: c, textAlign: "right", wordBreak: "break-all" }}>{v || "—"}</span>
                    </div>
                ))}

                <div style={{ marginTop: 12, padding: "7px 9px", background: "rgba(0,255,100,0.04)", border: "1px solid rgba(0,255,100,0.1)" }}>
                    <div style={{ color: "#2a6a4a", fontSize: 7, letterSpacing: "0.1em", marginBottom: 5 }}>COLLECTION STATUS</div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {[
                            [`IP ${ipStatus === "success" ? "✓" : ipStatus === "fetching" ? "…" : "✗"}`, ipStatus === "success" ? "#00cc50" : ipStatus === "fetching" ? "#ffaa44" : "#ff5544"],
                            ["UA ✓", "#00cc50"], ["CANVAS FP ✓", "#00cc50"], ["SCREEN ✓", "#00cc50"],
                            ["TIMEZONE ✓", "#00cc50"], ["CPU/MEM ✓", "#00cc50"], ["LANGUAGES ✓", "#00cc50"],
                            ["MOUSE ✓", "#00cc50"], ["TYPING ✓", "#00cc50"],
                        ].map(([t, c]) => (
                            <span key={t} style={{ fontSize: 7, color: c, background: "rgba(0,0,0,0.3)", padding: "2px 5px", border: "1px solid #0a2a1a" }}>{t}</span>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
