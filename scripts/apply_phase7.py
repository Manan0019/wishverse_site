from pathlib import Path
p=Path(__file__).resolve().parents[1]
html=(p/'index.html').read_text()
html=html.replace('<meta name="theme-color" content="#080817" />', '<meta name="theme-color" content="#080817" />\n  <link rel="canonical" href="https://greetings.mananbhayani.online/" />')
html=html.replace('<a href="#magic">Why it feels special</a></nav>', '<a href="#magic">Why it feels special</a><a href="#guides">Wishes & ideas</a></nav>')
html=html.replace('<a href="#magic">Why it feels special</a><a href="#studio">Create a wish</a></nav>', '<a href="#magic">Why it feels special</a><a href="#guides">Wishes & ideas</a><a href="#studio">Create a wish</a></nav>')
html=html.replace('<div class="occasion-grid" id="occasionGrid"></div>','''<div class="occasion-grid" id="occasionGrid"></div>
      <div class="guides-intro" id="guides"><div><span class="tiny-label">WISHVERSE / GREETING LIBRARY</span><h3 id="guidesHeading">Wishes with a little more meaning.</h3><p id="guidesDescription">Explore original messages and creative ideas for birthdays, festivals, anniversaries, and more.</p></div><div class="guide-link-grid" id="guideLinks"></div></div>''')
html=html.replace('<div class="editor-top"><span class="editor-step">01 — PERSONALIZE THE MOMENT</span><span class="editor-live"><span></span> LIVE PREVIEW</span></div>', '''<div class="editor-top"><span class="editor-step">01 — PERSONALIZE THE MOMENT</span><span class="editor-live"><span></span> LIVE PREVIEW</span></div>
            <div class="language-field"><label for="languageSelect" id="languageLabel">GREETING LANGUAGE</label><select id="languageSelect" aria-label="Greeting language"><option value="en">English</option><option value="hi">हिन्दी</option><option value="gu">ગુજરાતી</option></select><p>Language changes sample wishes and card greetings. Your custom text remains yours.</p></div>''')
html=html.replace('<a href="/privacy.html">Privacy</a><a href="#studio">Create a wish</a>', '<a href="/privacy.html">Privacy</a><a href="#guides">Wishes & ideas</a><a href="#studio">Create a wish</a>')
(p/'index.html').write_text(html)

file=p/'src/main.js'; s=file.read_text()
s=s.replace("import { SOUNDSCAPES, playSoundscape, safeSoundscape } from './lib/soundscapes.js';", "import { SOUNDSCAPES, playSoundscape, safeSoundscape } from './lib/soundscapes.js';\nimport { tr, safeLocale, occasionLabel, greetingFor, suggestedMessageFor, isSuggestedMessage } from './data/i18n.js';")
s=s.replace('function suggestedMessage(theme, toneId) {\n  return theme.messages[toneId] || theme.messages.heartfelt;\n}', 'function suggestedMessage(theme, toneId, lang = wish.lang) {\n  return suggestedMessageFor(theme, toneId, lang);\n}')
s=s.replace('const shouldResetMessage = !wish.message.trim() || Object.values(previous.messages).includes(wish.message);', 'const shouldResetMessage = !wish.message.trim() || isSuggestedMessage(previous, wish.message);')
s=s.replace('if (!wish.message.trim() || Object.values(theme.messages).includes(wish.message)) {','if (!wish.message.trim() || isSuggestedMessage(theme, wish.message)) {')
s=s.replace("$('cardTitle').textContent = theme.greeting;", "$('cardTitle').textContent = greetingFor(theme.id, normalized.lang);")
s=s.replace("$('openedGreeting').textContent = theme.greeting;", "$('openedGreeting').textContent = greetingFor(theme.id, sanitized.lang);")
s=s.replace("$('toInput').value = wish.to;", "$('languageSelect').value = safeLocale(wish.lang);\n  applyTranslations(safeLocale(wish.lang));\n  $('toInput').value = wish.to;")
s=s.replace("$('previewTheme').textContent = theme.name.toUpperCase();", "$('previewTheme').textContent = occasionLabel(theme.id, normalized.lang).toUpperCase();")
s=s.replace("$('receiverFrom').textContent = `A GIFTED GREETING FROM ${sanitized.from.toUpperCase()}`;", "$('receiverFrom').textContent = `${tr(sanitized.lang,'recipientGreeting')} · ${sanitized.from}`;")
s=s.replace("  $('recipientClosed').hidden = !sanitized.secret;", "  $('unwrapAction').firstChild.textContent = tr(sanitized.lang, 'openMoment') + ' ';\n  $('ritualSkip').textContent = tr(sanitized.lang, 'revealNow');\n  $('makeOneBack').firstChild.textContent = tr(sanitized.lang,'returnWish') + ' ';\n  $('recipientClosed').hidden = !sanitized.secret;")
s=s.replace("wish = { ...DEFAULT_WISH, theme: openedWish.theme,", "wish = { ...DEFAULT_WISH, lang: openedWish.lang, theme: openedWish.theme,")
s=s.replace("$('openedOverline').textContent = `${theme.label} · ${tone.label.toUpperCase()}`;", "$('openedOverline').textContent = `${occasionLabel(theme.id, sanitized.lang)} · ${tone.label.toUpperCase()}`;")
s=s.replace("  $('surpriseTemplate').addEventListener('click', () => {", "  $('languageSelect').addEventListener('change', event => changeGreetingLanguage(event.target.value));\n  $('surpriseTemplate').addEventListener('click', () => {")
s=s.replace("  const shared = getSharedWish();\n  if (shared) {", "  const shared = getSharedWish();\n  if (shared) {")
s=s.replace("    wish = { ...wish, ...shared }; updateInputs(); requestAnimationFrame(() => openReceiver(shared));\n  }\n}", '''    wish = { ...wish, ...shared }; updateInputs(); requestAnimationFrame(() => openReceiver(shared));
    return;
  }
  const params = new URLSearchParams(window.location.search);
  const language = safeLocale(params.get('lang'));
  const chosen = THEMES.find(theme => theme.id === params.get('occasion'));
  wish.lang = language;
  if (chosen) {
    wish.theme = chosen.id;
    wish.template = getTemplatesForTheme(chosen.id)[0].id;
    wish.message = suggestedMessage(chosen, wish.tone, language);
    wish.memory = chosen.headline;
  } else if (language !== 'en') {
    wish.message = suggestedMessage(getTheme(wish.theme), wish.tone, language);
  }
  updateInputs();
}''')
s=s.replace('  buildThemeCards(); buildThemePills();', '  buildThemeCards(); buildGuideLinks(); buildThemePills();')
# insert translation helpers before 'buildThemeCards'
needle='function buildThemeCards() {'
helpers='''function applyTranslations(lang) {
  const labels = {
    '#toInput': ['placeholder', lang === 'hi' ? 'उनका नाम' : lang === 'gu' ? 'તેમનું નામ' : 'Their name'],
    '#fromInput': ['placeholder', lang === 'hi' ? 'आपका नाम' : lang === 'gu' ? 'તમારું નામ' : 'Your name'],
    '#messageInput': ['placeholder', tr(lang,'msgPlaceholder')],
    '#memoryInput': ['placeholder', tr(lang,'memoPlaceholder')]
  };
  for (const [selector, [attribute, value]] of Object.entries(labels)) document.querySelector(selector)?.setAttribute(attribute, value);
  const targets = {
    '#languageLabel': lang === 'hi' ? 'शुभकामना की भाषा' : lang === 'gu' ? 'શુભેચ્છાની ભાષા' : 'GREETING LANGUAGE',
    '#guidesHeading': tr(lang,'occasionGuide'),
    '#guidesDescription': tr(lang,'guidesDesc'),
    '#copyLink': tr(lang,'copyLink'),
    '#shareWhatsapp': tr(lang,'whatsapp'),
    '#downloadPng': tr(lang,'download'),
    '#previewWish': tr(lang,'preview'),
    '#shuffleMessage': tr(lang,'refresh'),
    '#downloadKeepsake': tr(lang,'keepsake')
  };
  // Preserve existing SVG icons and accessibility affordances by replacing only plain text nodes.
  for (const [selector, label] of Object.entries(targets)) {
    const element = document.querySelector(selector);
    if (!element) continue;
    const textNode = [...element.childNodes].find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
    if (textNode) textNode.textContent = ' ' + label + ' ';
    else if (!element.children.length) element.textContent = label;
  }
  document.documentElement.lang = lang;
  document.body.dataset.lang = lang;
}

function changeGreetingLanguage(lang) {
  const safe = safeLocale(lang), theme = getTheme(wish.theme);
  const reset = !wish.message.trim() || isSuggestedMessage(theme, wish.message);
  wish.lang = safe;
  if (reset) { wish.message = suggestedMessage(theme, wish.tone, safe); $('messageInput').value = wish.message; }
  applyTranslations(safe);
  renderGuideLinks(safe);
  updatePreview();
}

function renderGuideLinks(lang) {
  const container = $('guideLinks');
  container.replaceChildren();
  for (const theme of THEMES) {
    const link = document.createElement('a');
    link.href = (lang === 'en' ? '/occasions/' : `/${lang}/occasions/`) + theme.id + '/';
    link.textContent = occasionLabel(theme.id, lang) + ' ↗';
    container.appendChild(link);
  }
}
function buildGuideLinks() { renderGuideLinks(safeLocale(wish.lang)); }

'''
s=s.replace(needle,helpers+needle)
s=s.replace('  applyTranslations(safeLocale(wish.lang));\n  $(\'toInput\')', '  applyTranslations(safeLocale(wish.lang));\n  renderGuideLinks(safeLocale(wish.lang));\n  $(\'toInput\')')
file.write_text(s)

# Client download PNG, including greeting title, uses localized fallback fonts.
p=p/'src/lib/download.js'; s=p.read_text(); s=s.replace("import { sanitizeWish } from './share.js';", "import { sanitizeWish } from './share.js';\nimport { greetingFor } from '../data/i18n.js';")
s=s.replace("centered(c, theme.greeting, greetingY, '600 57px \"Space Grotesk\",sans-serif', accent, 820);", "centered(c, greetingFor(theme.id, wish.lang), greetingY, '600 48px \"Noto Sans Gujarati\",\"Noto Sans Devanagari\",\"Space Grotesk\",sans-serif', accent, 820);")
p.write_text(s)
p=p/'src/lib/memory.js';s=p.read_text();s=s.replace("import { getTheme", "import { greetingFor } from '../data/i18n.js';\nimport { getTheme")
s=s.replace('escapeHtml(theme.greeting)', 'escapeHtml(greetingFor(theme.id, wish.lang))')
p.write_text(s)
print('Applied app locale, guide link, and PNG changes')
