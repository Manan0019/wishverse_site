# Wishverse Phase 8: Cloudflare Pages launch instructions

**Planned site:** https://greetings.mananbhayani.online
**Domain preservation:** `mananbhayani.online` remains free for your personal portfolio.
**Status:** Phase 8 package locally validated. No Cloudflare account, registrar/DNS, GitHub repository, domain, Google Analytics, Search Console, or AdSense changes have been performed.

## Preferred long-term path: Cloudflare Pages with GitHub integration

1. Create a dedicated GitHub repository for this Wishverse source. Use a private repository if preferred. Commit the **Phase 8 source directory** (not a nested `dist` folder), with no passwords, .env, user media, or API credentials.
2. In https://dash.cloudflare.com/ open **Workers & Pages**, create a Pages project with **Git integration**, and select the Wishverse repository.
3. Configure:
   - Production branch: your main source branch
   - Build command: `bash scripts/build_deploy.sh`
   - Build output directory: `dist`
   - Framework preset: None / static
   - Environment variables: none required
4. Deploy and test the actual generated `*.pages.dev` URL. This is a real website, but not yet your custom domain.
5. Open Pages project → **Custom domains** → **Set up a domain**, then enter `greetings.mananbhayani.online`.
6. Follow Cloudflare's wizard. If DNS is managed at an external registrar, add the requested **CNAME** with name `greetings` pointing to the **actual** Pages hostname assigned in step 4, for example `<project>.pages.dev`. Do **not** guess the hostname. If the zone is already on Cloudflare, the record can be added automatically.
7. Wait for HTTPS and DNS to activate; do not change the apex/root domain's DNS record. Verify both `https://greetings.mananbhayani.online/` and guide URLs such as `/gu/occasions/diwali/`.
8. Deploy revised packages through Git; preview/test first for template, message sharing, voice permissions, and footer/support pages.

## Alternative: ZIP Direct Upload (manual updates)

The ZIP named `Wishverse_Phase8_Cloudflare_Direct_Upload.zip` has `index.html` and `_headers` at ZIP root. In Cloudflare Workers & Pages, create a **Direct Upload** Pages project and drag/drop that ZIP. Test the assigned `*.pages.dev` address and add the custom subdomain through Pages Custom Domains.

**Important:** A Direct Upload project cannot later be converted into a Git-integrated project. For frequent future phases, use Git integration now to avoid redeploying to a new project later.

## Security and performance included

- Static `_headers`: `Content-Security-Policy`, no-sniff, no-referrer, frame protections, Permissions Policy. **Update CSP if adding AdSense/analytics or third-party resources.**
- `site.webmanifest` + app icons + `sw.js`: progressive/offline public-site shell; no photos/voice or draft records are written to service-worker caches.
- Public guides have canonical/hreflang and sitemap; shared-card fragments are not part of the HTTP request. Older `?wish` links are converted to fragment links in the browser after they load. Their initial query parameters can still have reached the server/logs.
- Offline support is progressive enhancement, not a promise that every browser/device will cache every page.

## Functional checks to perform on the deployed site

1. Homepage and 18 public guide pages load with HTTPS and appropriate localized content.
2. Select a template/finish and English/Hindi/Gujarati language, make a wish, open recipient preview, and finish an occasion ritual.
3. Copy a sharing link; open it in a clean phone browser without being logged in. Check sender/recipient and note.
4. Test actual WhatsApp sharing and generic Open Graph thumbnail (personalized OG thumbnails require server-side image generation).
5. Test voice recording on HTTPS on iOS Safari, Android Chrome, and desktop. User must give permission.
6. Test photo PNG and offline Keepsake exports, including opening the exported files on another device.
7. Verify Help, About and Privacy pages; add **real support contact details before public launch**.
8. If offline support is enabled by your browser, load the site, disconnect the network, and reopen the cached homepage. Verify reconnect/update behavior.
9. Confirm no test labels, development placeholder email, or ads appear. Only apply to AdSense once policies, content quality, and user privacy/consent are reviewed.

## DO NOT LAUNCH UNTIL

- Real support contact method is configured and tested.
- Real-domain DNS/TLS status is confirmed.
- Human copy/translation and browser/device QA passes.
- Owner verifies legal/privacy notices and intended public content.

Official Cloudflare references:
- https://developers.cloudflare.com/pages/get-started/direct-upload/
- https://developers.cloudflare.com/pages/configuration/custom-domains/
- https://developers.cloudflare.com/pages/configuration/headers/
