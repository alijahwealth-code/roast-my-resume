import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  await redis.set('sale:TEST123', '1', { ex: 31536000 });
  const check = await redis.get('sale:TEST123');
  return res.status(200).json({ set: true, verify: check });
}
