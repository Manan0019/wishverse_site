# Phase 8 — Secure photo/voice link architecture (proposal, not deployed)

The current static version **cannot share the actual photo/voice through one HTTPS link** because it has no server media storage. Its safe default remains a downloadable PNG or offline Keepsake HTML file.

## Proposed production architecture (not yet implemented)

Browser → Cloudflare Worker upload API → private Cloudflare R2 bucket, with metadata in Cloudflare D1.

- A guest requests a short-lived upload session only after completing a CAPTCHA / rate limit gate.
- Accept one sanitized photo and one short audio recording, with strict file-size and MIME verification by file content, not only extension. Strip photo EXIF metadata (including location), re-encode images server-side, and limit decoded pixel count to protect compute.
- Store objects using unguessable server-generated IDs; store hashes, owner deletion-token hashes, expiry, content type, and size in D1.
- Send recipients a short opaque URL, e.g. `/g/<opaque-id>`. Prefer signed, short-lived media URLs or proxied reads with `Cache-Control: private, no-store`; never expose an R2 public bucket.
- Default expiration: e.g., 30 days, configurable by the sender. Delete expired R2 objects and D1 rows with a scheduled cleanup Worker; let creators revoke by a private delete token.
- Restrict uploads and views with per-IP/session rate limits, traffic limits, abuse reports, MIME checks, and no public card directory. Put per-user budgets and global spending caps in place before enabling it.
- `robots`/`X-Robots-Tag: noindex` for personal routes, media response `Content-Disposition: attachment` where suitable, and `Referrer-Policy: no-referrer`. Shared links aren't encryption; visitors who have a link can access its media until deletion or expiry.
- Record minimal operational abuse/security logs, document retention, and consider consent for third-party faces/voices. Offer reporting and deletion workflow before accepting public uploads.
- Social previews for private cards should default to a generic artwork rather than putting names/photos into Open Graph images.

## Service boundaries

`frontend/src/services/greetingsApi.js` — client upload and retrieval contract
`worker/routes/createUpload.js` — rate-limited validation + presigned upload
`worker/routes/getGreeting.js` — safe retrieval and expiration gate
`worker/routes/deleteGreeting.js` — revoke with hashed capability token
`worker/cron/cleanup.js` — expiration enforcement
`worker/services/mediaValidation.js` — file inspection, EXIF stripping, encoding limits
`worker/services/storage.js` — R2 object and D1 metadata changes

No production Worker, R2 bucket, D1 table, credential, public API or upload system is included in Phase 8. Costs must be checked against current Cloudflare pricing and actual traffic before enabling media uploads.
