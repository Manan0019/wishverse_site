# Phase 8 QA — Release Candidate

Date: 25 October 2026

## Source and build results

- `npm test`: PASS — Phase 7 smoke checks and new Phase 8 migration/offline cache rules.
- `python scripts/phase7-browser-qa.py`: PASS — desktop 1440px, mobile 390px and narrow mobile 320px, Unicode card, localized selection and recipient reveal.
- `python scripts/phase8-browser-qa.py`: PASS — desktop/mobile/narrow mobile, dynamic sharing-media disclosure, text editing and ritual preview; 11 Help/FAQ answers rendered.
- `npm run audit`: PASS — 24 HTML pages, 18 localized guides, 494 checked internal asset references, 22 sitemap entries, no missing deploy assets or leaked developer docs/scripts in `dist/`.
- New icon dimensions and manifest validated. Offline public fallback behavior unit-tested with mock service worker environment.

## Release scope

- Progressive install manifest, app icons, offline public page and privacy-aware public-asset cache.
- Security policy headers; metadata remains static, with generic Open Graph previews.
- Dedicated Help/FAQ with realistic link/media-sharing limitations.
- Clear inline sharing summary and status when a photo or voice recording is attached.
- Query-based old links immediately rewritten as hash-fragment links after the initial page request (does not erase data from any upstream access logs).

## Not yet accepted in production

- Actual live Pages deployment/DNS/SSL has not been performed.
- Actual PWA installation/reload on a real origin, voice permission on a physical phone, and WhatsApp external integration remain untested.
- Support contact is not configured. Hindi/Gujarati copy has not received final native human proofreading. Privacy/legal language and AdSense compliance still need owner review.
- CSP has not been verified against future external ad/analytics integrations; update it before adding third-party scripts.
- Backend/cloud photo & voice sharing is only an architectural plan, not part of this package.

**Conclusion:** Locally validated static release package, **not an approved public launch**.


## Phase 9 — Share Studio acceptance

- Static Share Studio, QR invitation export, five destination choices, and recipient reactions implemented.
- QR encoder is self-hosted under the MIT license; no external QR-image request.
- Downloaded 1600×2000 invitation was decoded with pyzbar successfully, producing the full personalized link.
- Playwright isolated UI checks at 1440px, 390px and 320px exercised QR canvas creation, poster download, native-share fallback, ESC close, and recipient reaction selection.
- Launch still requires live domain/DNS verification and a real-mobile HTTPS share test.
