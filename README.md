# Wishverse · Phase 7 — Global Wishes / Launch Foundation

Phase 7 extends the complete Phase 6 static prototype with a discoverable, original multilingual greeting library and a Cloudflare-ready public deployment package. **Not yet deployed to your domain.**

## What's new

- 18 original static occasion guide pages: 6 occasions × English, Hindi and Gujarati.
- Four example wishes per guide (72 original, localized wishes total), plus thoughtful, occasion-specific usage advice and an entry to the card creator.
- Each guide has its own canonical URL, meta description, Open Graph metadata, and reciprocal `hreflang` links.
- Home page greeting language selector: English / हिन्दी / ગુજરાતી. Affects suggested message, greeting heading, recipient reveal, PNG export and offline keepsakes; never changes user's own writing.
- A home page “Wishes & ideas” discovery section with links to the appropriate language and occasion.
- **New links use `#wish=` fragments** rather than query parameters so names and personal messages generally stay out of HTTP page requests. Old `?wish=` links remain supported. Links are readable by anyone who has them; this is not encryption.
- Site `sitemap.xml`, `robots.txt`, `_headers` with privacy-minded response headers and a custom `404.html`.
- Readable, keyboard-friendly mobile navigation including Escape to close, and responsive guide pages.
- Deployment ZIP with web files at archive root, separate from the source archive.

## Existing features preserved

24 illustrated templates, 3 finishes, six occasion rituals, secret reveal, sealed notes, browser-only saved drafts, 1080×1350 PNGs, photo and 15-second voice media, synthesized soundtrack, offline multimedia keepsake, WhatsApp/link sharing. **Photo and voice do not go inside share URLs.**

## Run locally

Start in this directory:

```bash
python -m http.server 5173
```

Open `http://localhost:5173`.

Examples:
- `http://localhost:5173/occasions/diwali/`
- `http://localhost:5173/hi/occasions/birthday/`
- `http://localhost:5173/gu/occasions/diwali/`
- `http://localhost:5173/?occasion=diwali&lang=gu#studio`

No `npm install` is necessary to run the site. Modern browser APIs are required for sound, photos and voice recording. Use localhost or HTTPS for the microphone.

## Tests

```bash
npm test
python scripts/phase7-browser-qa.py
```

The browser test uses an isolated browser document due to environment restrictions; it does not validate deployed HTTP hosting or actual microphone permissions.

## Updating the guide library

Edit `scripts/build_occasion_pages.py` (hand-authored localized content) and rebuild:

```bash
python scripts/build_occasion_pages.py
```

This regenerates localized guides and the sitemap. Avoid uploading an old sitemap after modifying guide paths.

## Deployment

See `DEPLOYMENT.md` and `LAUNCH_CHECKLIST.md`. The `Wishverse_Phase7_Cloudflare_Upload.zip` archive contains only public site assets (no internal tests, QA images, or source build scripts). It can be used for Cloudflare Pages Direct Upload. For Git integration, set build command to `bash scripts/build_deploy.sh` and output directory to `dist`.

**Direct Upload is a different Pages project mode than Git integration.** Choose Git integration first for ongoing automated updates; Cloudflare currently does not allow converting an existing Direct Upload project to Git integration.

**Not done in this phase:** domain connection, production contact/support details, actual AdSense approval or ad placement, server-hosted photo/voice links, human review of every language translation by a native editor, legal compliance certification, or production availability tests.
