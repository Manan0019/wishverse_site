import assert from 'node:assert/strict';
import { DEFAULT_WISH } from '../src/data/themes.js';
import { makeShareUrl } from '../src/lib/share.js';
import { shareLinks,qrForUrl,PRACTICAL_QR_LIMIT, getShareText } from '../src/lib/share-studio.js';

globalThis.window={location:{origin:'https://greetings.mananbhayani.online',href:'https://greetings.mananbhayani.online/'}};
for(const occasion of ['birthday','anniversary','diwali','rakhi','newyear','christmas']) {
 const wish={...DEFAULT_WISH,theme:occasion,to:'જય શ્રી કૃષ્ણ ✨',from:'Manan'};
 const links=shareLinks(wish);
 assert.equal(links.link,makeShareUrl(wish));
 assert.ok(links.link.includes('/#wish='));
 assert.ok(links.whatsapp.startsWith('https://wa.me/?text='));
 assert.ok(links.telegram.startsWith('https://t.me/share/url?'));
 assert.ok(links.email.startsWith('mailto:?subject='));
 assert.ok(getShareText(wish).includes(wish.from));
 const qr=qrForUrl(links.link);
 assert.ok(qr.getModuleCount()>40);
 assert.ok(qr.isDark(0,0));
}
assert.throws(()=>qrForUrl('x'.repeat(PRACTICAL_QR_LIMIT+1)),/too long/);
console.log('PASS: six-occasion QR generation, unicode links, native-compatible share payloads, and QR limits');
