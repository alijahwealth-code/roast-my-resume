let token = '';
let fullRoast = '';

const PAYMENT_LINK = 'https://wealthyquest67.gumroad.com/l/qeeafp';

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const fileLabel = document.getElementById('file-label');

dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));

dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) handleFile(fileInput.files[0]);
});

function handleFile(file) {
  if (file.type !== 'application/pdf') {
    showError('error-msg', 'Please upload a PDF file.');
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    showError('error-msg', 'File too large. Max 10MB.');
    return;
  }
  hideError('error-msg');
  fileLabel.textContent = '📄 ' + file.name;
  fileLabel.style.color = '#ff6b35';
  document.getElementById('roast-btn').disabled = false;
  window._selectedFile = file;
}

document.getElementById('roast-btn').addEventListener('click', async () => {
  if (!window._selectedFile) return;

  const btn = document.getElementById('roast-btn');
  btn.disabled = true;
  btn.textContent = '🔥  Reading your resume…';
  hideError('error-msg');
  document.getElementById('output-section').style.display = 'none';
  document.getElementById('unlocked-section').style.display = 'none';

  try {
    const pdfBase64 = await fileToBase64(window._selectedFile);
    btn.textContent = '🔥  Roasting…';

    const resp = await fetch('/api/roast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pdfBase64 }),
    });

    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || 'Roast failed.');

    token = data.token;
    showOutput(data.preview);

  } catch (e) {
    showError('error-msg', e.message || 'Something went wrong. Try again.');
    btn.disabled = false;
    btn.textContent = '🔥  Roast My Resume';
  }
});

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => { resolve(reader.result.split(',')[1]); };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

document.getElementById('pay-btn').addEventListener('click', () => {
  window.open(PAYMENT_LINK, '_blank');
});

document.getElementById('unlock-btn').addEventListener('click', unlock);
document.getElementById('order-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') unlock();
});

async function unlock() {
  const orderId = document.getElementById('order-input').value.trim();
  if (!orderId) { alert('Paste your order ID from the Gumroad confirmation email.'); return; }

  const btn = document.getElementById('unlock-btn');
  btn.textContent = 'Checking…';
  btn.disabled = true;
  hideError('unlock-error');

  try {
    const resp = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, token }),
    });

    const data = await resp.json();
    if (!resp.ok || !data.roast) throw new Error(data.error || 'Verification failed.');

    fullRoast = data.roast;
    showUnlocked(data.roast);

  } catch (e) {
    showError('unlock-error', e.message || 'Could not verify. Check your order ID and try again.');
    btn.textContent = 'Unlock';
    btn.disabled = false;
  }
}

document.getElementById('copy-btn').addEventListener('click', () => {
  navigator.clipboard.writeText(fullRoast).then(() => {
    const btn = document.getElementById('copy-btn');
    btn.textContent = '✅  Copied!';
    setTimeout(() => { btn.textContent = '📋  Copy roast'; }, 2000);
  });
});

document.getElementById('new-btn').addEventListener('click', () => {
  token = ''; fullRoast = '';
  window._selectedFile = null;
  fileLabel.textContent = 'Drop your resume PDF here or click to upload';
  fileLabel.style.color = '';
  fileInput.value = '';
  document.getElementById('output-section').style.display = 'none';
  document.getElementById('unlocked-section').style.display = 'none';
  document.getElementById('roast-btn').disabled = true;
  document.getElementById('roast-btn').textContent = '🔥  Roast My Resume';
  document.getElementById('order-input').value = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

function showOutput(preview) {
  document.getElementById('locked-preview').textContent = preview;
  document.getElementById('output-section').style.display = 'block';
  document.getElementById('output-section').scrollIntoView({ behavior: 'smooth' });
  const btn = document.getElementById('roast-btn');
  btn.disabled = false;
  btn.textContent = '🔥  Roast My Resume';
}

function showUnlocked(roast) {
  const el = document.getElementById('full-roast');
  el.innerHTML = roast.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
  if (!el.innerHTML.startsWith('<p>')) el.innerHTML = '<p>' + el.innerHTML + '</p>';
  document.getElementById('output-section').style.display = 'none';
  document.getElementById('unlocked-section').style.display = 'block';
  document.getElementById('unlocked-section').scrollIntoView({ behavior: 'smooth' });
}

function showError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.style.display = 'block';
}

function hideError(id) {
  document.getElementById(id).style.display = 'none';
}
