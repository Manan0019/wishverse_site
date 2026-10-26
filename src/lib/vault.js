/** Phase 12 — text-only Wish Vault. No API, uploads or background tracking. */
export const VAULT_GIFTS = [
  { key: 'vaultAdmire', label: 'A LITTLE ADMIRATION', title: 'What makes you remarkable', icon: '✧', prompt: 'Say one thing you truly admire about this person.' },
  { key: 'vaultMoment', label: 'A MOMENT TO KEEP', title: 'One memory worth saving', icon: '♡', prompt: 'Remember something small that always makes you smile.' },
  { key: 'vaultHope', label: 'A WISH FOR YOU', title: 'Something wonderful ahead', icon: '✦', prompt: 'What do you hope the future holds for them?' }
];

const starters = {
  birthday: ['You have a gift for making ordinary days feel golden.', 'Every laugh with you becomes a favorite memory.', 'May the next chapter surprise you in the best way.'],
  anniversary: ['I admire the quiet way we show up for each other.', 'My favorite days are still the ones we spend together.', 'May we keep choosing this story, every single day.'],
  diwali: ['The warmth you bring is brighter than a thousand diyas.', 'Our festive moments together are my real celebration.', 'May every new light guide you toward happiness.'],
  rakhi: ['Your care always finds me, even from far away.', 'I treasure every silly childhood memory with you.', 'May this bond grow stronger every passing year.'],
  newyear: ['You made the past year brighter just by being you.', 'Our best little moments deserve their own constellation.', 'May the year ahead open doors you never imagined.'],
  christmas: ['You make every season feel kinder and warmer.', 'The simplest moments with you feel like gifts.', 'May wonder find you wherever you go next.']
};
const translated = {
  hi: {
    birthday: ['तुम्हारी मुस्कान हर दिन को खास बना देती है।', 'तुम्हारे साथ बिताए पल हमेशा याद रहेंगे।', 'आने वाला साल ढेर सारी खुशियाँ लाए।'],
    diwali: ['तुम्हारी मौजूदगी हर दीपक से ज्यादा रोशनी देती है।', 'हमारी साथ की दिवाली की यादें अनमोल हैं।', 'हर नया दीपक तुम्हारे जीवन में खुशियाँ लाए।']
  },
  gu: {
    birthday: ['તમારું સ્મિત દરેક દિવસને ખાસ બનાવે છે.', 'તમારી સાથે વિતાવેલી પળો હંમેશાં યાદ રહેશે.', 'આવનારું વર્ષ અનેક ખુશીઓ લઈને આવે.'],
    diwali: ['તમારી હાજરી દરેક દીવા કરતાં વધુ પ્રકાશ આપે છે.', 'આપણી સાથે ઉજવેલી દિવાળી હંમેશાં યાદ રહેશે.', 'દરેક નવો દીવો જીવનમાં ખુશીઓ લાવે.']
  }
};

export function vaultSuggestions(theme = 'birthday', lang = 'en') {
  return translated[lang]?.[theme] || starters[theme] || starters.birthday;
}
export function safeVault(input = {}) {
  const shorten = v => typeof v === 'string' ? v.trim().slice(0, 95) : '';
  return {
    vaultEnabled: input.vaultEnabled === true,
    vaultAdmire: shorten(input.vaultAdmire),
    vaultMoment: shorten(input.vaultMoment),
    vaultHope: shorten(input.vaultHope)
  };
}
export function buildVault(input = {}) {
  const safe = safeVault(input);
  const fallbacks = vaultSuggestions(input.theme, input.lang);
  return VAULT_GIFTS.map((gift, index) => ({
    ...gift,
    text: safe[gift.key] || fallbacks[index]
  }));
}
