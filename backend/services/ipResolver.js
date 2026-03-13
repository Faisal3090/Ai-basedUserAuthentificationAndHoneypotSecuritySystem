export async function resolveIp(ip) {
    if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.')) {
        return {
            ip: ip || '127.0.0.1',
            city: 'Local Network',
            region: 'Local',
            country: 'LAN',
            countryCode: 'XX',
            org: 'Localhost',
            lat: 0,
            lng: 0,
            source: 'local'
        };
    }

    const tfetch = async (url, ms = 4000) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), ms);
        try {
            const r = await fetch(url, { signal: controller.signal });
            const text = await r.text();
            try {
                return JSON.parse(text);
            } catch (e) {
                throw new Error(`Invalid JSON: ${text.slice(0, 20)}...`);
            }
        } finally {
            clearTimeout(id);
        }
    };
    const apis = [
        {
            url: `https://ipapi.co/${ip}/json/`,
            parse: d => d.ip && !d.error ? { ip: d.ip, city: d.city || '?', region: d.region || '', country: d.country_name || '?', countryCode: d.country_code || '??', org: d.org || '?', lat: d.latitude || 0, lng: d.longitude || 0, source: 'ipapi.co' } : null
        },
        {
            url: `https://ipwho.is/${ip}`,
            parse: d => d.ip && d.success !== false ? { ip: d.ip, city: d.city || '?', region: d.region || '', country: d.country || '?', countryCode: d.country_code || '??', org: d.connection?.isp || '?', lat: d.latitude || 0, lng: d.longitude || 0, source: 'ipwho.is' } : null
        },
        {
            url: `https://freeipapi.com/api/json/${ip}`,
            parse: d => d.ipAddress ? { ip: d.ipAddress, city: d.cityName || '?', region: d.regionName || '', country: d.countryName || '?', countryCode: d.countryCode || '??', org: d.ipType || '?', lat: d.latitude || 0, lng: d.longitude || 0, source: 'freeipapi.com' } : null
        }
    ];

    for (const api of apis) {
        try {
            const data = await tfetch(api.url, 4000);
            const result = api.parse(data);
            if (result) return result;
        } catch (err) {
            console.warn(`[IP Resolver] ${api.url} failed:`, err.message);
        }
    }

    return {
        ip,
        city: 'unknown',
        region: '',
        country: 'unknown',
        countryCode: '??',
        org: 'unknown',
        lat: 0,
        lng: 0,
        source: 'failed'
    };
}
