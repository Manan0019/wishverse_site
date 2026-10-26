/** Wishverse Phase 11: offline, text-only micro-stories; no API or storage required. */
export const STORY_CHAPTERS = [
  { key: 'storySpark', label: 'THE FIRST SPARK', short: 'What makes them special?', icon: '✧' },
  { key: 'storyMoment', label: 'THE MOMENT', short: 'One little memory', icon: '♡' },
  { key: 'storyPromise', label: 'THE WISH', short: 'Your wish for tomorrow', icon: '✦' }
];

const PROMPTS = {
  birthday: ['The world feels a little brighter because you are in it.', 'I still smile whenever I remember our little adventures.', 'May you find something wonderful in every new chapter.'],
  anniversary: ['Of all the stories, ours will always be my favorite.', 'Even the ordinary moments feel special beside you.', 'Here is to all the beautiful tomorrows waiting for us.'],
  diwali: ['You bring a warmth to life that no lamp can replace.', 'Our best celebrations always begin with being together.', 'May your path be filled with light, peace, and laughter.'],
  rakhi: ['We may tease each other, but our bond is forever.', 'Our childhood memories still make me smile.', 'May this beautiful thread always lead us back to each other.'],
  newyear: ['You made this past year more meaningful.', 'I will carry our happiest moments into the new year.', 'May the year ahead surprise you in the best possible ways.'],
  christmas: ['You make winter days feel warmer and kinder.', 'Our small festive traditions mean the world to me.', 'May this season bring peace, wonder, and togetherness.']
};

const LOCAL_HEADINGS = {
  en: ['The first spark', 'A little memory', 'For the tomorrows'],
  hi: ['पहली खुशी', 'एक प्यारी याद', 'आने वाले कल के लिए'],
  gu: ['પ્રથમ લાગણી', 'એક મીઠી યાદ', 'આવતી કાલ માટે']
};

export function storyHeadings(lang='en') { return LOCAL_HEADINGS[lang] || LOCAL_HEADINGS.en; }
export function storySuggestions(theme='birthday') { return PROMPTS[theme] || PROMPTS.birthday; }
export function safeStory(input = {}) {
  const limit = (value) => typeof value === 'string' ? value.trim().slice(0, 105) : '';
  return {
    storyEnabled: input.storyEnabled === true,
    storySpark: limit(input.storySpark),
    storyMoment: limit(input.storyMoment),
    storyPromise: limit(input.storyPromise)
  };
}
export function buildStory(wish = {}) {
  const headings = storyHeadings(wish.lang);
  const fallback = storySuggestions(wish.theme);
  return STORY_CHAPTERS.map((item, i) => ({
    label: item.label, title: headings[i], icon: item.icon,
    text: safeStory(wish)[item.key] || fallback[i]
  }));
}
