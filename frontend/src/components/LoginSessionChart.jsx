import { useState, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { api } from '../services/api';

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
        <div style={{
            background: 'rgba(5,10,15,0.95)',
            border: '1px solid #1a3a2a',
            padding: '10px 14px',
            fontFamily: "'Courier New', monospace",
            fontSize: 10
        }}>
            <div style={{ color: '#4a8a6a', letterSpacing: '0.15em', marginBottom: 6 }}>{label}</div>
            {payload.map(p => (
                <div key={p.name} style={{ color: p.color, marginBottom: 2 }}>
                    {p.name.toUpperCase()}: <span style={{ fontWeight: 'bold' }}>{p.value}</span>
                </div>
            ))}
        </div>
    );
};

const CustomLegend = () => (
    <div style={{
        display: 'flex', gap: 18, justifyContent: 'center',
        fontFamily: "'Courier New', monospace", fontSize: 9,
        letterSpacing: '0.15em', marginTop: 8
    }}>
        {[
            { color: '#00cc50', label: 'NORMAL' },
            { color: '#ff6644', label: 'SUSPICIOUS' },
            { color: '#ffaa00', label: 'HONEYPOT' }
        ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 3, background: color, borderRadius: 2 }} />
                <span style={{ color: '#4a7a5a' }}>{label}</span>
            </div>
        ))}
    </div>
);

export default function LoginSessionChart() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.getLoginAnalytics()
            .then(d => { setData(d); setLoading(false); })
            .catch(e => { setError(e.message); setLoading(false); });
    }, []);

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        return parts.length === 3 ? `${parts[1]}/${parts[2]}` : dateStr;
    };

    const isEmpty = data.length === 0;

    return (
        <div style={{
            background: 'rgba(0,20,10,0.8)',
            border: '1px solid #1a3a2a',
            borderTop: '2px solid #00aa44',
            padding: '18px 20px',
            marginTop: 18
        }}>
            {/* Panel Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                    <div style={{ color: '#00ff64', fontSize: 8, letterSpacing: '0.2em', fontWeight: 'bold' }}>
                        ◈ LOGIN SESSION ACTIVITY
                    </div>
                    <div style={{ color: '#3a6a5a', fontSize: 7, letterSpacing: '0.1em', marginTop: 3 }}>
                        NORMAL · SUSPICIOUS · HONEYPOT — OVER TIME
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{
                        fontSize: 7, color: '#00ff64',
                        background: 'rgba(0,255,100,0.08)',
                        border: '1px solid rgba(0,255,100,0.15)',
                        padding: '2px 8px', letterSpacing: '0.1em'
                    }}>
                        {data.reduce((a, d) => a + (d.normal || 0) + (d.suspicious || 0) + (d.honeypot || 0), 0)} TOTAL
                    </span>
                </div>
            </div>

            {/* Chart Body */}
            {loading && (
                <div style={{ color: '#2a5a3a', textAlign: 'center', padding: '30px 0', fontSize: 9, letterSpacing: '0.15em' }}>
                    LOADING SESSION DATA...
                </div>
            )}
            {error && (
                <div style={{ color: '#ff6644', textAlign: 'center', padding: '30px 0', fontSize: 9 }}>
                    ERROR: {error}
                </div>
            )}
            {!loading && !error && isEmpty && (
                <div style={{ color: '#2a5a3a', textAlign: 'center', padding: '30px 0', border: '1px dashed #1a3a2a', fontSize: 9, letterSpacing: '0.1em' }}>
                    NO SESSION DATA YET — LOGIN TO GENERATE ACTIVITY
                </div>
            )}
            {!loading && !error && !isEmpty && (
                <>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={data} margin={{ top: 4, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gNormal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00cc50" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#00cc50" stopOpacity={0.02} />
                                </linearGradient>
                                <linearGradient id="gSuspicious" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ff6644" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#ff6644" stopOpacity={0.02} />
                                </linearGradient>
                                <linearGradient id="gHoneypot" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ffaa00" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ffaa00" stopOpacity={0.02} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="2 4" stroke="#0a2a1a" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
                                stroke="#1a4a2a"
                                tick={{ fill: '#3a6a5a', fontSize: 8, fontFamily: "'Courier New',monospace" }}
                                tickLine={false}
                                axisLine={{ stroke: '#1a3a2a' }}
                            />
                            <YAxis
                                stroke="#1a4a2a"
                                tick={{ fill: '#3a6a5a', fontSize: 8, fontFamily: "'Courier New',monospace" }}
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="normal"
                                name="Normal"
                                stroke="#00cc50"
                                strokeWidth={2}
                                fill="url(#gNormal)"
                                dot={false}
                                activeDot={{ r: 4, fill: '#00ff64', strokeWidth: 0 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="suspicious"
                                name="Suspicious"
                                stroke="#ff6644"
                                strokeWidth={2}
                                fill="url(#gSuspicious)"
                                dot={false}
                                activeDot={{ r: 4, fill: '#ff6644', strokeWidth: 0 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="honeypot"
                                name="Honeypot"
                                stroke="#ffaa00"
                                strokeWidth={2}
                                fill="url(#gHoneypot)"
                                dot={false}
                                activeDot={{ r: 4, fill: '#ffaa00', strokeWidth: 0 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                    <CustomLegend />
                </>
            )}
        </div>
    );
}
