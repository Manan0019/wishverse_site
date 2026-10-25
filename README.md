# Wishverse · Phase 6 — Memory Theatre

The sixth **runnable static prototype** of Wishverse, built on Phase 5. It includes 24 occasion-specific card templates × 3 finishes, six interactive opening rituals, Unicode-safe personalized greeting links, saved text drafts, and new offline photo/voice keepsakes.

## Phase 6 additions

### Memory Studio
- Upload one photo (`image/*`, 8 MB input max) that is resized locally to JPEG at no more than 1280 px on the longest side.
- Record a voice note using the browser microphone (stops automatically at 15 seconds, if supported and permission granted) or attach an existing short WAV, WebM, Ogg, MP3, or MP4 audio clip (max ~2.2 MB). The user can preview or remove it.
- Choose between four soundscape modes: Quiet Magic, Starlight, Golden Warmth, Midnight Glow. The short original melodies are synthesized locally with Web Audio; they do not use third-party music files. Sound is off by default in the recipient view.
- Preview the photo and voice as an extra recipient **Memory Theatre** chapter below the card.
- **Keepsake HTML download:** creates a standalone HTML attachment including the greeting text, photo and audio. No network, server, external images, or script required. The recipient can open the downloaded file in a compatible browser (mobile apps may restrict HTML attachments).
- Card PNG download includes a small thumbnail of the selected photo in addition to the existing illustration and personal text. Voice is not embedded in PNG, since PNG is not an audio format.

### Honest sharing behavior

- `Copy premium link` and WhatsApp sharing still work for the **text, occasion, template, tone, finish, and soundscape selection only**. Personal photo/audio files are **not** in the URL.
- This Phase 6 prototype does **not** upload user media, produce a permanent photo/voice URL, or synchronize media across devices.
- For full photo/voice delivery, **send the exported Keepsake HTML as a file attachment**. Some email/IM services block HTML attachments for security. Alternative is to send a card PNG plus audio attachment separately.
- On-device drafts store **text and settings only**, not media. Reopening drafts clears temporary media to avoid misattribution.
- Uploaded/recorded content is processed in memory and disappears on refresh, unless the user exported it or their own browser kept downloaded copies.

## Run locally

Extract this folder and run from it:

```bash
python -m http.server 5173
```

Open `http://localhost:5173`.

No npm install is needed for the website. A modern browser and secure context (`https` or `localhost`) are needed for microphone recording.

## Test

```bash
npm test
python scripts/phase6-browser-qa.py
```

Browser QA runs an isolated, inline preview through Playwright to avoid local routing restrictions. It uses generated safe JPEG/WAV fixtures and checks upload, export, preview, and responsive layout. It doesn't request a real microphone, so microphone hardware/permission behavior requires **real-device testing**.

## Deployment

This remains a static project. Deploy the root contents (`index.html`, `src`, `assets`, etc.) to Cloudflare Pages with **no build command**, then add the proposed `greetings.mananbhayani.online` custom subdomain and check real hosted browsers before publication. HTTPS is necessary for voice recording.

The site is **not yet deployed**; no AdSense code or approval is included. Before public launch, configure contact, legal/privacy content and operational safeguards. Media hosting and user accounts, if desired later, require a designed backend/storage workflow with retention and abuse controls.

## Important privacy / security

- URL-encoded names and messages are **not encrypted**. Anyone with the link can read them, so do not include secrets.
- HTML keepsakes embed the recipient's photo/audio in the file. Share only with trusted recipients and do not treat the file as access-controlled.
- The generated keepsake escapes text and uses a restrictive Content Security Policy. Any file format can still be mishandled by third-party apps; open files from people you trust.
- Browser microphone permissions must be granted interactively; recording starts only when requested by the sender.

## Source map

- `src/main.js`: editor, card selection, media capture and rituals.
- `src/data/themes.js`, `src/data/templates.js`: occasion/template data.
- `src/lib/memory.js`: photo resizing, media conversion, self-contained keepsake export.
- `src/lib/soundscapes.js`: original synthesized soundscape definitions.
- `src/lib/share.js`: text-only personalized links; tone/finish/soundscape validation.
- `src/lib/download.js`: 1080 × 1350 PNG export with optional photo thumbnail.
- `src/lib/drafts.js`: browser-local text drafts.
- `src/styles.css`: responsive styling.
- `assets/art/`: six original SVG occasion artworks.
