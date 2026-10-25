import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { encodeWish, decodeWish, getSharedWish, makeShareUrl } from '../src/lib/share.js';
import { DEFAULT_WISH } from '../src/data/themes.js';

// Old query links open correctly and are promptly migrated to fragment form.
const data = { ...DEFAULT_WISH, to: 'મીરા ✨', from: 'Manan', theme: 'diwali', message: 'પ્રેમથી આપેલી શુભેચ્છા' };
const code = encodeWish(data);
let changed='';
globalThis.window = {
  location: { href: `https://greetings.mananbhayani.online/?wish=${code}`, origin: 'https://greetings.mananbhayani.online' },
  history: { state: {old:1}, replaceState: (_state,_title,url) => { changed=url; } }
};
assert.deepEqual(getSharedWish(), decodeWish(code));
assert.equal(changed.startsWith('/#wish='), true);
assert.equal(changed.includes('?wish='), false);
assert.equal(makeShareUrl(data).includes('#wish='), true);
assert.equal(makeShareUrl(data).includes('?wish='), false);

// Check that the SW never intercepts/caches legacy query payloads or cross-origin requests.
const listeners = {};
const fakeFallback = { status: 200, body: 'offline content' };
const ctx = {
  URL, Request,
  self: { location: { origin: 'https://greetings.mananbhayani.online' }, addEventListener: (kind,cb) => {listeners[kind]=cb;} },
  caches: { match: async () => fakeFallback, open: async () => ({match: async () => null, put: async()=>{}, addAll:async()=>{}}), keys: async()=>[], delete:async()=>true },
  fetch: async () => {throw new Error('network offline');},
};
vm.runInNewContext(await readFile(new URL('../sw.js', import.meta.url),'utf-8'), ctx);
function onFetch(url,mode='navigate') {
  let handled = null;
  const req = {url,method:'GET',mode};
  listeners.fetch({request:req,respondWith:(promise) => {handled=promise;}});
  return handled;
}
assert.equal(onFetch(`https://greetings.mananbhayani.online/?wish=${code}`),null);
assert.equal(onFetch('https://elsewhere.example/'),null);
const offline = await onFetch('https://greetings.mananbhayani.online/occasions/diwali/');
assert.equal(offline, fakeFallback);
console.log('PASS: legacy link migration, fragment-only sharing, no private SW cache, offline public navigation fallback');
