import assert from 'node:assert/strict';
import { THEMES, DEFAULT_WISH } from '../src/data/themes.js';
import { safeStory, buildStory, storyHeadings, storySuggestions } from '../src/lib/storybook.js';
import { encodeWish,decodeWish,makeShareUrl,sanitizeWish } from '../src/lib/share.js';

assert.equal(storyHeadings('gu').length,3);
assert.equal(storyHeadings('hi').length,3);
for (const theme of THEMES) {
  const prompts=storySuggestions(theme.id);
  assert.equal(prompts.length,3);
  assert.ok(prompts.every(x=>x.length>20));
}
assert.equal(safeStory({storyEnabled:'true'}).storyEnabled,false);
assert.equal(safeStory({storyEnabled:true,storySpark:'X'.repeat(150)}).storySpark.length,105);
const chapterWish={...DEFAULT_WISH,lang:'gu',theme:'diwali',to:'આરોહી ✨',from:'Manan',storyEnabled:true,storySpark:'તારા સ્મિતથી દિવસ સુંદર બને છે.',storyMoment:'અમારી યાદો કિંમતી છે.',storyPromise:'દરેક દિવસ આનંદથી ભરેલો રહે.'};
const roundTrip=decodeWish(encodeWish(chapterWish));
assert.equal(roundTrip.storyEnabled,true);
assert.equal(roundTrip.storySpark,chapterWish.storySpark);
assert.equal(roundTrip.storyMoment,chapterWish.storyMoment);
assert.equal(roundTrip.storyPromise,chapterWish.storyPromise);
assert.equal(roundTrip.to,chapterWish.to);
assert.equal(buildStory(roundTrip).length,3);
assert.ok(buildStory(roundTrip)[1].text.includes('યાદો'));
const old={...DEFAULT_WISH};delete old.storyEnabled;delete old.storySpark;delete old.storyMoment;delete old.storyPromise;
assert.equal(sanitizeWish(old).storyEnabled,false);
assert.equal(decodeWish(encodeWish(old)).storyEnabled,false);
assert.equal(buildStory({theme:'birthday',lang:'en'}).length,3);
globalThis.window={location:{origin:'https://greetings.mananbhayani.online'}};
const url=makeShareUrl(chapterWish);
assert.ok(url.includes('#wish='));
assert.ok(url.length<3500);
console.log('PASS Phase 11: six occasion stories, multilingual titles, Unicode links, story opt-in, legacy links, data limits');
// Standalone keepsake must also carry the new story, with user content escaped.
const {makeKeepsakeHtml} = await import('../src/lib/memory.js');
const saved=makeKeepsakeHtml({...chapterWish,storySpark:'<script>alert(1)</script>'});
assert.ok(saved.includes('THREE LITTLE CHAPTERS'));
assert.ok(saved.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
assert.ok(!saved.includes('<script>alert(1)</script>'));
assert.ok(!makeKeepsakeHtml({...DEFAULT_WISH,storyEnabled:false}).includes('THREE LITTLE CHAPTERS'));
console.log('PASS Phase 11: offline keepsake chapter inclusion and HTML escaping');
