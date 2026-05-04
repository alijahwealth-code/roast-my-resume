import Head from 'next/head';
import Script from 'next/script';

const css = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    min-height: 100vh;
    background: linear-gradient(135deg, #0d0500 0%, #1a0a00 50%, #0d0500 100%);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    color: #fff;
    padding: 0 16px 80px;
  }
  .header { text-align: center; padding: 52px 0 32px; }
  .tag {
    display: inline-block;
    background: rgba(255,107,53,0.12);
    border: 1px solid rgba(255,107,53,0.3);
    border-radius: 100px;
    padding: 4px 14px;
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #ff6b35;
    margin-bottom: 20px;
  }
  h1 {
    font-size: clamp(30px, 8vw, 56px);
    font-weight: 900;
    line-height: 1.1;
    margin-bottom: 14px;
    background: linear-gradient(135deg, #fff 40%, #ff6b35 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .subtitle { font-size: 16px; color: rgba(255,255,255,0.5); max-width: 460px; margin: 0 auto; line-height: 1.55; }
  .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 24px 20px; max-width: 580px; margin: 0 auto 14px; }
  #drop-zone {
    border: 2px dashed rgba(255,107,53,0.3);
    border-radius: 14px;
    padding: 40px 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    max-width: 580px;
    margin: 0 auto 14px;
  }
  #drop-zone:hover, #drop-zone.drag-over {
    border-color: #ff6b35;
    background: rgba(255,107,53,0.06);
  }
  #drop-zone .drop-icon { font-size: 40px; margin-bottom: 12px; }
  #file-label { font-size: 15px; color: rgba(255,255,255,0.5); display: block; margin-bottom: 6px; }
  #drop-zone .drop-hint { font-size: 12px; color: rgba(255,255,255,0.25); }
  #file-input { display: none; }
  #roast-btn { display: block; width: 100%; max-width: 580px; margin: 0 auto; background: linear-gradient(135deg, #ff4500 0%, #ff6b35 100%); border: none; border-radius: 14px; padding: 16px; color: #fff; font-size: 17px; font-weight: 700; cursor: pointer; transition: opacity 0.2s; }
  #roast-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .error-msg { color: #ff6b6b; font-size: 14px; text-align: center; margin-top: 12px; max-width: 580px; margin-left: auto; margin-right: auto; display: none; }
  #output-section { display: none; max-width: 580px; margin: 20px auto 0; }
  .output-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; overflow: hidden; margin-bottom: 14px; }
  .output-header { padding: 16px 22px 0; font-size: 10px; letter-spacing: 2.5px; text-transform: uppercase; color: rgba(255,255,255,0.3); }
  .preview-wrap { position: relative; margin: 14px 22px; }
  .preview-text { background: rgba(255,255,255,0.05); border-radius: 12px; padding: 16px; font-size: 15px; line-height: 1.65; color: rgba(255,255,255,0.8); filter: blur(5px); user-select: none; }
  .blur-overlay { position: absolute; bottom: 0; left: 0; right: 0; height: 50%; background: linear-gradient(transparent, rgba(13,5,0,0.97)); border-radius: 0 0 12px 12px; pointer-events: none; }
  .pay-gate { padding: 18px 22px 22px; border-top: 1px solid rgba(255,255,255,0.06); text-align: center; }
  .pay-title { font-size: 18px; font-weight: 700; margin-bottom: 5px; }
  .pay-sub { font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 18px; }
  .pay-btn { display: block; width: 100%; background: linear-gradient(135deg, #ff4500 0%, #ff6b35 100%); border: none; border-radius: 12px; padding: 14px; color: #fff; font-size: 16px; font-weight: 700; cursor: pointer; margin-bottom: 16px; font-family: inherit; }
  .already-paid { font-size: 11px; color: rgba(255,255,255,0.28); margin-bottom: 10px; }
  .unlock-row { display: flex; gap: 8px; }
  .unlock-input { flex: 1; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; padding: 10px 13px; color: #fff; font-size: 14px; outline: none; font-family: monospace; }
  .unlock-btn { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; padding: 10px 16px; color: #fff; font-size: 14px; cursor: pointer; white-space: nowrap; font-family: inherit; }
  .unlock-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  #unlocked-section { display: none; max-width: 580px; margin: 20px auto 0; }
  .roast-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 24px; margin-bottom: 14px; }
  .roast-title { font-size: 10px; letter-spacing: 2.5px; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 16px; }
  #full-roast { font-size: 15px; line-height: 1.75; color: rgba(255,255,255,0.88); }
  #full-roast p { margin-bottom: 14px; }
  .action-btn { display: block; width: 100%; border-radius: 10px; padding: 11px; font-size: 14px; cursor: pointer; font-family: inherit; text-align: center; margin-bottom: 10px; }
  .copy-btn { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.14); color: #fff; }
  .new-btn { background: rgba(255,107,53,0.12); border: 1px solid rgba(255,107,53,0.3); color: #ff6b35; }
  .footer { text-align: center; padding: 44px 0 0; font-size: 12px; color: rgba(255,255,255,0.18); line-height: 1.9; }
`;

const bodyHTML = `
<div class="header">
  <div class="tag">AI-Powered · Brutally Honest</div>
  <h1>Roast My Resume</h1>
  <p class="subtitle">Upload your resume. AI tells you exactly why you're not getting callbacks — and how to fix it.</p>
</div>

<div id="drop-zone">
  <div class="drop-icon">📄</div>
  <span id="file-label">Drop your resume PDF here or click to upload</span>
  <span class="drop-hint">PDF only · Max 10MB</span>
  <input type="file" id="file-input" accept=".pdf,application/pdf" />
</div>

<button id="roast-btn" disabled>🔥&nbsp; Roast My Resume</button>
<p class="error-msg" id="error-msg"></p>

<div id="output-section">
  <div class="output-card">
    <div class="output-header">Your Roast 🔥</div>
    <div class="preview-wrap">
      <div class="preview-text" id="locked-preview"></div>
      <div class="blur-overlay"></div>
    </div>
    <div class="pay-gate">
      <div class="pay-title">Unlock your full roast 🔓</div>
      <div class="pay-sub">One-time $9 · Instant reveal · Brutal but useful</div>
      <button class="pay-btn" id="pay-btn">💳&nbsp; Pay $9 to Reveal</button>
      <div class="already-paid">Already paid? Enter your order ID from your Gumroad confirmation email</div>
      <div class="unlock-row">
        <input class="unlock-input" id="order-input" placeholder="Your Gumroad order ID…" />
        <button class="unlock-btn" id="unlock-btn">Unlock</button>
      </div>
      <p class="error-msg" id="unlock-error" style="margin-top:10px;"></p>
    </div>
  </div>
</div>

<div id="unlocked-section">
  <div class="roast-card">
    <div class="roast-title">Your Full Roast 🔥</div>
    <div id="full-roast"></div>
  </div>
  <button class="action-btn copy-btn" id="copy-btn">📋&nbsp; Copy roast</button>
  <button class="action-btn new-btn" id="new-btn">↩&nbsp; Roast another resume</button>
</div>

<div class="footer">
  <div>Made with Claude AI · Roast My Resume</div>
  <div>Honest feedback saves careers 🔥</div>
</div>
`;

export default function Home() {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>🔥 Roast My Resume</title>
        <meta name="description" content="Upload your resume. AI tells you exactly why you're not getting callbacks — and how to fix it." />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div dangerouslySetInnerHTML={{ __html: bodyHTML }} />
      <Script src="/app.js" strategy="afterInteractive" />
    </>
  );
}
