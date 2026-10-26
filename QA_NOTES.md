# Phase 12 QA — Secret Wish Vault

- Source: user-uploaded `wishverse_site.zip`, extracted without `.git`.
- Updated demo recipient: Anaya, including HTML, defaults and regression fixture references.
- `npm test`: PASS, Phases 1–12.
- `phase12-browser-qa.py`: desktop 1440x900, mobile 390x844, narrow mobile 320x720 all PASS. Recipient vault opening/closing, three-gift reveal, disabled mode, card follow/dock, no JavaScript page errors, no horizontal overflow.
- `npm run audit`: PASS; clean Cloudflare dist with zero errors/warnings.
- Long Gujarati text + Storybook + Vault round-trip: PASS after increasing share payload ceiling.
- Standalone keepsake escaping for user-supplied HTML: PASS.
- Existing site remains unhosted; real iOS/Android, support contact, Cloudflare DNS, legal/AdSense review pending.

# Phase 11 Verification

- Complete cumulative copy from Phase 10, verified.
- New Storybook unit tests: PASS.
- Desktop, 390px and 320px in-memory browser tests: PASS.
- Sticky preview regression preserved from Phase 10.
- Offline keepsake Storybook content and escaping: PASS.
- Static release audit: 0 errors and 0 warnings.
- Real public-domain deployment and native-device QA remain pending.

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

## Phase 10 — Motion Studio QA (26 October 2026)

### Verified source and browser checks

- `npm test`: PASS for previous phases and Phase 10 motion/seal/Unicode/backward-link tests.
- `npm run audit`: PASS — 24 HTML pages, 18 multilingual guides, 494 internal references, 22 sitemap entries, zero release-audit errors/warnings.
- Isolated Chromium Playwright scroll checks: 1440×900 sticky preview stays fully visible at name, message, bottom download button; `previewPanel` top about 86px at each checkpoint.
- Mobile 390×844 and narrow mobile 320×720: live dock visible at top, middle and lower controls, and hidden when preview is in view.
- Focus preview moves and restores the same card; recipient ritual/reveal and signature seal checked at each size.
- PNG export performed with Love seal and kept the expected filename / dimensions.
- Long custom messages plus long names tested at 1024×700, 1280×690, 1440×650: resized sticky card did not overlap action controls, with no horizontal overflow.
- CSS layout fixes: footer/signature and action buttons no longer crop/overlap; 320px focus modal scrolls instead of compressing its footer controls.

### Limitations / operator gates

- Real Safari/iOS, real Android devices, and microphone permission still require manual validation.
- The static domain is not yet connected, so end-user live sharing and QR scanning require deployment.
- Video-like recordings or hosted shared voice/photo content have not been added. The Phase 6 memory attachment approach is unchanged.
- Effects honor `prefers-reduced-motion`, but real-device performance should be monitored on lower-end phones.
- Content, privacy, support contact, and AdSense review are still needed before production.
