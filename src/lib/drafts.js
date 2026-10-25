import { sanitizeWish } from './share.js';

const KEY = 'wishverse-drafts-v1';
const MAX_DRAFTS = 8;

export function readDrafts(storage) {
  try {
    storage ??= globalThis.localStorage;
    const parsed = JSON.parse(storage.getItem(KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, MAX_DRAFTS).filter((item) =>
      item && typeof item.id === 'string' && typeof item.name === 'string' && item.wish && typeof item.wish === 'object'
    ).map((item) => ({
      id: item.id.slice(0, 80),
      name: item.name.slice(0, 44),
      updated: Number(item.updated) || 0,
      wish: sanitizeWish(item.wish)
    }));
  } catch {
    return [];
  }
}

export function saveDraft(draftName, wish, storage, now = Date.now()) {
  const name = typeof draftName === 'string' ? draftName.trim().slice(0, 44) : '';
  const safeWish = sanitizeWish(wish);
  const record = {
    id: `wv-${now}-${Math.random().toString(36).slice(2, 8)}`,
    name: name || `${safeWish.to} · ${safeWish.theme}`,
    updated: now,
    wish: safeWish
  };
  const entries = [record, ...readDrafts(storage)].slice(0, MAX_DRAFTS);
  try {
    storage ??= globalThis.localStorage;
    storage.setItem(KEY, JSON.stringify(entries));
  } catch {
    return null;
  }
  return record;
}

export function deleteDraft(id, storage) {
  const previous = readDrafts(storage);
  const entries = previous.filter((entry) => entry.id !== id);
  if (previous.length === entries.length) return false;
  try {
    storage ??= globalThis.localStorage;
    storage.setItem(KEY, JSON.stringify(entries));
    return true;
  } catch {
    return false;
  }
}
