import { Redis } from '@upstash/redis';
import { randomUUID } from 'crypto';
import pdfParse from 'pdf-parse';

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

const redis = new Redis({
  url:   process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const systemPrompt = `You are a brutally honest career coach who roasts resumes. You are direct, sharp, and occasionally savage — but your feedback is always genuinely useful. You call out every weakness: vague bullet points, missing metrics, boring language, poor formatting choices, red flags, and anything that would make a hiring manager roll their eyes. End with 3 specific, actionable fixes they can make today. Format your roast as flowing prose — no headers, just raw honest feedback followed by the 3 fixes clearly labeled as "Fix 1:", "Fix 2:", "Fix 3:".`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { pdfBase64 } = req.body || {};
  if (!pdfBase64) return res.status(400).json({ error: 'No resume provided.' });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Server misconfiguration.' });

  // Extract text from PDF server-side
  let resumeText;
  try {
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    const parsed = await pdfParse(pdfBuffer);
    resumeText = parsed.text.trim();
    if (!resumeText || resumeText.length < 50) {
      return res.status(400).json({ error: 'Could not read resume text. Make sure your PDF has selectable text (not a scanned image).' });
    }
  } catch (e) {
    return res.status(400).json({ error: 'Could not parse PDF. Try re-saving it or use a different PDF.' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://roast-my-resume.vercel.app',
        'X-Title': 'Roast My Resume',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-haiku-4-5',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Roast this resume brutally but helpfully. Be specific about what you see:\n\n${resumeText.slice(0, 6000)}` },
        ],
        max_tokens: 1200,
        temperature: 0.85,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'AI request failed.');

    const fullRoast = data.choices?.[0]?.message?.content?.trim();
    if (!fullRoast) throw new Error('Empty response from AI.');

    // Store full roast in Redis — expires in 2 hours
    const roastId = randomUUID();
    await redis.set(`roast:${roastId}`, fullRoast, { ex: 7200 });

    // Send only a preview to the browser
    const preview = fullRoast.slice(0, 200) + '...';

    return res.status(200).json({ preview, roastId });
  } catch (e) {
    console.error('Roast error:', e);
    return res.status(500).json({ error: e.message || 'Roast failed. Try again.' });
  }
}
