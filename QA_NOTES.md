# Phase 6 QA — Memory Theatre

## Completed and confirmed

- Phase 5's 24 named templates, three finishes, old links and Unicode-safe share format preserved.
- New soundscape choice added to text-only shared URL, with allowlisted validation.
- Local JPEG photo resizing and preview, photo deletion.
- Attached WAV voice playback and removal in browser tests; recording UI implemented with permission handling, 15-second limit and track cleanup.
- Generated offline HTML with embedded photo and audio, escaped user-provided text and restrictive CSP. Opened standalone HTML preview in Chromium: photo rendered, audio source present.
- PNG export now includes a small photo thumbnail, verified dimensions 1080 × 1350.
- Recipient preview includes a separate photo/voice chapter. Existing interaction-to-open ritual was smoke-tested via skip-to-reveal on Phase 6 and previously validated in Phase 5.
- Mobile widths 390 and 320 px: no page errors or horizontal overflow in Phase 6 scenarios.
- Photo/voice binaries intentionally absent from shared URLs and drafts.
- No backend, server upload or persistent media URL added.

## Automated commands and outcomes

- `npm test` — PASS (Phase 5 regressions + Phase 6 soundscape, legacy-link and HTML escaping tests)
- `python scripts/phase6-browser-qa.py` — PASS (desktop, mobile, small-mobile; upload/photo+audio, generated HTML, PNG download, opened recipient scene, no overflow)
- Standalone generated keepsake opened separately in Chromium — PASS (embedded photo rendered and embedded audio present)

## Limitations needing physical-device checks

- Actual microphone permission and recording device quality; tests covered audio attachments, not a live microphone.
- Whether particular mobile apps/email clients allow `.html` file attachments (many block them for security).
- Cross-browser photo processing, especially Safari and low-memory mobile devices.
- Production hosting, domain DNS, SSL, contact channel and policy review were not performed.
