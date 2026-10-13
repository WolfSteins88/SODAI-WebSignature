# M4 Our Story composition rebuild — 6 October 2026

The generic Sodai Story renderer has been replaced with the complete reference composition sequence. The canonical route remains `/`. This revision stops before M5. Standard, authentication and site-scoped published reads are preserved.

## Reference method and evidence

Inspected all 58.26 seconds of the supplied reference recording, all 28.66 seconds of the rejected demo, and the live [Tandjung Sari Story](https://www.tandjungsarihotel.com/). The [numbered measured panel map](reference-2026-10-06/story-panel-map.md) was written before implementation. Sections are continuous compositions of different widths, not viewport slides. Desktop comparisons use 1223×699 CSS px; mobile uses 390×844. Mobile wheel smoothing differs between sites, so captures use settled corresponding section-relative offsets (recorded in `mobile-evidence-offsets.json`, within approximately 2 px).

| # | Composition | Reference recording | Rebuilt evidence |
|---|---|---|---|
| 1 | Full-image opener | 00–02 s | `after/01-opener.jpg` |
| 2 | Date, logo, copy and adjacent tall image | 02–08 s | `after/02-intro.jpg` |
| 3 | Alternating historical timeline | 08–14 s | `after/03a-timeline.jpg`, `03b-timeline.jpg` |
| 4 | Founding, large image, narrow tourism column | 14–26 s | `after/04-founding.jpg` |
| 5 | Low red editorial composition | 26–32 s | `after/05-red-intimacy.jpg` |
| 6 | Architectural pair and text columns | 32–40 s | `after/06-architecture.jpg` |
| 7 | High red cultural composition | 40–45 s | `after/07-red-culture.jpg` |
| 8 | Later-history mosaic and motif | 45–49 s | `after/08-later-history.jpg` |
| 9 | Book, editorial copy and closing statement | 49–52 s | `after/09-book-closing.jpg` |
| 10 | Static documentary image | 52–55 s | `after/10-documentary.jpg` |
| 11 | Next-page portrait scene | 55–58 s | `after/11-next-page.jpg` |

All paths in the table are under `docs/reference-2026-10-06`. [Desktop comparisons 1](reference-2026-10-06/comparison-01.jpg), [2](reference-2026-10-06/comparison-02.jpg), [3](reference-2026-10-06/comparison-03.jpg) pair live reference and rebuilt images. [Mobile comparisons 1](reference-2026-10-06/mobile-comparison-01.jpg), [2](reference-2026-10-06/mobile-comparison-02.jpg), [3](reference-2026-10-06/mobile-comparison-03.jpg) cover nine editorial compositions. The rejected before evidence is preserved as three full chronological contact sheets and eleven numbered images in `before/` at 00, 02, 04, 07, 09, 12, 15, 18, 21, 24 and 27 s. Those states are explicitly not presented as matching layouts: most requested compositions did not exist in the rejected implementation.

## Implemented

- Separate replaceable reference seed with actual reference photos, paragraph structure and text; explicit idempotent `db:seed:reference`. Public rendering still reads only the configured site's published snapshot. No frontend fixture fallback.
- Constrained opener, introduction, variable timeline, founding, high/low red editorial, architecture, later-history, book and static-image layout types. Stable IDs, ordered enabled collections and bounded validated fields prepare M5 editing without a free-form builder. New optional JSON fields require no additional SQL migration.
- Measured Adobe Caslon Pro/Helvetica typography, desktop section widths, image bounds/crops, rail, booking controls, timeline mats/markers, decorative reference emblems, hero shading and heading tracking. Mobile has independently measured stacking, spacing and typography, restored coral decorations and measured vertical photograph parallax.
- Actual rendered dimensions determine horizontal travel; timeline width changes with entry count. Long introduction/editorial copy has keyboard-accessible overflow. Hero image sizes prevent undersampling; lazy images retain error fallbacks.
- Retained scroll-only expansion, destination prefetch, decoded-image routing handoff and history/momentum guards. Reference handoffs now preserve the full-viewport shell instead of applying the old 50 px desktop/64 px mobile offsets. Mobile next scenes and destination heroes share full-viewport dimensions; booking controls also follow reference red photograph visibility.
- Existing Bencho Dock text-menu behavior retained, separated from reveal transforms and backed by MIT notices. The migration/seed CLI async entry point also repairs its prior CommonJS top-level-await incompatibility.
- Image-only demo: zero video elements. A disabled optional video block validates a supported HTTPS MP4/WebM source and poster when enabled, but no player or video request is instantiated in this phase. CMS toggles/playback remain later work.

## Validation

Production build and TypeScript pass. All 19 unit/integration tests pass, including real Auth.js login/logout, both roles, JWT revocation, persistent rate limits, scoped persistence, legacy snapshot migration and video/content validation. Standard and Signature production HTTP suites pass deep links, unknown slugs, published changes, draft/foreign-site isolation, disabled modules, culture detail routes, booking context, metadata, sitemap and robots rules. Final Signature build was checked again after the clean static asset/mobile corrections.

Real-browser checks confirmed the eleven desktop compositions against the live reference, ten enabled Story sections, responsive image loading, a settled missing-image fallback and zero videos; one-section travel of 1224 px; reordered collection rendering; one timeline entry reducing width to 1647.76 px; long intro text with 149 px viewport/965 px scroll height and keyboard focus. Mobile has no horizontal overflow at 390 px. Timeline height is 2482.26 px versus reference 2482.08; founding 1503.52 versus 1504.21; later-history 1356.53 versus 1356.52.

Story → Bungalows → Dining committed consecutively by scrolling without a card click. Reverse scrolling reduced transition progress from .482 to .259. Back restored the room page at 3356.67 px, reload retained that position, and Forward returned to Dining. Escape/reopen and interrupted menu opening cleared dialog transforms and the body scroll lock. Menu navigation reached Culture Bali. Genuine pointer movement produced scales 1.14 at the nearest link, 1.105 and 1.035 nearby; pointer leave reset them. Keyboard focus produced 1.06. A local 1.5 s RSC/image-delay proxy retained the loaded bungalow scene while navigation was pending; see `after/qa-slow-handoff.jpg` and `qa-expansion.jpg`.

The final mobile browser check also reached `/rooms` by scrolling alone. Both the expanded next stage and destination hero measured 390×844 at top zero; `after/mobile-11-next-page.jpg` and `qa-mobile-destination.jpg` preserve those states. Red photograph matrices matched the measured mobile scale 1.1558 and translation (33.94 versus reference 34.07 px at the compared position); the coral emblem measured 106.15 px high. Red booking controls were visible. The introduction ornament was measured and corrected separately to 208.385 px width, with its original diamond/core geometry.

## Remaining differences and limits

- The reference film changes frames and exposes playback controls. The requested image-only demo uses a clean cropped still; film motion, frame identity at every time, sound and player controls are intentionally absent. No video was downloaded.
- Desktop composition matches are close visual comparisons, not a claim of pixel-perfect identity. Small rule/ornament rendering, rasterization and fractional font metrics differ. The later motif remains visible while the captured live state is extremely faint. Native wheel response and easing are not an exact reproduction of the reference's smooth-scroll timing. Screenshots establish composition, not frame-by-frame motion equality.
- Dock magnification is the intentional requested reference difference. Booking destinations remain published fictional comparison URLs; WhatsApp is hidden because this seed has no valid WhatsApp action. Non-Story destination content remains villa demo content.
- System reduced-motion code paths and coarse-pointer guards remain implemented, but the browser tool cannot change OS motion preference or emulate physical touch. Those device checks are unverified, not inferred from a passing build.
- No authenticated Netlify project/database/Blobs runtime is available. Tests use local persistent PostgreSQL through PGlite/pg/Drizzle; hosted integration and deployment are unverified.
- Reference photo/copy/webfont redistribution rights remain unconfirmed. Assets are for the requested private comparison; licensed replacements or permission are required before commercial deployment/source-ZIP distribution.

M5 editor, video playback and M6 deployment/packaging are not implemented here.


