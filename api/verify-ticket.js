export default async function handler(req, res) {
    // 允许跨域
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ found: false, error: 'Missing booking ID' });
    }

    // 从 Vercel 环境变量中安全获取密钥，绝不暴露在前端
    const BIN_ID = process.env.JSONBIN_BIN_ID;
    const API_KEY = process.env.JSONBIN_API_KEY;

    if (!BIN_ID || !API_KEY) {
        return res.status(500).json({ found: false, error: 'Server configuration error' });
    }

    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: { 'X-Master-Key': API_KEY }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch from database');
        }

        const data = await response.json();
        const bookings = data.record?.bookings || [];
        
        const cleanedId = id.trim().toUpperCase();
        const matchedTicket = bookings.find(r => r.bookingId && r.bookingId.toUpperCase() === cleanedId);

        if (matchedTicket) {
            return res.status(200).json({ found: true, ticket: matchedTicket });
        } else {
            return res.status(200).json({ found: false });
        }
    } catch (e) {
        console.error('API Error:', e);
        return res.status(500).json({ found: false, error: 'Internal Server Error' });
    }
}
