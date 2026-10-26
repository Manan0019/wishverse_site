# Wishverse Phase 10 — Motion Studio

## What changed

**Primary fix:** The card no longer remains fixed at one vertical center point in a very long form. The desktop preview sticks to the visible editing region while reserving space for its controls; phones show a live floating mini preview with a one-tap expanded view.

**New creative controls:** Three animation moods (Serene, Cinematic, Celebrate), four personal gift seals, tap-to-sparkle effects, live focus mode, pointer-responsive card depth, ambient themed glyphs, smoother design changes, and occasion/recipient animations. New settings persist through share links, saved drafts, PNG export (seal), and the offline keepsake (seal).

**Performance and accessibility:** Reduced-motion preferences respected; no remote animation library; transient particle effects are bounded and removed; modal keyboard navigation, Close/Escape and short-screen scrolling implemented.

## Included files

- `src/lib/motion.js` — motion and seal validation/data
- `src/main.js` — editor interactions, focus preview, following preview, live dock, animation integration
- `src/lib/share.js` — serialized new settings with legacy defaults
- `src/lib/download.js` and `src/lib/memory.js` — seal in exports
- `src/styles.css` and `index.html` — premium Motion Studio interface and layout fixes
- `sw.js` — updated public cache version with motion helper in cache
- `scripts/phase10-*` — unit and isolated browser checks

## Launch status

Locally tested and packaged, NOT DEPLOYED to `greetings.mananbhayani.online`. User account DNS changes, real-device checks and AdSense review remain outside this source-only phase.
