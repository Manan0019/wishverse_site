import { THEMES, TONES, FINISHES, RELATIONS, DEFAULT_WISH, getTheme, getTone, getArtUrl } from './data/themes.js';
import { sanitizeWish, getSharedWish, makeShareUrl, getWhatsAppUrl } from './lib/share.js';
import { downloadWishPng } from './lib/download.js';

const $ = (id) => document.getElementById(id);
const icon = (name) => `<svg class="ico"><use href="#i-${name}"/></svg>`;
let wish = { ...DEFAULT_WISH };
let openedWish = null;
let toastTimer;
let soundOn = false;
let audioContext = null;
let ritualState = { theme: '', progress: 0, goal: 1, mode: 'action', complete: false };

function applyTheme(element, theme) {
  if (!element) return;
  element.style.setProperty('--t1', theme.colors[0]);
  element.style.setProperty('--t2', theme.colors[1]);
  element.style.setProperty('--t3', theme.colors[2]);
  element.dataset.scene = theme.scene || theme.id;
  element.className = element.className
    .split(' ')
    .filter((cls) => !cls.startsWith('scene-') && !cls.startsWith('theme-'))
    .concat([`scene-${theme.scene || theme.id}`, `theme-${theme.id}`])
    .join(' ');
}

function suggestedMessage(theme, toneId) {
  return theme.messages[toneId] || theme.messages.heartfelt;
}

function buildThemeCards() {
  $('occasionGrid').innerHTML = THEMES.map((theme, index) => `
    <button type="button" class="occasion-tile tile-${theme.id}" data-theme="${theme.id}" aria-label="Create a ${theme.name} greeting">
      <span class="tile-top"><span>${String(index + 1).padStart(2, '0')} / ${theme.label}</span><span class="tile-arrow">${icon('arrow-up')}</span></span>
      <span class="tile-art" aria-hidden="true"><span class="tile-orbit"></span><span class="tile-orbit o2"></span><img class="tile-illustration" src="${getArtUrl(theme.id)}" alt="" loading="lazy" decoding="async"/><span class="tile-twinkle">${theme.symbol}</span></span>
      <span class="tile-caption"><strong>${theme.name}</strong><span>${theme.tagline}</span></span>
    </button>
  `).join('');

  document.querySelectorAll('[data-theme]').forEach((button) => {
    button.addEventListener('click', () => {
      selectTheme(button.dataset.theme);
      $('studio').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    });
  });
}

function buildThemePills() {
  $('themePills').innerHTML = THEMES.map((theme) => `
    <button class="theme-pill" type="button" data-theme-pill="${theme.id}" aria-pressed="false"><span>${theme.emoji}</span>${theme.name}</button>
  `).join('');
  document.querySelectorAll('[data-theme-pill]').forEach((button) => button.addEventListener('click', () => selectTheme(button.dataset.themePill)));
}

function buildTonePills() {
  $('tonePills').innerHTML = TONES.map((tone) => `
    <button type="button" class="tone-pill" data-tone="${tone.id}" aria-pressed="false"><span>${tone.emoji}</span>${tone.label}</button>
  `).join('');
  document.querySelectorAll('[data-tone]').forEach((button) => {
    button.addEventListener('click', () => {
      wish.tone = button.dataset.tone;
      const theme = getTheme(wish.theme);
      if (!wish.message.trim() || Object.values(theme.messages).includes(wish.message)) {
        wish.message = suggestedMessage(theme, wish.tone);
        $('messageInput').value = wish.message;
      }
      updatePreview();
    });
  });
}

function buildFinishPills() {
  $('finishPills').innerHTML = FINISHES.map((finish) => `
    <button type="button" class="finish-pill" data-finish="${finish.id}" aria-pressed="false">
      <span class="finish-symbol">${finish.symbol}</span>
      <span class="finish-copy"><strong>${finish.label}</strong><small>${finish.detail}</small></span>
    </button>
  `).join('');
  document.querySelectorAll('[data-finish]').forEach((button) => button.addEventListener('click', () => {
    wish.finish = button.dataset.finish;
    updatePreview();
  }));
}

function buildRelationOptions() {
  $('relationInput').innerHTML = RELATIONS.map((relation) => `<option value="${relation}">${relation}</option>`).join('');
}

function selectTheme(id) {
  const previous = getTheme(wish.theme);
  const next = getTheme(id);
  const shouldResetMessage = !wish.message.trim() || Object.values(previous.messages).includes(wish.message);
  const shouldResetMemory = !wish.memory.trim() || wish.memory === DEFAULT_WISH.memory || THEMES.some((item) => item.headline === wish.memory);
  wish.theme = next.id;
  if (shouldResetMessage) {
    wish.message = suggestedMessage(next, wish.tone);
    $('messageInput').value = wish.message;
  }
  if (shouldResetMemory) {
    wish.memory = next.headline;
    $('memoryInput').value = wish.memory;
  }
  updatePreview();
}

function updatePreview() {
  const theme = getTheme(wish.theme);
  const tone = getTone(wish.tone);
  const normalized = sanitizeWish(wish);

  $('cardRecipient').textContent = normalized.to;
  $('cardSender').textContent = normalized.from;
  $('cardThemeTag').textContent = theme.label;
  $('cardSymbol').textContent = theme.symbol;
  $('cardTitle').textContent = theme.greeting;
  $('cardMessage').textContent = normalized.message;
  $('cardRelation').textContent = `FOR MY ${normalized.relation.toUpperCase()}`;
  $('cardMemory').textContent = normalized.memory || theme.headline;
  $('cardIllustration').src = getArtUrl(theme.id);
  $('wishCard').dataset.finish = normalized.finish;
  $('wishCard').classList.toggle('name-long', normalized.to.length > 17);
  $('wishCard').classList.toggle('long-copy', normalized.message.length > 170 || (normalized.memory.length > 68 && normalized.message.length > 120));
  $('previewTheme').textContent = theme.name.toUpperCase();
  $('previewTone').textContent = `${tone.label.toUpperCase()} · ${normalized.finish.toUpperCase()}`;
  $('previewOccasionLine').textContent = theme.iconLabel;
  $('charCount').textContent = `${normalized.message.length} / 260`;
  $('memoryCount').textContent = `${normalized.memory.length} / 100`;
  $('helperHeadline').textContent = theme.headline;
  $('helperTagline').textContent = theme.tagline;
  $('motifOne').textContent = theme.motifs[0];
  $('motifTwo').textContent = theme.motifs[1];
  $('motifThree').textContent = theme.motifs[2];

  applyTheme($('wishCard'), theme);
  applyTheme($('previewOuter'), theme);
  applyTheme($('recipientScene'), theme);
  document.querySelectorAll('[data-finish]').forEach((element) => {
    const selected = element.dataset.finish === normalized.finish;
    element.classList.toggle('active', selected);
    element.setAttribute('aria-pressed', String(selected));
  });
  document.querySelectorAll('[data-theme-pill]').forEach((element) => {
    const selected = element.dataset.themePill === normalized.theme;
    element.classList.toggle('active', selected);
    element.setAttribute('aria-pressed', String(selected));
  });
  document.querySelectorAll('[data-tone]').forEach((element) => {
    const selected = element.dataset.tone === normalized.tone;
    element.classList.toggle('active', selected);
    element.setAttribute('aria-pressed', String(selected));
  });
}

function updateInputs() {
  $('toInput').value = wish.to;
  $('fromInput').value = wish.from;
  $('relationInput').value = wish.relation;
  $('memoryInput').value = wish.memory;
  $('messageInput').value = wish.message;
  $('secretToggle').checked = wish.secret;
  $('particlesToggle').checked = wish.particles;
  $('hideMemoryToggle').checked = wish.hideMemory;
  updatePreview();
}

function showToast(message) {
  $('toastText').textContent = message;
  const toast = $('toast');
  toast.hidden = false;
  toast.classList.remove('toast-show');
  void toast.offsetWidth;
  toast.classList.add('toast-show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.hidden = true;
    toast.classList.remove('toast-show');
  }, 3400);
}

function showFallback(url) {
  $('fallbackUrl').value = url;
  $('shareFallback').hidden = false;
  $('selectFallback').focus();
}

async function copyShareUrl() {
  const url = makeShareUrl(wish);
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(url);
    showToast('Your premium wish link is copied. Send it to someone special ✨');
  } catch {
    showFallback(url);
  }
}

function closeFallback() { $('shareFallback').hidden = true; }

function starField() {
  const layer = $('recipientStars');
  let seed = 41;
  const random = () => ((seed = (seed * 48271) % 2147483647) / 2147483647);
  layer.innerHTML = Array.from({ length: 58 }, () => {
    const x = (random() * 100).toFixed(1);
    const y = (random() * 100).toFixed(1);
    const s = (random() * 2.8 + 1).toFixed(1);
    const d = (random() * 4.8).toFixed(1);
    return `<span class="background-star" style="--x:${x}%;--y:${y}%;--s:${s}px;--delay:${d}s"></span>`;
  }).join('');
}

function ritualConfig(themeId) {
  switch (themeId) {
    case 'birthday': return {
      label: 'MAKE A BIRTHDAY WISH', title: 'Blow out the candles.',
      instruction: 'Tap each candle to blow it out. When all the little flames are gone, the wish will open.',
      mode: 'birthday', goal: 5, actionLabel: 'All set'
    };
    case 'diwali': return {
      label: 'LIGHT THE FESTIVAL', title: 'Light the diyas.',
      instruction: 'Tap each diya to bring the scene to life. A fully lit moment opens the greeting.',
      mode: 'diwali', goal: 4, actionLabel: 'All lit'
    };
    case 'newyear': return {
      label: 'COUNTDOWN TO MIDNIGHT', title: 'Start the countdown.',
      instruction: 'Launch a tiny 3…2…1 celebration, then the fireworks will reveal the card.',
      mode: 'newyear', goal: 1, actionLabel: 'Start countdown'
    };
    case 'christmas': return {
      label: 'LIGHT THE TREE', title: 'Place the star on top.',
      instruction: 'Tap the glowing star to finish the tree and wake up the festive card.',
      mode: 'christmas', goal: 1, actionLabel: 'Light the tree'
    };
    case 'rakhi': return {
      label: 'CELEBRATE THE BOND', title: 'Tie the rakhi.',
      instruction: 'Complete the sibling ritual by tying the rakhi band, then the wish will appear.',
      mode: 'rakhi', goal: 1, actionLabel: 'Tie the rakhi'
    };
    case 'anniversary':
    default: return {
      label: 'LET LOVE BLOOM', title: 'Release the petals.',
      instruction: 'Tap the blooms to let them open one by one. When they bloom, the card blooms too.',
      mode: 'anniversary', goal: 3, actionLabel: 'All petals open'
    };
  }
}

function renderRitual(themeId) {
  const config = ritualConfig(themeId);
  ritualState = { theme: themeId, progress: 0, goal: config.goal, mode: config.mode, complete: false };
  $('ritualLabel').textContent = config.label;
  $('ritualTitle').textContent = config.title;
  $('ritualInstruction').textContent = config.instruction;
  $('ritualProgressText').textContent = `0 / ${config.goal} complete`;
  $('ritualBar').style.width = '0%';
  $('ritualAction').textContent = config.actionLabel;
  $('ritualAction').disabled = config.mode !== 'newyear' && config.mode !== 'christmas' && config.mode !== 'rakhi';

  let html = '';
  if (config.mode === 'birthday') {
    html = `<div class="ritual-visual ritual-birthday" data-mode="birthday"><div class="ritual-cake">${Array.from({length:5}, (_,i)=>`<button type="button" class="ritual-candle" data-candle="${i+1}" aria-label="Blow candle ${i+1}"><span class="wick"></span><span class="flame"></span></button>`).join('')}</div><div class="ritual-caption">Five tiny candles. Five little taps.</div></div>`;
  } else if (config.mode === 'diwali') {
    html = `<div class="ritual-visual ritual-diwali" data-mode="diwali">${Array.from({length:4}, (_,i)=>`<button type="button" class="ritual-diya" data-diya="${i+1}" aria-label="Light diya ${i+1}"><span class="diya-flame"></span><span class="diya-base"></span></button>`).join('')}<div class="ritual-caption">Bring every lamp to life.</div></div>`;
  } else if (config.mode === 'anniversary') {
    html = `<div class="ritual-visual ritual-anniversary" data-mode="anniversary">${Array.from({length:3}, (_,i)=>`<button type="button" class="ritual-bloom" data-bloom="${i+1}" aria-label="Bloom flower ${i+1}"><span class="bloom-core"></span><span class="petals"></span></button>`).join('')}<div class="ritual-caption">Open the blooms one by one.</div></div>`;
  } else if (config.mode === 'rakhi') {
    html = `<div class="ritual-visual ritual-rakhi" data-mode="rakhi"><div class="ritual-rakhi-band"><span class="band-left"></span><button type="button" class="rakhi-knot" id="ritualRakhiKnot" aria-label="Tie the rakhi"><span>✦</span></button><span class="band-right"></span></div><div class="ritual-caption">Tie the thread of love and protection.</div></div>`;
  } else if (config.mode === 'newyear') {
    html = `<div class="ritual-visual ritual-newyear" data-mode="newyear"><div class="countdown-core" id="countdownCore">3</div><div class="countdown-bursts" id="countdownBursts"></div><div class="ritual-caption">Ready for a miniature midnight?</div></div>`;
  } else if (config.mode === 'christmas') {
    html = `<div class="ritual-visual ritual-christmas" data-mode="christmas"><div class="tree-star-holder"><button type="button" class="tree-star" id="ritualTreeStar" aria-label="Place the star">✦</button></div><div class="tree-body">${Array.from({length:7}, (_,i)=>`<span class="tree-bauble b${i+1}"></span>`).join('')}</div><div class="ritual-caption">Place the star and light the tree.</div></div>`;
  }
  $('ritualCanvas').innerHTML = html;
}

function updateRitualProgress() {
  const pct = Math.round((ritualState.progress / ritualState.goal) * 100);
  $('ritualProgressText').textContent = `${ritualState.progress} / ${ritualState.goal} complete`;
  $('ritualBar').style.width = `${pct}%`;
}

function finishRitual() {
  ritualState.complete = true;
  $('recipientRitual').hidden = true;
  revealCard();
}

function ritualStepDone(message) {
  ritualState.progress += 1;
  updateRitualProgress();
  if (message) showToast(message);
  if (ritualState.progress >= ritualState.goal) {
    setTimeout(() => finishRitual(), 460);
  }
}

function startCountdownRitual() {
  if (ritualState.complete || ritualState.running) return;
  ritualState.running = true;
  $('ritualAction').disabled = true;
  const core = $('countdownCore');
  const bursts = $('countdownBursts');
  const steps = ['3', '2', '1', '✨'];
  steps.forEach((step, i) => {
    setTimeout(() => { if (core) core.textContent = step; }, i * 500);
  });
  for (let i = 0; i < 18; i += 1) {
    const dot = document.createElement('span');
    dot.className = 'count-burst';
    dot.style.setProperty('--x', `${Math.cos((Math.PI * 2 * i)/18) * (70 + (i%3)*18)}px`);
    dot.style.setProperty('--y', `${Math.sin((Math.PI * 2 * i)/18) * (70 + (i%3)*18)}px`);
    bursts.appendChild(dot);
    setTimeout(() => dot.remove(), 1800);
  }
  if (soundOn) playChime();
  setTimeout(() => ritualStepDone('Midnight magic unlocked ✨'), 2100);
}

function triggerActionRitual() {
  if (ritualState.mode === 'newyear') return startCountdownRitual();
  if (ritualState.mode === 'christmas') {
    const star = $('ritualTreeStar');
    if (star && !star.classList.contains('placed')) {
      star.classList.add('placed');
      document.querySelectorAll('.tree-bauble').forEach((b) => b.classList.add('lit'));
      ritualStepDone('The tree is glowing beautifully.');
    }
    $('ritualAction').disabled = true;
    return;
  }
  if (ritualState.mode === 'rakhi') {
    const knot = $('ritualRakhiKnot');
    if (knot && !knot.classList.contains('tied')) {
      knot.classList.add('tied');
      ritualStepDone('The rakhi is tied with love.');
    }
    $('ritualAction').disabled = true;
  }
}

function beginRecipientMoment() {
  if (!openedWish) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return revealCard();
  $('recipientClosed').hidden = true;
  $('recipientOpened').hidden = true;
  $('recipientRitual').hidden = false;
  renderRitual(openedWish.theme);
  $('ritualAction').focus({ preventScroll: true });
}

function revealCard() {
  $('recipientClosed').hidden = true;
  $('recipientRitual').hidden = true;
  $('recipientOpened').hidden = false;
  $('recipientOpened').classList.remove('is-visible');
  void $('recipientOpened').offsetWidth;
  $('recipientOpened').classList.add('is-visible');
  if (openedWish?.particles) burstStars(62);
  else if (soundOn) playChime();
  $('moreSparkles').focus({ preventScroll: true });
}

function burstStars(count = 42) {
  if (!openedWish?.particles) {
    showToast('Switch on Wish shower in the studio to enable sparkles.');
    return;
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const layer = $('confettiLayer');
  for (let i = 0; i < count; i += 1) {
    const el = document.createElement('span');
    const ang = (Math.PI * 2 * i) / count + Math.random() * 0.2;
    const distance = 80 + Math.random() * Math.min(window.innerWidth * 0.43, 400);
    el.className = 'burst-star';
    el.textContent = ['✦', '✳', '·', '✧', '♥'][i % 5];
    el.style.setProperty('--dx', `${Math.cos(ang) * distance}px`);
    el.style.setProperty('--dy', `${Math.sin(ang) * distance}px`);
    el.style.setProperty('--spin', `${Math.random() * 700 - 350}deg`);
    el.style.setProperty('--size', `${Math.random() * 20 + 12}px`);
    el.style.setProperty('--burst-color', i % 3 === 0 ? 'var(--t3)' : i % 3 === 1 ? '#fff' : '#f8b0e7');
    layer.appendChild(el);
    setTimeout(() => el.remove(), 1800);
  }
  if (soundOn) playChime();
}

function playChime() {
  try {
    audioContext ??= new (window.AudioContext || window.webkitAudioContext)();
    const t = audioContext.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t + i * 0.085);
      gain.gain.exponentialRampToValueAtTime(0.09, t + i * 0.085 + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.085 + 0.8);
      osc.connect(gain); gain.connect(audioContext.destination);
      osc.start(t + i * 0.085); osc.stop(t + i * 0.085 + 0.83);
    });
  } catch {}
}

function setRecipientContent(input) {
  const sanitized = sanitizeWish(input);
  const theme = getTheme(sanitized.theme);
  const tone = getTone(sanitized.tone);
  openedWish = sanitized;
  applyTheme($('recipientView'), theme);
  applyTheme($('openedCard'), theme);
  $('receiverFrom').textContent = `A GIFTED GREETING FROM ${sanitized.from.toUpperCase()}`;
  $('receiverHello').replaceChildren(document.createTextNode(`${sanitized.to}, this one’s`), document.createElement('br'));
  const em = document.createElement('em'); em.textContent = 'crafted for you.'; $('receiverHello').appendChild(em);
  $('openedOverline').textContent = `${theme.label} · ${tone.label.toUpperCase()}`;
  $('openedName').textContent = sanitized.to;
  $('openedGreeting').textContent = theme.greeting;
  $('openedMessage').textContent = sanitized.message;
  $('openedFrom').textContent = sanitized.from;
  $('openedRelation').textContent = `FOR MY ${sanitized.relation.toUpperCase()}`;
  $('openedMemory').textContent = sanitized.memory || theme.headline;
  $('openedMotif').textContent = theme.motifs[0];
  $('openedIllustration').src = getArtUrl(theme.id);
  $('openedCard').dataset.finish = sanitized.finish;
  $('openedCard').classList.toggle('name-long', sanitized.to.length > 17);
  $('openedCard').classList.toggle('long-copy', sanitized.message.length > 170);
  $('memoryReveal').classList.toggle('is-sealed', Boolean(sanitized.hideMemory && sanitized.memory));
  $('memoryReveal').setAttribute('aria-expanded', String(!(sanitized.hideMemory && sanitized.memory)));
  $('memorySealLabel').hidden = !(sanitized.hideMemory && sanitized.memory);
  $('memoryReveal').disabled = !(sanitized.hideMemory && sanitized.memory);
  $('memoryReveal').hidden = !sanitized.memory;
  $('recipientClosed').hidden = !sanitized.secret;
  $('recipientRitual').hidden = true;
  $('recipientOpened').hidden = Boolean(sanitized.secret);
  $('recipientView').hidden = false;
  document.body.classList.add('viewer-active');
  if (!sanitized.secret && sanitized.particles) setTimeout(() => burstStars(36), 250);
  if (sanitized.secret) $('unwrapAction').focus({ preventScroll: true });
  else $('moreSparkles').focus({ preventScroll: true });
}

function openReceiver(input) { setRecipientContent(input); }

function closeReceiver({ reply = false } = {}) {
  $('recipientView').hidden = true;
  document.body.classList.remove('viewer-active');
  $('confettiLayer').replaceChildren();
  $('recipientRitual').hidden = true;
  ritualState = { theme: '', progress: 0, goal: 1, mode: 'action', complete: false };
  if (window.location.search.includes('wish=')) window.history.replaceState({}, '', window.location.pathname);
  if (reply && openedWish) {
    wish = { ...DEFAULT_WISH, theme: openedWish.theme, tone: openedWish.tone, relation: openedWish.relation, finish: openedWish.finish, hideMemory: openedWish.hideMemory, to: openedWish.from, from: '', memory: getTheme(openedWish.theme).headline, message: suggestedMessage(getTheme(openedWish.theme), openedWish.tone) };
    updateInputs();
    requestAnimationFrame(() => $('studio').scrollIntoView({ behavior: 'smooth' }));
    $('fromInput').focus({ preventScroll: true });
  }
}

function bindEvents() {
  $('toInput').addEventListener('input', (event) => { wish.to = event.target.value; updatePreview(); });
  $('fromInput').addEventListener('input', (event) => { wish.from = event.target.value; updatePreview(); });
  $('relationInput').addEventListener('change', (event) => { wish.relation = event.target.value; updatePreview(); });
  $('memoryInput').addEventListener('input', (event) => { wish.memory = event.target.value; updatePreview(); });
  $('messageInput').addEventListener('input', (event) => { wish.message = event.target.value; updatePreview(); });
  $('secretToggle').addEventListener('change', (event) => { wish.secret = event.target.checked; });
  $('hideMemoryToggle').addEventListener('change', (event) => { wish.hideMemory = event.target.checked; });
  $('particlesToggle').addEventListener('change', (event) => { wish.particles = event.target.checked; });
  $('shuffleMessage').addEventListener('click', () => {
    wish.message = suggestedMessage(getTheme(wish.theme), wish.tone);
    $('messageInput').value = wish.message;
    updatePreview();
    showToast('Fresh message suggestion loaded. Make it yours ✨');
  });
  $('copyLink').addEventListener('click', copyShareUrl);
  $('shareWhatsapp').addEventListener('click', () => {
    const url = getWhatsAppUrl(wish); const tab = window.open(url, '_blank', 'noopener,noreferrer'); if (!tab) window.location.assign(url);
  });
  $('downloadPng').addEventListener('click', async () => {
    const btn = $('downloadPng'); const old = btn.innerHTML; btn.disabled = true; btn.textContent = 'Creating your premium card…';
    try { await document.fonts.ready; await downloadWishPng(wish); showToast('Your greeting PNG is ready to save.'); }
    catch (error) { showToast('Couldn’t generate the PNG. Please try again.'); console.error(error); }
    finally { btn.disabled = false; btn.innerHTML = old; }
  });
  $('previewWish').addEventListener('click', () => openReceiver(wish));
  $('fallbackClose').addEventListener('click', closeFallback);
  $('selectFallback').addEventListener('click', () => $('fallbackUrl').select());
  $('shareFallback').addEventListener('click', (event) => { if (event.target === $('shareFallback')) closeFallback(); });
  $('unwrapButton').addEventListener('click', beginRecipientMoment);
  $('unwrapAction').addEventListener('click', beginRecipientMoment);
  $('ritualAction').addEventListener('click', triggerActionRitual);
  $('ritualSkip').addEventListener('click', revealCard);
  $('ritualCanvas').addEventListener('click', (event) => {
    const candle = event.target.closest('.ritual-candle');
    if (candle && !candle.classList.contains('done')) {
      candle.classList.add('done'); ritualStepDone('A candle went out.'); return;
    }
    const diya = event.target.closest('.ritual-diya');
    if (diya && !diya.classList.contains('lit')) {
      diya.classList.add('lit'); ritualStepDone('A diya has been lit.'); return;
    }
    const bloom = event.target.closest('.ritual-bloom');
    if (bloom && !bloom.classList.contains('open')) {
      bloom.classList.add('open'); ritualStepDone('A bloom opened.'); return;
    }
    const knot = event.target.closest('#ritualRakhiKnot');
    if (knot && !knot.classList.contains('tied')) {
      knot.classList.add('tied'); ritualStepDone('The rakhi is tied with love.'); $('ritualAction').disabled = true; return;
    }
    const star = event.target.closest('#ritualTreeStar');
    if (star && !star.classList.contains('placed')) {
      star.classList.add('placed'); document.querySelectorAll('.tree-bauble').forEach((b) => b.classList.add('lit')); ritualStepDone('The tree has been lit.'); $('ritualAction').disabled = true;
    }
  });
  $('moreSparkles').addEventListener('click', () => burstStars(56));
  $('memoryReveal').addEventListener('click', () => {
    if (!$('memoryReveal').classList.contains('is-sealed')) return;
    $('memoryReveal').classList.remove('is-sealed'); $('memoryReveal').setAttribute('aria-expanded','true'); $('memoryReveal').disabled = true;
    if (openedWish?.particles) burstStars(22); if (soundOn) playChime();
  });
  $('makeOneBack').addEventListener('click', () => closeReceiver({ reply: true }));
  $('viewerBrand').addEventListener('click', (event) => { event.preventDefault(); closeReceiver(); });
  $('soundToggle').addEventListener('click', () => {
    soundOn = !soundOn; $('soundToggle').innerHTML = `${icon(soundOn ? 'volume' : 'volumeoff')}<span>${soundOn ? 'SOUND ON' : 'SOUND OFF'}</span>`;
    $('soundToggle').setAttribute('aria-label', soundOn ? 'Turn sound off' : 'Turn sound on'); if (soundOn) playChime();
  });
  $('mobileNav').querySelectorAll('a').forEach((link) => link.addEventListener('click', () => { $('mobileNav').hidden = true; $('menuToggle').setAttribute('aria-expanded', 'false'); }));
  $('menuToggle').addEventListener('click', () => {
    const expanded = $('menuToggle').getAttribute('aria-expanded') === 'true'; $('menuToggle').setAttribute('aria-expanded', String(!expanded)); $('mobileNav').hidden = expanded;
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (!$('shareFallback').hidden) closeFallback();
      if (!$('recipientView').hidden) closeReceiver();
    }
  });
}

function initFromSharedUrl() {
  const shared = getSharedWish();
  if (shared) {
    const robots = document.createElement('meta');
    robots.name = 'robots'; robots.content = 'noindex,nofollow'; document.head.appendChild(robots);
    wish = { ...wish, ...shared }; updateInputs(); requestAnimationFrame(() => openReceiver(shared));
  }
}

function initYear() { const yearEl = $('year'); if (yearEl) yearEl.textContent = String(new Date().getFullYear()); }

function init() {
  buildThemeCards(); buildThemePills(); buildTonePills(); buildFinishPills(); buildRelationOptions(); bindEvents(); starField(); initYear(); updateInputs(); initFromSharedUrl();
}

init();
