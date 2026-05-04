import crypto from 'crypto';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url:   process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { orderId, token } = req.body || {};
  if (!orderId || !token) return res.status(400).json({ error: 'Missing order ID or session token.' });

  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret || secret.length !== 64) return res.status(500).json({ error: 'Server misconfiguration.' });

  const exists = await redis.get('sale:' + orderId.trim());
  if (!exists) return res.status(400).json({ error: 'Order ID not found. Check your Gumroad confirmation email and try again.' });

  await redis.del('sale:' + orderId.trim());

  const parts = token.split('.');
  if (parts.length !== 3) return res.status(400).json({ error: 'Invalid session. Please upload your resume again.' });

  try {
    const [ivHex, encHex, tagHex] = parts;
    const key = Buffer.from(secret, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    let roast = decipher.update(encHex, 'hex', 'utf8');
    roast += decipher.final('utf8');
    return res.status(200).json({ roast });
  } catch (e) {
    return res.status(500).json({ error: 'Could not decrypt roast. Try uploading your resume again.' });
  }
}
