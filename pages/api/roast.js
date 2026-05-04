import crypto from 'crypto';

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { pdfBase64 } = req.body || {};
  if (!pdfBase64) return res.status(400).json({ error: 'No resume provided.' });

  const apiKey = process.env.OPENROUTER_API_KEY;
  const secret = process.env.ENCRYPTION_SECRET;
  if (!apiKey || !secret || secret.length !== 64) {
    return res.status(500).json({ error: 'Server misconfiguration.' });
  }

  const systemPrompt = 'You are a brutally honest career coach who roasts resumes. You are direct, sharp, and occasionally savage — but your feedback is always genuinely useful. You call out every weakness: vague bullet points, missing metrics, boring language, poor formatting choices, red flags, and anything that would make a hiring manager roll their eyes. End with 3 specific, actionable fixes they can make today. Format your roast as flowing prose — no headers, just raw honest feedback followed by the 3 fixes clearly labeled as "Fix 1:", "Fix 2:", "Fix 3:".';

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://roast-my-resume.vercel.app',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-haiku-4-5',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Roast this resume brutally but helpfully. Be specific about what you see.' },
              { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 } },
            ],
          },
        ],
        max_tokens: 1200,
        temperature: 0.85,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'AI request failed.');

    const fullRoast = data.choices?.[0]?.message?.content || '';
    if (!fullRoast) throw new Error('Empty response from AI.');

    const key = Buffer.from(secret, 'hex');
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(fullRoast, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();
    const token = iv.toString('hex') + '.' + encrypted + '.' + tag.toString('hex');
    const preview = fullRoast.slice(0, 180) + '...';

    return res.status(200).json({ preview, token });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Roast failed. Try again.' });
  }
}
