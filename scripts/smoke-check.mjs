import assert from 'node:assert/strict';
import { THEMES, TONES, FINISHES, RELATIONS, DEFAULT_WISH, getTheme, getArtUrl } from '../src/data/themes.js';
import { TEMPLATES, getTemplate, getTemplatesForTheme } from '../src/data/templates.js';
import { sanitizeWish, encodeWish, decodeWish, makeShareUrl, getWhatsAppUrl } from '../src/lib/share.js';
import { readDrafts, saveDraft, deleteDraft } from '../src/lib/drafts.js';
import { existsSync } from 'node:fs';

globalThis.window = { location: { origin: 'https://greetings.mananbhayani.online', href: 'https://greetings.mananbhayani.online/' } };
assert.equal(THEMES.length, 6);
assert.equal(TONES.length, 3);
assert.equal(FINISHES.length, 3);
assert.equal(TEMPLATES.length, 24);
assert.equal(new Set(TEMPLATES.map((t) => t.id)).size, 24);
assert.equal(TEMPLATES.length * FINISHES.length, 72);
assert.ok(RELATIONS.includes('Best Friend'));
for (const theme of THEMES) {
  assert.equal(Object.keys(theme.messages).length, 3);
  assert.equal(getTheme(theme.id).id, theme.id);
  assert.ok(existsSync(`assets/art/${theme.id}.svg`));
  assert.match(getArtUrl(theme.id), /\.svg$/);
  assert.equal(getTemplatesForTheme(theme.id).length, 4);
  const seen = new Set(getTemplatesForTheme(theme.id).map((p) => p.layout));
  assert.deepEqual([...seen].sort(), ['celestial', 'editorial', 'illustrated', 'minimal']);
}

const sample = {
  ...DEFAULT_WISH, theme: 'diwali', template: 'diwali-4', to: 'જય શ્રી કૃષ્ણ 🙏',
  from: 'Manan 😊', message: 'પ્રેમથી ઉજવો 🎉', memory: 'એક ખાસ યાદ',
  relation: 'Family', tone: 'elegant', finish: 'heirloom', hideMemory: true
};
assert.deepEqual(decodeWish(encodeWish(sample)), sanitizeWish(sample));
assert.equal(sanitizeWish({theme:'invalid',to:'x'.repeat(90),tone:'oops',finish:'oops'}).to.length,40);
assert.equal(sanitizeWish({finish:'oops'}).finish,'radiance');
assert.equal(sanitizeWish({theme:'diwali', template:'birthday-2'}).template,'diwali-1');
assert.equal(getTemplate('bad','rakhi').id,'rakhi-1');
assert.equal(decodeWish('not~valid'),null);
assert.equal(decodeWish('a'.repeat(4201)),null);
assert.equal(sanitizeWish({theme:'diwali',message:'text',to:'  '}).to,'Someone special');
assert.ok(makeShareUrl(sample).startsWith('https://greetings.mananbhayani.online/?wish='));
assert.ok(getWhatsAppUrl(sample).startsWith('https://wa.me/?text='));
// Phase 4 links, lacking a template field, remain valid and default to the first preset.
const old = { ...sample };
delete old.template;
assert.equal(decodeWish(encodeWish(old)).template, 'diwali-1');

const memory = new Map();
const storage = {
  getItem: (key) => memory.get(key) ?? null,
  setItem: (key, value) => memory.set(key, value)
};
const record = saveDraft('✨ Diwali for family', sample, storage, 123456789);
assert.ok(record?.id);
assert.equal(readDrafts(storage)[0].wish.template, 'diwali-4');
assert.equal(readDrafts(storage)[0].name, '✨ Diwali for family');
assert.ok(deleteDraft(record.id, storage));
assert.equal(readDrafts(storage).length, 0);
const broken = { getItem: () => { throw new Error('denied'); }, setItem: () => { throw new Error('denied'); } };
assert.deepEqual(readDrafts(broken), []);
assert.equal(saveDraft('blocked', sample, broken), null);
console.log('PASS: 24 templates, 72 appearance combinations, source art, backward compatibility, Unicode, secure link sanitization, drafts save/load/delete, blocked storage handling');

// Phase 6: media-free links, validated soundscape, and offline keepsake escaping.
const { safeSoundscape, SOUNDSCAPES } = await import('../src/lib/soundscapes.js');
const { makeKeepsakeHtml } = await import('../src/lib/memory.js');
assert.equal(SOUNDSCAPES.length,4);
assert.equal(safeSoundscape('warmth'),'warmth');
assert.equal(safeSoundscape('<script>'),'silent');
const memoryWish={...DEFAULT_WISH,to:'<img src=x onerror=alert(1)>',message:'Me & You <3',soundscape:'warmth'};
const secure=makeKeepsakeHtml(memoryWish,{});
assert.ok(secure.includes('&lt;img src=x onerror=alert(1)&gt;'));
assert.ok(!secure.includes('<script'));
assert.ok(secure.includes("default-src 'none'"));
assert.equal(decodeWish(encodeWish(memoryWish)).soundscape,'warmth');
const older={...memoryWish}; delete older.soundscape;
assert.equal(decodeWish(encodeWish(older)).soundscape,'silent');
console.log('PASS: Phase 6 soundscapes, legacy links and offline keepsake escaping');
