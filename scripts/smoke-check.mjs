import assert from 'node:assert/strict';
import { THEMES, TONES, FINISHES, RELATIONS, DEFAULT_WISH, getTheme, getArtUrl } from '../src/data/themes.js';
import { sanitizeWish, encodeWish, decodeWish, makeShareUrl, getWhatsAppUrl } from '../src/lib/share.js';
import { existsSync } from 'node:fs';

globalThis.window = { location: { origin: 'https://greetings.mananbhayani.online', href: 'https://greetings.mananbhayani.online/' } };
assert.equal(THEMES.length, 6);
assert.equal(new Set(THEMES.map(t=>t.id)).size, 6);
assert.equal(TONES.length, 3);
assert.equal(FINISHES.length, 3);
assert.equal(THEMES.reduce((sum,t)=>sum+FINISHES.length,0),18);
assert.ok(RELATIONS.includes('Best Friend'));
for(const theme of THEMES) {
  assert.equal(Object.keys(theme.messages).length, 3);
  assert.equal(getTheme(theme.id).id, theme.id);
  assert.ok(existsSync(`assets/art/${theme.id}.svg`));
  assert.match(getArtUrl(theme.id),/\.svg$/);
}
const sample={...DEFAULT_WISH,to:'જય શ્રી કૃષ્ણ 🙏',from:'Manan 😊',message:'પ્રેમથી ઉજવો 🎉',memory:'એક ખાસ યાદ',relation:'Family',tone:'elegant',finish:'heirloom',hideMemory:true,theme:'diwali'};
assert.deepEqual(decodeWish(encodeWish(sample)),sanitizeWish(sample));
assert.equal(sanitizeWish({theme:'invalid',to:'x'.repeat(90),tone:'oops',finish:'oops'}).to.length,40);
assert.equal(sanitizeWish({finish:'oops'}).finish,'radiance');
assert.equal(decodeWish('not~valid'),null);
assert.equal(decodeWish('a'.repeat(4201)),null);
assert.equal(sanitizeWish({theme:'diwali',message:'text',to:'  '}).to,'Someone special');
assert.ok(makeShareUrl(sample).startsWith('https://greetings.mananbhayani.online/?wish='));
assert.ok(getWhatsAppUrl(sample).startsWith('https://wa.me/?text='));
console.log('PASS: 6 themes + original artwork, 18 card appearances, tones, personal fields, unicode, links & validation');
