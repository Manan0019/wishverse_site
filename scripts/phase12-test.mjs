import assert from 'node:assert/strict';
import { DEFAULT_WISH } from '../src/data/themes.js';
import { safeVault, buildVault, vaultSuggestions, VAULT_GIFTS } from '../src/lib/vault.js';
import { sanitizeWish, encodeWish, decodeWish, makeShareUrl } from '../src/lib/share.js';
import { makeKeepsakeHtml } from '../src/lib/memory.js';

globalThis.window = { location: {origin:'https://greetings.mananbhayani.online',href:'https://greetings.mananbhayani.online/'}};
assert.equal(DEFAULT_WISH.to,'Anaya');
assert.equal(VAULT_GIFTS.length,3);
assert.equal(safeVault({vaultEnabled:true,vaultAdmire:'a'.repeat(400)}).vaultAdmire.length,95);
assert.equal(safeVault({vaultEnabled:'true',vaultAdmire:55}).vaultEnabled,false);
for (const occasion of ['birthday','anniversary','diwali','rakhi','newyear','christmas']) {
  assert.equal(vaultSuggestions(occasion,'en').length,3);
  assert.equal(buildVault({theme:occasion,lang:'en'}).length,3);
}
assert.ok(vaultSuggestions('diwali','gu')[0].includes('તમારી'));
const wish={...DEFAULT_WISH,theme:'diwali',lang:'gu',vaultEnabled:true,
  vaultAdmire:'તમારું સ્મિત અદ્ભુત છે ✨',vaultMoment:'<img src=x onerror=alert(1)>',vaultHope:'Always shine brightly.'};
const encoded=encodeWish(wish);
const decoded=decodeWish(encoded);
assert.equal(decoded.vaultAdmire,wish.vaultAdmire);
assert.equal(decoded.vaultEnabled,true);
assert.equal(buildVault(decoded)[1].text,wish.vaultMoment);
assert.ok(makeShareUrl(wish).includes('#wish='));
const file=makeKeepsakeHtml(wish,{});
assert.ok(file.includes('THREE LITTLE GIFTS'));
assert.ok(file.includes('&lt;img src=x onerror=alert(1)&gt;'));
assert.ok(!file.includes('<img src=x onerror=alert(1)>'));
// Old links without fields must retain the former one-card experience.
assert.equal(decodeWish(encodeWish({...DEFAULT_WISH,vaultEnabled:undefined})).vaultEnabled,false);
assert.equal(sanitizeWish({vaultEnabled:false,vaultAdmire:'example'}).vaultEnabled,false);
const maximal={...wish,to:'અ'.repeat(40),from:'ક'.repeat(40),message:'હ'.repeat(260),memory:'ઓ'.repeat(100),storyEnabled:true,storySpark:'ઈ'.repeat(105),storyMoment:'મ'.repeat(105),storyPromise:'ર'.repeat(105),vaultAdmire:'વ'.repeat(95),vaultMoment:'ગ'.repeat(95),vaultHope:'ત'.repeat(95)};
assert.ok(decodeWish(encodeWish(maximal)), 'long Gujarati greeting must still decode');
console.log('PASS: Phase 12 Wish Vault, defaults, all occasions, Gujarati Unicode, link roundtrip and escaped keepsake');
