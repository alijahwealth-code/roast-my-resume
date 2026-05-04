import { Redis } from '@upstash/redis';

const redis = new Redis({
  url:   process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const SELLER_ID         = 'zGJfFujYeY_DbmB08d1CAA==';
const PRODUCT_PERMALINK = 'qeeafp';
const ONE_YEAR_SECS     = 365 * 24 * 60 * 60;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { seller_id, sale_id, product_permalink, refunded, chargedback, test } = req.body || {};

  if (seller_id !== SELLER_ID || product_permalink !== PRODUCT_PERMALINK) {
    return res.status(200).json({ ignored: true });
  }

  if (refunded === 'true' || refunded === true || chargedback === 'true' || chargedback === true) {
    await redis.del('sale:' + sale_id);
    return res.status(200).json({ revoked: true });
  }

  if (test === 'true' || test === true) {
    return res.status(200).json({ received: true, test: true });
  }

  if (!sale_id) return res.status(400).json({ error: 'No sale_id in ping.' });

  await redis.set('sale:' + sale_id, '1', { ex: ONE_YEAR_SECS });
  return res.status(200).json({ received: true });
}
