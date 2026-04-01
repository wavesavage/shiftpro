module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return res.status(500).json({ error: "Missing Upstash env vars" });
  }

  const KEY = "nhg-candidates";

  if (req.method === "GET") {
    try {
      const r = await fetch(`${url}/get/${KEY}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await r.json();
      let result = data.result;
      // Handle double-stringification from Upstash
      while (typeof result === "string") {
        try { result = JSON.parse(result); } catch { break; }
      }
      if (!Array.isArray(result)) result = [];
      return res.status(200).json({ candidates: result });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "POST") {
    try {
      const { candidates } = req.body;
      if (!Array.isArray(candidates)) {
        return res.status(400).json({ error: "candidates must be an array" });
      }
      const payload = JSON.stringify(candidates);
      await fetch(`${url}/set/${KEY}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
