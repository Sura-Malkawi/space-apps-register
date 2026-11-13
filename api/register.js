// POST /api/register  { name }
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const name = String(body.name || '').trim().replace(/\s+/g, ' ');
  if (name.length < 2 || name.length > 80) return res.status(400).json({ error: 'Invalid name' });

  const entry = JSON.stringify({ name, at: new Date().toISOString() });
  const r = await fetch(URL_, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOKEN },
    body: JSON.stringify(['RPUSH', 'registrations', entry]),
  });
  if (!r.ok) return res.status(500).json({ error: 'Database error' });
  res.status(200).json({ ok: true });
};
