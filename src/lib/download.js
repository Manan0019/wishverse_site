import { getTheme, getTone, getArtUrl } from '../data/themes.js';
import { getTemplate } from '../data/templates.js';
import { sanitizeWish } from './share.js';
import { greetingFor } from '../data/i18n.js';

const W = 1080;
const H = 1350;

function rounded(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function wrap(ctx, input, maxWidth, maxLines = 99) {
  const text = String(input || '').trim();
  if (!text) return [];
  const out = [];
  const add = (line) => { if (line) out.push(line); };
  for (const paragraph of text.split(/\n/)) {
    let line = '';
    for (const word of paragraph.split(/\s+/)) {
      if (!word) continue;
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width <= maxWidth) {
        line = test;
      } else {
        add(line);
        line = '';
        // Split very long words on character boundaries to avoid clipping.
        for (const ch of Array.from(word)) {
          if (ctx.measureText(line + ch).width > maxWidth && line) {
            add(line);
            line = ch;
          } else line += ch;
        }
      }
    }
    add(line);
  }
  return out.slice(0, maxLines);
}

function centered(ctx, text, y, font, color = '#fff', maxWidth = 890) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.fillText(text, W / 2, y, maxWidth);
}

function background(ctx, theme, finish, preset) {
  let fill;
  if (finish === 'heirloom') {
    fill = ctx.createLinearGradient(0, 0, W, H);
    fill.addColorStop(0, '#fff8ea');
    fill.addColorStop(0.65, '#f3e4c9');
    fill.addColorStop(1, '#e9d4b4');
  } else if (finish === 'velvet' || preset.layout === 'celestial') {
    fill = ctx.createRadialGradient(W / 2, 320, 50, W / 2, 640, 850);
    fill.addColorStop(0, preset.colors[0]);
    fill.addColorStop(0.65, '#151022');
    fill.addColorStop(1, '#070b16');
  } else {
    fill = ctx.createLinearGradient(65, 70, W - 100, H);
    fill.addColorStop(0, preset.layout === 'minimal' ? '#fbf6ed' : preset.colors[0]);
    fill.addColorStop(0.53, preset.layout === 'minimal' ? '#e7dac7' : preset.colors[1]);
    fill.addColorStop(1, '#1a102b');
  }
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(760, 150, 20, 760, 150, 650);
  glow.addColorStop(0, finish === 'heirloom' || preset.layout === 'minimal' ? '#d0a87355' : preset.colors[2] + '77');
  glow.addColorStop(1, '#ffffff00');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
}

function drawTexture(ctx, finish) {
  let seed = 781;
  const next = () => ((seed = seed * 16807 % 2147483647) / 2147483647);
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = finish === 'heirloom' ? '#5b3b29' : '#ffffff';
  for (let i = 0; i < 700; i++) {
    const x = next() * W, y = next() * H;
    ctx.fillRect(x, y, 1.2 + next() * 1.6, 1.2 + next() * 1.6);
  }
  ctx.restore();
}

async function drawArtwork(ctx, theme, finish, preset) {
  const img = new Image();
  await new Promise((resolve) => {
    const timeout = setTimeout(resolve, 1800);
    img.onload = () => { clearTimeout(timeout); resolve(); };
    img.onerror = () => { clearTimeout(timeout); resolve(); };
    img.src = getArtUrl(theme.id);
  });
  if (img.complete && img.naturalWidth) {
    ctx.save();
    ctx.globalAlpha = preset.layout === 'minimal' ? 0.09 : finish === 'heirloom' ? 0.13 : preset.layout === 'editorial' ? 0.15 : finish === 'velvet' ? 0.44 : 0.32;
    if (preset.layout === 'editorial') ctx.drawImage(img, 350, -40, 730, 730);
    else if (preset.layout === 'minimal') ctx.drawImage(img, 240, 90, 610, 610);
    else ctx.drawImage(img, 154, 60, 770, 700);
    ctx.restore();
  }
}

export async function downloadWishPng(input, photoData = null) {
  const wish = sanitizeWish(input);
  const theme = getTheme(wish.theme);
  const tone = getTone(wish.tone);
  const preset = getTemplate(wish.template, wish.theme);
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const c = canvas.getContext('2d');
  if (!c) throw new Error('Canvas is unavailable.');

  background(c, theme, wish.finish, preset);
  drawTexture(c, wish.finish);
  await drawArtwork(c, theme, wish.finish, preset);

  // Optional photo inset. Rendered entirely locally: never uploaded.
  if (typeof photoData === 'string' && /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(photoData)) {
    try {
      const picture = new Image();
      await new Promise((resolve,reject)=>{
        picture.onload=resolve;picture.onerror=reject;picture.src=photoData;
      });
      const dx=456,dy=147,dw=168,dh=100;
      const scale=Math.max(dw/picture.naturalWidth,dh/picture.naturalHeight);
      const sw=dw/scale, sh=dh/scale, sx=(picture.naturalWidth-sw)/2, sy=(picture.naturalHeight-sh)/2;
      c.save(); c.beginPath(); c.roundRect(dx,dy,dw,dh,12); c.clip();
      c.drawImage(picture,sx,sy,sw,sh,dx,dy,dw,dh); c.restore();
      c.strokeStyle='#fff9'; c.lineWidth=5;
      c.beginPath();c.roundRect(dx,dy,dw,dh,12);c.stroke();
    } catch { /* image decoration is optional; keep text-based card export working */ }
  }

  const paper = wish.finish === 'heirloom' || preset.layout === 'minimal';
  const ink = paper ? '#4a2a3a' : '#fffaf4';
  const faint = paper ? '#7b5c61' : '#f5e5e4';
  const accent = paper ? '#a47542' : '#fff0c9';
  c.strokeStyle = paper ? '#a5805f' : '#ffffff66';
  c.lineWidth = 2;
  rounded(c, 58, 58, W - 116, H - 116, 34);
  c.stroke();
  c.globalAlpha = 0.62;
  rounded(c, 86, 86, W - 172, H - 172, 20);
  c.stroke();
  c.globalAlpha = 1;

  c.textAlign = 'left';
  c.fillStyle = ink;
  c.font = '700 23px "Space Grotesk",sans-serif';
  c.fillText('W I S H V E R S E', 116, 137);
  c.textAlign = 'right';
  c.font = '600 18px "Space Grotesk",sans-serif';
  c.fillText(preset.name.toUpperCase(), W - 115, 137, 370);

  c.textAlign = 'center';
  c.font = '700 22px "Space Grotesk",sans-serif';
  const tag = `FOR MY ${wish.relation.toUpperCase()}`;
  const pillWidth = Math.min(760, c.measureText(tag).width + 96);
  const pillX = (W - pillWidth) / 2;
  c.fillStyle = paper ? '#b58a602a' : '#ffffff24';
  c.strokeStyle = paper ? '#9c714d66' : '#ffffff55';
  rounded(c, pillX, 258, pillWidth, 57, 29);
  c.fill();
  c.stroke();
  centered(c, tag, 297, '700 22px "Space Grotesk",sans-serif', ink, pillWidth - 30);

  c.font = 'italic 92px Georgia,serif';
  const names = wrap(c, wish.to, 780, 2);
  const nameFont = names.length > 1 ? 75 : c.measureText(wish.to).width > 740 ? 70 : 94;
  names.forEach((line, i) => centered(c, line, 417 + i * 83, `italic ${nameFont}px Georgia,serif`, ink, 780));
  const delta = names.length > 1 ? 72 : 0;
  const greetingY = 542 + delta;
  centered(c, greetingFor(theme.id, wish.lang), greetingY, '600 48px "Noto Sans Gujarati","Noto Sans Devanagari","Space Grotesk",sans-serif', accent, 820);

  const maxMessageWidth = 780;
  let fontSize = wish.message.length > 200 ? 28 : wish.message.length > 145 ? 30 : 33;
  c.font = `${fontSize}px "DM Sans",sans-serif`;
  let messageLines = wrap(c, wish.message, maxMessageWidth, 8);
  const availableHeight = wish.memory ? 275 : 410;
  while (messageLines.length * fontSize * 1.45 > availableHeight && fontSize > 23) {
    fontSize -= 1;
    c.font = `${fontSize}px "DM Sans",sans-serif`;
    messageLines = wrap(c, wish.message, maxMessageWidth, 8);
  }
  const msgStart = 650 + delta;
  messageLines.forEach((line, i) => centered(c, line, msgStart + i * fontSize * 1.45, `${fontSize}px "DM Sans",sans-serif`, ink, 800));

  if (wish.memory) {
    c.fillStyle = paper ? '#a8875822' : '#ffffff22';
    c.strokeStyle = paper ? '#98704e66' : '#ffffff55';
    rounded(c, 152, 991, W - 304, 158, 24);
    c.fill();
    c.stroke();
    c.textAlign = 'left';
    c.fillStyle = faint;
    c.font = '700 19px "Space Grotesk",sans-serif';
    c.fillText('A PERSONAL NOTE  ✦', 192, 1032);
    c.font = 'italic 31px Georgia,serif';
    const note = wrap(c, wish.memory, 685, 3);
    note.forEach((line, i) => {
      c.fillStyle = ink;
      c.fillText(line, 192, 1082 + i * 30, 690);
    });
  }
  centered(c, `With love, ${wish.from}`, 1208, 'italic 39px Georgia,serif', ink, 830);
  centered(c, `${tone.label.toUpperCase()}   /   ${wish.finish.toUpperCase()}   /   ${preset.name.toUpperCase()}`, 1250, '700 18px "Space Grotesk",sans-serif', faint, 790);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('PNG generation failed');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  const filename = wish.to.normalize('NFKD').replace(/[^a-zA-Z0-9-]+/g, '-').slice(0, 32).replace(/^-|-$/g, '').toLowerCase() || 'someone';
  link.download = `wishverse-${preset.id}-${wish.finish}-${filename}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 3500);
}
