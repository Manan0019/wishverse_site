# Phase 7 QA Evidence

- Node `npm test`: original Phase 5/6 regression tests and Phase 7 localized content/link checks: PASS.
- Playwright in-memory browser QA (`python scripts/phase7-browser-qa.py`): PASS at 1440px, 390px, 320px. No JS runtime errors or horizontal overflow detected.
- Tested Hindi and Gujarati message selection, custom text preserved across language changes, selected occasion localization, Unicode share encoding, fragment-based link output, recipient interactive reveal, actual PNG download (1080×1350), and localized Diwali static guide.
- External network navigation and real hosted Cloudflare routing were not tested; deployment and real phone/microphone validation are outstanding.
- Only selected guide page screenshot reviewed automatically; all 18 pages statically generated and checked via tests. Language proofreading by a native speaker remains recommended.
