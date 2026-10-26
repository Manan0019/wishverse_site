import { sanitizeWish } from './share.js';
import { getTheme } from '../data/themes.js';
import { greetingFor } from '../data/i18n.js';
import { getTemplate } from '../data/templates.js';
import {sealSymbol} from './motion.js';
import {buildStory} from './storybook.js';
import {buildVault} from './vault.js';

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const MAX_PHOTO_DATA_BYTES = 1100000;
export const MAX_AUDIO_BYTES = 2200000;

const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const safeColor = (s) => /^#[0-9a-fA-F]{6}$/.test(s) ? s : '#5c3481';
const safeData = (s, type) => typeof s === 'string' && s.startsWith(`data:${type}`) && /^[A-Za-z0-9+/=;:,-]+$/.test(s) ? s : '';

export async function photoFileToDataUrl(file) {
  if (!file || !String(file.type).startsWith('image/')) throw new Error('Choose a photo image.');
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('The photo must be smaller than 8 MB.');
  const image = await createImageBitmap(file);
  try {
    const max = 1280;
    const scale = Math.min(1, max / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(image,0,0,canvas.width,canvas.height);
    const value = canvas.toDataURL('image/jpeg',0.75);
    if (value.length > MAX_PHOTO_DATA_BYTES * 1.4) throw new Error('This photo is too large even after resizing. Choose a smaller photo.');
    return value;
  } finally { image.close?.(); }
}

export function blobToDataUrl(blob) {
  return new Promise((resolve,reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Unable to read your audio recording.'));
    reader.readAsDataURL(blob);
  });
}

export function makeKeepsakeHtml(input, media = {}) {
  const wish = sanitizeWish(input);
  const theme = getTheme(wish.theme);
  const template = getTemplate(wish.template,wish.theme);
  const p = media.photo && media.photo.length <= MAX_PHOTO_DATA_BYTES * 1.4 ? safeData(media.photo,'image/jpeg') : '';
  // Audio MIME types are browser dependent and therefore checked separately.
  const audio = typeof media.voice === 'string' && /^data:audio\/(webm|ogg|mp4|mpeg|wav)(?:;codecs=[a-zA-Z0-9.,-]+)?;base64,[A-Za-z0-9+/=]+$/.test(media.voice) && media.voice.length < MAX_AUDIO_BYTES*1.5 ? media.voice : '';
  const name = escapeHtml(wish.to);
  const from = escapeHtml(wish.from);
  const seal = sealSymbol(wish.seal);
  const message = escapeHtml(wish.message);
  const relation = escapeHtml(wish.relation);
  const note = escapeHtml(wish.memory);
  const occasion = escapeHtml(greetingFor(theme.id, wish.lang));
  const templateName = escapeHtml(template.name);
  const story = wish.storyEnabled ? `<section class="keepsake-story" aria-label="Personal story chapters"><p class="small">THREE LITTLE CHAPTERS</p>${buildStory(wish).map((ch,i)=>`<div class="keepsake-chapter"><span>${i+1} / 3 · ${escapeHtml(ch.title)}</span><p>${escapeHtml(ch.text)}</p></div>`).join('')}</section>` : '';
  const vaultHtml = wish.vaultEnabled ? `<section class="keepsake-story" aria-label="Three personal surprises"><p class="small">THREE LITTLE GIFTS JUST FOR YOU</p>${buildVault(wish).map((item,i)=>`<details class="chapter"><summary>${escapeHtml(item.icon)} · ${escapeHtml(item.title)}</summary><p>${escapeHtml(item.text)}</p></details>`).join('')}</section>` : '';
  const bg = safeColor(template.colors[0]);
  const glow = safeColor(template.colors[2]);
  return `<!doctype html>
<html lang="${wish.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><meta name="robots" content="noindex,nofollow"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; media-src data:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; connect-src 'none'"><title>A private Wishverse keepsake for ${name}</title>
<style>*{box-sizing:border-box}body{margin:0;min-height:100vh;background:#080915;color:#fff;font:16px/1.65 system-ui,-apple-system,sans-serif;display:grid;place-items:center;padding:32px 16px}main{width:min(780px,100%);background:radial-gradient(circle at 85% 5%,${glow}50,transparent 34%),linear-gradient(155deg,${bg},#130f29 70%);border:1px solid #ffffff50;border-radius:28px;padding:clamp(24px,5vw,60px);text-align:center;box-shadow:0 24px 100px #0008}.small{font-size:11px;text-transform:uppercase;letter-spacing:.24em;color:#ffebce}h1{font:italic clamp(54px,10vw,110px)/1.05 Georgia,serif;overflow-wrap:anywhere;margin:24px 0 8px}h2{font:600 clamp(24px,5vw,40px)/1.2 system-ui;margin:10px 0 20px;color:#ffddaf}.body{margin:25px auto;max-width:560px;white-space:pre-wrap;overflow-wrap:anywhere}.photo{display:block;width:min(340px,100%);max-height:340px;object-fit:cover;margin:24px auto;border:9px solid #fffb;border-radius:20px;transform:rotate(-2deg);box-shadow:0 12px 45px #0005}.chapter{border:1px solid #ffffff50;background:#ffffff12;border-radius:20px;padding:20px;max-width:540px;margin:25px auto}.chapter summary{cursor:pointer;font-weight:700;list-style:none}.chapter summary::-webkit-details-marker{display:none}.chapter p{overflow-wrap:anywhere}audio{width:100%;max-width:380px;margin-top:15px}footer{margin-top:34px;font-size:12px;color:#ffffffbc}.keepsake-story{max-width:540px;margin:26px auto}.keepsake-chapter{border:1px solid #ffffff48;background:#ffffff14;border-radius:18px;text-align:left;padding:15px 20px;margin:10px 0}.keepsake-chapter span{font:700 11px system-ui;letter-spacing:.13em;color:#ffe4cb}.keepsake-chapter p{margin:8px 0 0;overflow-wrap:anywhere}.gift-seal{width:46px;height:46px;margin:18px auto 0;display:grid;place-items:center;border:2px solid #f9dba3;border-radius:50%;background:linear-gradient(135deg,#fae5b8,#c49465);color:#4d2949;font-size:30px;box-shadow:0 10px 26px #0005}img{max-width:100%}@media(prefers-reduced-motion:reduce){*{animation:none!important;transform:none!important}}</style></head><body><main><p class="small">✦ WISHVERSE · ${templateName} ✦</p><p class="small">Made especially for my ${relation}</p><h1>${name}</h1><h2>${occasion}</h2>${story}${vaultHtml}${p?`<img class="photo" src="${p}" alt="A cherished memory photo">`:''}<p class="body">${message}</p>${note?`<details class="chapter"><summary>✦ Tap to reveal a private memory</summary><p>${note}</p></details>`:''}${audio?`<section class="chapter"><p class="small">A VOICE MESSAGE JUST FOR YOU</p><audio controls preload="none" src="${audio}">Your browser cannot play this recording.</audio></section>`:''}<p>With love, <strong>${from}</strong></p><div class="gift-seal" aria-label="Personal gift seal">${seal}</div><footer>A keepsake saved as a standalone file • No external connection needed</footer></main></body></html>`;
}

export function downloadKeepsake(wish, media={}) {
  const html = makeKeepsakeHtml(wish,media);
  const blob = new Blob([html], {type:'text/html;charset=utf-8'});
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = `wishverse-keepsake-${wish.theme}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),5000);
}
