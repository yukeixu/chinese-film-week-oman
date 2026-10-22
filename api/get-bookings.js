export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const BIN_ID = process.env.JSONBIN_BIN_ID;
    const API_KEY = process.env.JSONBIN_API_KEY;

    if (!BIN_ID || !API_KEY) {
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: { 'X-Master-Key': API_KEY }
        });
        const data = await response.json();
        const record = data.record || {};
        return res.status(200).json({
            bookings: Array.isArray(record.bookings) ? record.bookings : [],
            adminPassword: record.adminPassword || 'admin123'
        });
    } catch (e) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
