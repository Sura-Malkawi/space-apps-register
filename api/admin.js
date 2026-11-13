// POST /api/admin  { password }  -> returns all names (only if password is right)
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const PASSWORD = process.env.ADMIN_PASSWORD || '1234';

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  if (String(body.password || '') !== PASSWORD) {
    await new Promise((r) => setTimeout(r, 800)); // slows down guessing
    return res.status(401).json({ error: 'Wrong password' });
  }
  const r = await fetch(URL_, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOKEN },
    body: JSON.stringify(['LRANGE', 'registrations', 0, -1]),
  });
  if (!r.ok) return res.status(500).json({ error: 'Database error' });
  const data = await r.json();
  const rows = (data.result || []).map((s) => { try { return JSON.parse(s); } catch { return null; } }).filter(Boolean);
  res.status(200).json({ rows });
};
