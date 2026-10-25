/** Four art directions per occasion. Presets are intentionally curated, not random recolors. */
const directions = [
  { layout: 'illustrated', descriptor: 'A statement illustration framed like a keepsake' },
  { layout: 'editorial', descriptor: 'Editorial type, elegant borders, understated drama' },
  { layout: 'minimal', descriptor: 'Gallery-like restraint and warm negative space' },
  { layout: 'celestial', descriptor: 'Deep contrast, glowing details, cinematic depth' }
];

const catalogue = {
  birthday: [
    ['Confetti Royale', '#6b2a91', '#ef659b', '#ffe1a6'],
    ['The Birthday Edit', '#452142', '#a55a76', '#f8dec9'],
    ['Sunday Cake', '#527c83', '#d7b9a8', '#fff6df'],
    ['Midnight Wishes', '#1a2359', '#5c55b1', '#e7b7f8']
  ],
  anniversary: [
    ['Rose Atelier', '#7c294c', '#e69daf', '#f8d5bc'],
    ['Letters in Gold', '#4f2732', '#a37464', '#f1c99a'],
    ['Softly, Forever', '#596d63', '#b8b9a6', '#fff0dc'],
    ['Moonlit Promise', '#24264d', '#85618a', '#eec8e1']
  ],
  diwali: [
    ['Royal Utsav', '#6d2330', '#ed954b', '#ffe4a4'],
    ['The Golden Hour', '#673822', '#d2a050', '#f6e2ae'],
    ['Rangoli Reverie', '#415f68', '#c8b6a5', '#fff1d8'],
    ['Midnight Diyas', '#27183f', '#a75260', '#ffca79']
  ],
  rakhi: [
    ['The Sacred Thread', '#7e3151', '#d77873', '#ffd49b'],
    ['Sibling Stories', '#513d65', '#a787a7', '#ffe2c6'],
    ['Forever Connected', '#587765', '#a9c1ab', '#f7e4d1'],
    ['Raksha Starlight', '#322655', '#8e579e', '#fad0a2']
  ],
  newyear: [
    ['Firework Symphony', '#29376e', '#6a7eef', '#f5d8a0'],
    ['After Midnight', '#1b264a', '#5b6c9c', '#f1e1e9'],
    ['Fresh Beginnings', '#5b7a83', '#c4c0ac', '#fff0d6'],
    ['Celestial Countdown', '#202750', '#7652b4', '#d9c4ff']
  ],
  christmas: [
    ['Holiday Wonder', '#194b3e', '#ba4b57', '#f6e5bb'],
    ['A Winter Letter', '#3f5356', '#a98b83', '#e8e5dc'],
    ['The Cozy Season', '#62765f', '#b8c0a9', '#fff4dd'],
    ['Northern Lights', '#133e55', '#46877e', '#d5f4e9']
  ]
};

export const TEMPLATES = Object.entries(catalogue).flatMap(([theme, entries]) =>
  entries.map(([name, primary, secondary, accent], index) => ({
    id: `${theme}-${index + 1}`,
    theme,
    name,
    ...directions[index],
    colors: [primary, secondary, accent],
    order: index + 1
  }))
);

export function getTemplatesForTheme(theme) {
  return TEMPLATES.filter((preset) => preset.theme === theme);
}

export function getTemplate(id, theme = 'birthday') {
  return TEMPLATES.find((template) => template.id === id && template.theme === theme)
    || getTemplatesForTheme(theme)[0]
    || TEMPLATES[0];
}
