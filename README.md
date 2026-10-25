# Wishverse · Phase 5 — The Template Universe

A **real runnable, static, mobile-first greeting website** built on the Phase 4 Living Moments foundation. This is a working source prototype, not a deployed website.

## New in Phase 5

- **24 occasion-specific templates** — four curated art directions per occasion:
  - Birthday: Confetti Royale / The Birthday Edit / Sunday Cake / Midnight Wishes
  - Anniversary: Rose Atelier / Letters in Gold / Softly, Forever / Moonlit Promise
  - Diwali: Royal Utsav / The Golden Hour / Rangoli Reverie / Midnight Diyas
  - Raksha Bandhan: The Sacred Thread / Sibling Stories / Forever Connected / Raksha Starlight
  - New Year: Firework Symphony / After Midnight / Fresh Beginnings / Celestial Countdown
  - Christmas: Holiday Wonder / A Winter Letter / The Cozy Season / Northern Lights
- **Four independent layouts** — illustrated, editorial, minimal, and celestial.
- **Three finishes per template** — Radiance, Velvet, Heirloom (72 template/finish combinations).
- **Live template gallery** with original artwork, click-to-apply selection and a Surprise Me option.
- **Local draft library** — save, open, or remove up to eight drafts in this browser using localStorage, no accounts/database required.
- **Template identity travels with the shared greeting link**, survives Unicode encoding/decoding, and appears in the receiver experience.
- **Template-aware PNG export** — produces a 1080 × 1350 PNG with the selected color palette, composition treatment and template name.
- **Backward-compatible links** — older Phase 4 URLs without a template load the default preset for that occasion.
- **Improved mobile layout** and fixed minimal-card signature clipping.
- **Countdown cancellation guard** prevents delayed ritual callbacks reopening a dismissed greeting.

## Preserved from Phase 4

- Six distinct occasion worlds with original vector illustrations.
- Personalized names, relationship, memory, custom message, three tones.
- Optional secret opening, hidden memory note, celebration particles, optional chime.
- Six living rituals: candles, petals, diyas, rakhi, countdown, Christmas tree star.
- One-click link, WhatsApp sharing, PNG, reply-back greeting.
- No login and no server-side greeting database.

## Run locally

From the `wishverse_phase5` directory:

```bash
python -m http.server 5173
```

Open `http://localhost:5173` (Python can serve ES modules directly). No npm installation or production build is needed. Node is used only for optional tests.

## Test

```bash
npm test
python scripts/browser-qa.py
```

Browser QA requires Playwright Python and local Chromium. The QA helper assembles an isolated browser preview without depending on network or local file navigation. **Do not deploy the QA scripts.**

## Deploy to Cloudflare Pages

Deploy the root directory containing `index.html` as a static site, with no build command. Then attach `greetings.mananbhayani.online` in Cloudflare Pages using the DNS configuration shown by Cloudflare. Publish only after doing real hosted-browser acceptance checks and configuring a working contact channel. Domain/DNS changes are **not performed** by this package.

## Privacy and product limitations

- Shared greeting links embed names and messages. Encoding is **not encryption**. Anyone with the link can read them.
- Drafts remain only in the current browser's localStorage. They are not account-backed, synced or available on another device, and clearing browser data deletes them.
- The website does not upload photos or audio; do not assume these are supported by this phase.
- No AdSense code is included and **AdSense approval is not guaranteed**. The website needs real original editorial content, policy review and a contact channel before applying.
- The generic Open Graph preview is site-level. Fully personalized per-link OG preview images require server-side rendering/storage.

## Maintainable source map

- `index.html`: semantic site / editor / recipient flow
- `src/data/themes.js`: occasion data
- `src/data/templates.js`: 24 templates and selection logic
- `src/lib/share.js`: Unicode-safe personalized link format
- `src/lib/drafts.js`: on-device draft storage utilities
- `src/lib/download.js`: PNG canvas generation
- `src/main.js`: UI behavior / events / six recipient rituals
- `src/styles.css`: site styling, responsive layout and template art direction
- `assets/art/`: six original SVG illustrations
- `scripts/`: nonproduction smoke and browser QA
