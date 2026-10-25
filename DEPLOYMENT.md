# Wishverse Phase 7 · Deploy to Cloudflare Pages

Planned production address: **https://greetings.mananbhayani.online/**. This domain is **not deployed** merely by opening or downloading these files.

## Option A — Git integration (recommended for continued development)

1. Create a new private or public GitHub repo for Wishverse (do not commit secrets). Push the full Phase 7 source repository. The included deployment script builds a clean `dist/` directory from the public assets.
2. In Cloudflare dashboard → Workers & Pages → Create application → Pages → Import an existing Git repository.
3. Choose your repo and production branch. Set **Build command** to `bash scripts/build_deploy.sh` and **Build output directory** to `dist`. No npm dependency installation or framework compilation is required.
4. Deploy. Verify the generated `*.pages.dev` URL, the guide pages, the recipient link, PNG/keepsake exports, and the privacy policy.
5. Pages project → **Custom domains** → **Set up a domain** → add `greetings.mananbhayani.online`.
6. Follow Cloudflare's displayed DNS setup. If your DNS remains at an external registrar, create a CNAME for `greetings` pointing to your *actual* `<pages-project>.pages.dev` hostname (not an invented one). Wait for domain and HTTPS verification.
7. Verify the public site on mobile and desktop, including microphone permission over HTTPS.

## Option B — Direct Upload

1. Create a Cloudflare Pages Direct Upload project in Workers & Pages. It cannot later be converted to Git integration; automatic Git publishing would require a different Pages project.
2. Drag and drop **Wishverse_Phase7_Cloudflare_Upload.zip** (web files at zip root). Cloudflare supports ZIP or folder uploads from the dashboard.
3. Check the Pages deployment URL. Set up the custom subdomain under the Pages project as described above.

## DNS and cache safeguards

- **Use the Pages project Custom Domains workflow before adding the DNS record**; a manually created CNAME alone is not sufficient.
- Leave `mananbhayani.online` available for your future personal portfolio. Only point the `greetings` subdomain at Wishverse.
- `_headers` applies modest security/privacy headers and a one-day cache to `/assets/*`. The personalized greeting data in the URL fragment is not part of the normal HTTP request.
- HTML pages and greeting links should be tested again on the real public hostname. Social shares show a generic Wishverse preview (not a dynamically generated personalized thumbnail).

## Before indexing and AdSense

- Add a verified contact email or working contact form to About and Privacy pages; we intentionally did not invent an email address.
- Confirm the content is complete and suitable for search; proofread Hindi and Gujarati with native speakers.
- Verify canonical and sitemap URLs only after domain activation.
- Add Search Console and analytics only after reviewing their respective privacy/cookie notices.
- Do not add AdSense snippets or an ads.txt publisher ID without a real publisher ID and approval. Avoid placing ads inside private shared-card or recipient screens. Approval is not guaranteed.

Cloudflare docs:
- https://developers.cloudflare.com/pages/framework-guides/deploy-anything/
- https://developers.cloudflare.com/pages/get-started/direct-upload/
- https://developers.cloudflare.com/pages/configuration/custom-domains/
- https://developers.cloudflare.com/pages/configuration/headers/
