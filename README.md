# Wishverse — Phase 8: Public Launch & Production Hardening

A responsive, static, no-account greeting platform for `greetings.mananbhayani.online`. **Not yet deployed**. This release builds on Phase 7 and keeps all prior functionality intact.

## New in Phase 8

- Progressive web app: manifest, icons, offline fallback, public asset cache (no user media/drafts in SW)
- Better share-mode disclosure beside the editor's send controls
- New help/FAQ page with realistic explanations about privacy and media attachment limits
- Static security headers including CSP, frame, MIME and referrer protections
- Release audit checks internal asset paths, localized guides, sitemap, icons, and disallowed source files
- Improved legacy `?wish` link handling, migrating it to a `#wish` fragment when received
- Dedicated Cloudflare Git/Direct-Upload launch instructions, risk checklist and optional future media-hosting architecture
- Added `phase8-test.mjs` regression tests for link migration and offline behavior

## Existing features retained

- Six occasion worlds, 24 templates, three finishes
- English, Hindi and Gujarati personalized greetings and 18 public guides
- Occasion rituals, sealed note and return greeting journey
- Browser-local drafts
- Local photo and voice editor, original synthesizer soundscapes, offline keepsake
- WhatsApp and copy-link sharing, PNG export

## Local development

```bash
python3 -m http.server 5173
```

Then open `http://localhost:5173`. Microphone support works on localhost or HTTPS with permission.

## Test and build

```bash
npm test
python3 scripts/phase7-browser-qa.py
npm run audit
```

`npm run audit` builds `dist/` and checks the deployable package. No npm dependencies need installation for basic development; the Python audit requires `beautifulsoup4` and `Pillow`, and optional browser QA uses Playwright + a supported Chromium installation.

## What to upload

- **Source ZIP**: developer version with scripts, assets, docs.
- **Cloudflare Direct Upload ZIP**: root contains `index.html`, `_headers`, `src/`, guide folders, manifest, icons, SW. Use only for a newly created Direct Upload project.

For continual upgrades, prefer **Git integration** before you create the Pages project. Direct Upload projects cannot be converted to Git-integrated projects later.

See `DEPLOYMENT.md`, `LAUNCH_CHECKLIST.md`, `MEDIA_LINK_ARCHITECTURE.md` and `RELEASE_AUDIT.json` for exact status and responsibilities.

**Not done:** live deployment, domain change, working support contact, AdSense, cloud media uploads, real-device QA.
