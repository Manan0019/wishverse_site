import { DEFAULT_WISH, THEMES, TONES, FINISHES, RELATIONS } from '../data/themes.js';
import { getTemplate } from '../data/templates.js';
import { safeLocale } from '../data/i18n.js';
import { safeSoundscape } from './soundscapes.js';
import { safeMotion, safeSeal } from './motion.js';
import { safeStory } from './storybook.js';
import { safeVault } from './vault.js';

// Accommodate long Hindi/Gujarati wishes with Storybook + Wish Vault.
// Printable QR invitations still fall back to ordinary links when too dense.
const MAX_LINK_LENGTH = 8192;
const clip = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '');

export function sanitizeWish(input = {}) {
  const theme = THEMES.some((t) => t.id === input.theme) ? input.theme : DEFAULT_WISH.theme;
  const tone = TONES.some((t) => t.id === input.tone) ? input.tone : DEFAULT_WISH.tone;
  const relation = RELATIONS.includes(input.relation) ? input.relation : DEFAULT_WISH.relation;
  const finish = FINISHES.some((f) => f.id === input.finish) ? input.finish : DEFAULT_WISH.finish;
  return {
    theme,
    lang: safeLocale(input.lang),
    template: getTemplate(input.template, theme).id,
    tone,
    finish,
    relation,
    to: clip(input.to, 40) || 'Someone special',
    from: clip(input.from, 40) || 'A friend',
    message: clip(input.message, 260),
    memory: clip(input.memory, 100),
    secret: Boolean(input.secret),
    hideMemory: input.hideMemory === undefined ? false : Boolean(input.hideMemory),
    particles: Boolean(input.particles),
    soundscape: safeSoundscape(input.soundscape),
    motion: safeMotion(input.motion),
    seal: safeSeal(input.seal),
    ...safeStory(input),
    ...safeVault(input)
  };
}

export function encodeWish(wish) {
  const text = JSON.stringify(sanitizeWish(wish));
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeWish(value) {
  try {
    if (!value || value.length > MAX_LINK_LENGTH || !/^[A-Za-z0-9_-]+$/.test(value)) return null;
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(base64), (ch) => ch.charCodeAt(0));
    const data = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    if (data === null || typeof data !== 'object' || Array.isArray(data)) return null;
    return sanitizeWish(data);
  } catch {
    return null;
  }
}

export function getSharedWish() {
  const url = new URL(window.location.href);
  const fragment = url.hash.startsWith('#wish=') ? url.hash.slice(6) : null;
  const decodedFragment = decodeWish(fragment);
  if (decodedFragment) return decodedFragment;
  const legacy = decodeWish(url.searchParams.get('wish'));
  if (legacy && window.history?.replaceState) {
    // A legacy query has already reached the web server; remove it from address/history
    // after loading to reduce accidental copying and future referrer exposure.
    url.searchParams.delete('wish');
    url.hash = `wish=${encodeWish(legacy)}`;
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
  }
  return legacy;
}

export function makeShareUrl(wish) {
  const origin = window.location.origin;
  // Support local file / isolated-browser previews, where origin is 'null'.
  const base = origin && origin !== 'null' ? origin : 'https://greetings.mananbhayani.online';
  const url = new URL('/', base);
  // Fragment does not travel in the HTTP request URL. Legacy ?wish links still decode.
  url.hash = `wish=${encodeWish(wish)}`;
  return url.toString();
}

export function getWhatsAppUrl(wish) {
  const shared = sanitizeWish(wish);
  const title = `✨ ${shared.to}, ${shared.from} made a premium greeting for you!`;
  return `https://wa.me/?text=${encodeURIComponent(`${title}\nOpen your surprise here:\n${makeShareUrl(shared)}`)}`;
}

export function wishIsDefault(wish) {
  return JSON.stringify(sanitizeWish(wish)) === JSON.stringify(DEFAULT_WISH);
}
