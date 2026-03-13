import { api } from './api.js';

export function parseBrowser(ua) {
    if (!ua) return "Unknown";
    if (/Edg\/|Edge\//.test(ua)) { const m = ua.match(/Edg(?:e)?\/(\d+)/); return `Microsoft Edge ${m ? m[1] : ""}`; }
    if (/OPR\//.test(ua)) { const m = ua.match(/OPR\/(\d+)/); return `Opera ${m ? m[1] : ""}`; }
    if (/Chrome\//.test(ua)) { const m = ua.match(/Chrome\/(\d+)/); return `Chrome ${m ? m[1] : ""}`; }
    if (/Firefox\//.test(ua)) { const m = ua.match(/Firefox\/(\d+)/); return `Firefox ${m ? m[1] : ""}`; }
    if (/Safari\//.test(ua) && !/Chrome/.test(ua)) { const m = ua.match(/Version\/(\d+)/); return `Safari ${m ? m[1] : ""}`; }
    if (/MSIE|Trident/.test(ua)) return "Internet Explorer";
    return "Unknown Browser";
}

export function parseOS(ua) {
    if (!ua) return "Unknown";
    if (ua.includes("Windows NT 10.0")) return "Windows 10/11";
    if (ua.includes("Windows NT 6.3")) return "Windows 8.1";
    if (ua.includes("Windows NT 6.1")) return "Windows 7";
    if (ua.includes("Windows")) return "Windows";
    if (ua.includes("Mac OS X")) { const m = ua.match(/Mac OS X ([\d_]+)/); return `macOS ${m ? m[1].replace(/_/g, ".") : ""}`; }
    if (ua.includes("Android")) { const m = ua.match(/Android ([\d.]+)/); return `Android ${m ? m[1] : ""}`; }
    if (/iPhone|iPad/.test(ua)) return "iOS";
    if (ua.includes("Linux")) return "Linux";
    return "Unknown OS";
}

export function parseDevice(ua) {
    if (/iPad|Tablet/i.test(ua)) return "Tablet";
    if (/Mobi|Android|iPhone/i.test(ua)) return "Mobile";
    return "Desktop";
}

export function getCanvasFingerprint() {
    try {
        const c = document.createElement("canvas"); c.width = 220; c.height = 60;
        const ctx = c.getContext("2d");
        ctx.textBaseline = "top"; ctx.font = "16px Arial";
        ctx.fillStyle = "#f60"; ctx.fillRect(100, 1, 80, 30);
        ctx.fillStyle = "#069"; ctx.fillText("BehaviorAuth🔐", 2, 10);
        ctx.fillStyle = "rgba(102,204,0,0.8)"; ctx.fillText("BehaviorAuth🔐", 4, 14);
        ctx.beginPath(); ctx.arc(50, 40, 20, 0, Math.PI * 2); ctx.fillStyle = "#1a9"; ctx.fill();
        const raw = c.toDataURL(); let h = 0;
        for (let i = 0; i < raw.length; i++) { h = ((h << 5) - h) + raw.charCodeAt(i); h |= 0; }
        return `fp_${Math.abs(h).toString(36)}`;
    } catch { return `fp_${Math.random().toString(36).substr(2, 10)}`; }
}

export function getHardware() {
    return {
        cpuCores: navigator.hardwareConcurrency || "unknown",
        deviceMemory: navigator.deviceMemory ? `${navigator.deviceMemory}GB` : "unknown",
        platform: navigator.platform || "unknown",
        languages: (navigator.languages || [navigator.language || "en"]).join(", "),
    };
}

export function getScreen() {
    return {
        width: window.innerWidth || window.screen.width,
        height: window.innerHeight || window.screen.height,
        colorDepth: window.screen.colorDepth, pixelRatio: window.devicePixelRatio || 1,
        orientation: window.screen.orientation?.type || "unknown",
    };
}

export function getTZ() {
    return { offset: new Date().getTimezoneOffset(), name: Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown" };
}

export async function collectRealMeta(behaviorState) {
    const ua = navigator.userAgent;
    const scr = getScreen();
    const tz = getTZ();
    const hw = getHardware();
    const fp = getCanvasFingerprint();

    let ipGeo = null;
    try {
        ipGeo = await api.getIpInfo();
    } catch (e) {
        console.warn("Failed IP extraction via server", e);
    }

    const parts = (ipGeo?.ip || "0.0.0.0").split(".");
    const msElapsed = behaviorState?.typingStart ? Date.now() - behaviorState.typingStart : 0;

    return {
        timestamp: new Date().toISOString(),
        ip: ipGeo?.ip || "unavailable",
        geo: ipGeo || { ip: "unavailable", city: "unknown", region: "", country: "unknown", countryCode: "??", org: "unknown", lat: 0, lng: 0, source: "failed" },
        browser: parseBrowser(ua),
        os: parseOS(ua),
        device: parseDevice(ua),
        userAgent: ua.substring(0, 130),
        screenWidth: scr.width,
        screenHeight: scr.height,
        colorDepth: scr.colorDepth,
        pixelRatio: scr.pixelRatio,
        orientation: scr.orientation,
        fingerprint: fp,
        cpuCores: hw.cpuCores,
        deviceMemory: hw.deviceMemory,
        platform: hw.platform,
        languages: hw.languages,
        touchDevice: navigator.maxTouchPoints > 0,
        timezoneOffset: tz.offset,
        timezoneName: tz.name,
        typingSpeed: msElapsed ? Math.min(300, Math.round(60000 / msElapsed)) : 0,
        mouseMovements: behaviorState?.mouseCount || 0,
        formSubmitTime: behaviorState?.formStart ? Date.now() - behaviorState.formStart : 0,
        ipOctet1: parseInt(parts[0]) || 0,
        ipOctet2: parseInt(parts[1]) || 0,
        sessionStart: new Date().toISOString(),
    };
}

export async function collectAttackMeta(behaviorState) {
    const real = await collectRealMeta(behaviorState);

    const ips = ["185.220.101.47", "45.33.32.156", "198.98.54.119", "104.244.72.115", "23.129.64.190"];
    const i = Math.floor(Math.random() * ips.length);
    const ip = ips[i];
    const parts = ip.split(".");

    const cities = ["Moscow", "Beijing", "Frankfurt", "Bucharest", "Kyiv"];
    const countries = ["Russia", "China", "Germany", "Romania", "Ukraine"];
    const codes = ["RU", "CN", "DE", "RO", "UA"];

    return {
        ...real,
        ip,
        geo: { ip, city: cities[i], region: "", country: countries[i], countryCode: codes[i], org: "AS12345 Unknown VPS Provider", lat: 0, lng: 0, source: "simulated" },
        browser: ["curl/7.68.0", "python-requests/2.28", "Scrapy/2.6", "Go-http-client/1.1"][Math.floor(Math.random() * 4)],
        os: "Linux x86_64",
        device: "Unknown/Headless",
        userAgent: "python-requests/2.28.2",
        screenWidth: 0,
        screenHeight: 0,
        pixelRatio: 1,
        fingerprint: `bot_${Math.random().toString(36).substr(2, 8)}`,
        cpuCores: 1,
        deviceMemory: "unknown",
        platform: "Linux",
        typingSpeed: Math.random() * 14 + 1,
        mouseMovements: Math.floor(Math.random() * 3),
        formSubmitTime: Math.random() * 300 + 60,
        ipOctet1: parseInt(parts[0]) || 0,
        ipOctet2: parseInt(parts[1]) || 0,
    };
}
