const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const api = {
    login: async (username, password, meta) => {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, meta })
        });
        
        let data;
        const text = await res.text();
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse JSON. Raw response:", text);
            throw new Error(`Server returned non-JSON response (Status: ${res.status}). See console for details.`);
        }

        if (!res.ok) {
            if (data.status === "locked") {
                throw new Error(JSON.stringify(data));
            }
            throw new Error(data.error || 'Login failed');
        }
        return data;
    },

    getSessions: async () => {
        const res = await fetch(`${API_BASE}/sessions`);
        if (!res.ok) throw new Error('Failed to load sessions');
        return res.json();
    },

    getIpInfo: async () => {
        const res = await fetch(`${API_BASE}/ip`);
        if (!res.ok) throw new Error('Failed to resolve IP');
        return res.json();
    },

    logHoneypotAction: async (sessionId, action, page) => {
        const res = await fetch(`${API_BASE}/honeypot/log`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, action, page })
        });
        return res.json();
    },

    getHoneypotLogs: async () => {
        const res = await fetch(`${API_BASE}/honeypot/history`);
        if (!res.ok) throw new Error('Failed to load honeypot logs');
        return res.json();
    },

    getSecurityStats: async () => {
        const [attacks, timeline, countries, asn, recent] = await Promise.all([
            fetch(`${API_BASE}/security/attacks`).then(r => r.json()),
            fetch(`${API_BASE}/security/timeline`).then(r => r.json()),
            fetch(`${API_BASE}/security/countries`).then(r => r.json()),
            fetch(`${API_BASE}/security/asn`).then(r => r.json()),
            fetch(`${API_BASE}/security/recent`).then(r => r.json())
        ]);
        return { attacks, timeline, countries, asn, recent };
    }
};
