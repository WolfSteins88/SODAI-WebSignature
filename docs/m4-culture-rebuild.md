# M4 Signature Culture rebuild — 7 October 2026

Implemented the supplied Culture rebuild scope. User visual acceptance remains pending; M5 has not begun.

## Composition and content

The complete 122.37-second recording was played sequentially and inspected in chronological contact sheets. The numbered [panel map](reference-culture/panel-map.md) precedes rendering changes. Live source DOM/CSS measurements complement the recording. Source copy and 33 immutable photographs are in a separate comparison seed, not hardcoded fallback content in public components.

The listing uses its color hero, cream editorial introduction, asymmetric map/carving photographs, and ten staggered entries. Details use distinct portrait/cream and full-height-photo/red compositions, a coral seam ornament and taupe next scene. Stable enabled section IDs and array order determine measured horizontal distance. Mobile uses native vertical reading and content-driven heights. The demo contains no video elements or playback requests.

The observed detail sequence is Galungan → Kuningan & Mekotek → Melasti → Ogoh-ogoh → Nyepi → Piodalan → Bali Art Festival → Perang Pandan & Ayunan Jantra → Purnama & Tilem → Offerings. Offerings falls back to Gallery; the recording ends before its terminal destination, so that endpoint is not claimed as a verified reference match.

Optional validated `culture.entries[].signature` fields hold hero, nextSlug and ordered constrained sections. Compatible published JSON snapshots require no SQL-table migration. M5 will provide editing controls. Existing Standard content remains compatible; public routes still use the configured site's published accessor. Metadata/sitemap use enabled canonical detail routes.

## Visual evidence

Reference and implementation CSS viewport: approximately1985×1080. Browser screenshot export is limited to the visible1688px width; comparison images explicitly crop both sides to that common left area. This is not a complete1985px screenshot. No browser chrome is included.

- [01 listing hero, reference0s](reference-culture/comparison-01.png).
- [02 staggered listing, reference8s](reference-culture/comparison-02.png): equivalent collection, but vertical scroll positions differ.
- [03 Kuningan editorial, reference40s](reference-culture/comparison-03.png): heading local x267.19, near reference x264; composition heights, image identity, line breaks and body anchoring align closely.
- [390px mobile](reference-culture/after-mobile-390.png) and [360px mobile](reference-culture/after-mobile-360.png): readable adaptation, not exact mobile-reference fidelity.

Local portrait measurements match source: photograph785.27×969.09 at y55.45; heading454.19 wide at y97.17; supporting column310.19 wide with bottom993.41. Listing map307.59×338.99 and carving565.26×636.96 match measured source bounds. TS Caslon and TS Helvetica reuse the measured reference webfonts already in this comparison project.

Remaining visual differences: rail WhatsApp/separator treatment; exact source parallax/easing and route-entry color timing; minor rasterization and scroll-position offsets. Direct detail entry starts grayscale whereas the clicked Galungan recording shows color. These are not claimed as exact matches. Commercial redistribution rights for reference media/fonts remain unverified.

## Checks

- Final production build98939 passed, including TypeScript. All21 tests passed in the final run. Standard and Signature production HTTP suites passed, including all10 culture details, disabled/empty collection behavior, section reorder/disable/empty cases, missing-next fallback, draft isolation, configured-site scope and authentication regressions.
- Real production browser: listing→detail link; Galungan→Kuningan→Melasti consecutive scroll-only handoffs; one destination hero; reverse scrolling; Back/Forward and reload; completed menu opening/Escape/reopening cycles without stale body scroll lock. An open attempt during closing was ignored and the menu returned cleanly closed; completed reopening was verified.
- Mobile360/390px: document width equals viewport, no horizontal overflow, variable section heights and zero video elements. Physical touch momentum, safe areas and actual OS reduced-motion testing were unavailable. Reduced-motion branches are present but not a completed device-level verification.

## Production performance observations

Windows, Ryzen7 5800H/16GB/RTX3060 Laptop; display reports165Hz; browser1985×1080. Actual local production rAF and PerformanceObserver records are retained in [summary](reference-culture/performance-summary.json), [scroll trace](reference-culture/performance-scroll.trace.json) and [menu trace](reference-culture/performance-menu.trace.json). They are observer trace containers, not native DevTools GPU/compositor traces.

Scroll sample42.55s including inspection/tool pauses:6971 intervals, median/p956.1ms, maximum206ms, one interval above16.7ms. Native wheel input changed scroll position in only5 observed callbacks; their maximum was6.1ms. This does **not** establish sustained continuous-scroll60fps. Menu sample37.60s including pauses:6185 intervals, median6.1ms,p956.2ms,max30.5ms,four above16.7ms. Both samples had zero long-task entries and one long-animation-frame entry. The206ms entry has no script attribution or blocking duration; native trace capture is needed to distinguish decode/paint/compositor/environment causes. Physical dropped frames cannot be inferred from these callback counts.

Culture entrance shares the existing scroll driver, caches geometry, changes filter only while tone changes, and cleans observer/listener state. No React updates or layout measurement occur on scroll ticks. Existing nearby-image preparation and handoff guards remain intact. No unsubstantiated optimization was applied to the unexplained stall. Requested controlled60Hz sustained-scroll and GPU attribution remain gaps.

## Local review

Production review is running at http://127.0.0.1:3112/cultures. Details include `/culture/galungan`, `/culture/kuningan-and-mekotek`, `/culture/melasti`, `/culture/offerings`; all ten are linked from the listing.

Restart: `npm run build`, then `npm run review:signature`. This publishes an isolated local PostgreSQL fixture through the normal repository/accessor, not a hosted Netlify integration. Live Netlify Database/Blobs credentials remain unavailable. Booking destinations remain published comparison placeholders. The separate3118 recording viewer is analysis-only and is not part of the demo.
