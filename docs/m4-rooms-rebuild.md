# M4 Signature Rooms rebuild — manual review

7 October 2026. Implemented for review; visual acceptance belongs to the user. M5 remains untouched.

## Implemented

- Preserved the Our Story next-page aperture and published destination image. Rooms opens on the same aerial photograph in color, with the lower reference title and full viewport hero. Our Story compositions and Dock choreography are unchanged.
- Replaced the generic listing with the reference editorial introduction, small lower interior / large gateway composition, faint coral ornament and staggered two-column six-bungalow listing. Distinct images, descriptions and Discover More links are published data.
- Rebuilt detail heroes, capacity/area facts, large editorial heading and two supporting columns, asymmetric three-photo composition, Room Inclusion / Room Facilities rows, dividers and published booking CTA.
- Added the full-width native photo selector with reference arrow controls. Zero photos hide it; one photo hides arrows. No autoplay or video is introduced.
- Added the taupe Other Bungalows scene. Vertical scroll moves the photograph strip and selects its title; photograph links navigate directly. It excludes the current room; zero related rooms hide the scene, one retains a usable static link. Keyboard region arrows/Home/End select entries and keyboard link focus brings the relevant photograph into view. Reduced motion uses native horizontal overflow instead of scroll-linked movement.
- Separate replaceable reference seed contains six room records with stable slugs, ordered gallery IDs, inclusions/facilities and constrained showcase metadata. Optional validated snapshot fields remain backward compatible; no SQL migration or editing interface is required. Rendering uses the existing configured-site published accessor, never imports seed content as a fallback. Standard/authentication remain intact.

## Reference and measurements

The entire supplied 57.3-second desktop recording was played and inspected in order. Chronological two-second frames and four contact sheets are in `reference-rooms`. Matched CSS viewport is 1279×702, inferred from 2558×1404 recording pixels. Live reference DOM and enclosing crop boxes cross-check the geometry. Fonts reuse measured Adobe Caslon Pro / Helvetica; regular font italic synthesis remains a difference.

[Numbered panel map](reference-rooms/panel-map.md), [listing measurements](reference-rooms/listing-measurements.json), [detail measurements](reference-rooms/detail-measurements.json), [reference content/source notes](reference-rooms/content-notes.md).

Production browser checks confirmed matching hero title bounds (top541.11, height42.65), detail heading (540.17,753.22,639.26,454.75), editorial height948.84, photograph composition height1274.78 and its three crop boxes. Final listing reserves the small caption's wider column, positioning the large image at759.06 rather than703.61. Recordings remain comparison evidence, never public demo assets.

Remaining visual differences: existing navigation rail details, synthetic italic/font rasterization, original live parallax/smoothing and gallery transition easing. Photo identity/order and constrained crop boxes are reproduced, but production screenshots do not establish user acceptance. Mobile is an adaptive layout only: this recording supplies no authoritative mobile compositions. Reference asset/font redistribution rights remain unverified for a commercial handoff.

## Validation

Final production build81832 passed with TypeScript, including the inline facts-icon correction. The browser verified both icons compute to inline-block on the rebuilt room-detail route. All 19 original unit/integration tests passed, and eight content tests including new photo-ID/source validation passed. Standard and Signature production HTTP regressions passed, including published/draft/site isolation, booking context, unknown slugs, deep links, disabled modules and zero/single/multiple related/gallery cases. Tests use isolated local PostgreSQL via pg/Drizzle. Netlify credentials/runtime remain unavailable; no live-host verification is claimed.

## Performance conditions

Windows reports NVIDIA RTX3060 Laptop GPU, 2560×1600, **165 Hz**, confirmed during this revision; Ryzen7 5800H /16GB from prior hardware inspection. In-app Chrome154, 1279×702 production Next16.3.8/React19.3/GSAP3.15 build. Requested60Hz setup and native DevTools/GPU/decode-paint tracing remain unavailable. Real rAF/PerformanceObserver traces are retained; estimated missed callbacks are not physical dropped display frames. No performance inference is made from30fps recordings.

One shared scheduled scroll callback caches related-scene bounds and card spacing. Resize/font readiness refresh geometry; scroll ticks write transforms and update title state only at a discrete room boundary. Gallery selection uses native scroll-snap and updates state at explicit selection/scroll end. Proper effect cleanup retains existing navigation coordinator and avoids a second continuous animation loop. No universal60fps claim is made.

## Local review

- Rooms: http://127.0.0.1:3112/rooms
- Village detail: http://127.0.0.1:3112/rooms/village-bungalow
- Additional details: `/rooms/two-storey-bungalow`, `/rooms/beachfront-bungalow`, `/rooms/south-garden-bungalow`, `/rooms/garden-seaview-bungalow`, `/rooms/family-bungalow`.
- Startup after a build: `npm run review:signature`. This isolated production review publishes the reference dataset into local PostgreSQL. It needs no Netlify credentials. Existing hosted publications are never overwritten.
- Optional observer profiling: set server-only `SIGNATURE_PERFORMANCE_REVIEW=1` before startup; Ctrl+Shift+P starts and Ctrl+Shift+S stops. This flag only works in local context.

The demo stays image-only. No M5 editor, hosted deployment or final ZIP packaging was implemented.

## Final browser evidence and measured performance

Numbered side-by-side comparisons use the supplied reference on the left and production UI on the right, at equivalent content positions and 1279×702 CSS dimensions:

1. [Editorial introduction, reference12s](reference-rooms/comparison-01.jpg).
2. [Staggered listing, reference14s](reference-rooms/comparison-02.jpg).
3. [Village detail editorial composition, reference34s](reference-rooms/comparison-03.jpg).
4. [Inclusions/facilities, reference42s](reference-rooms/comparison-04.jpg).

The capacity/area screenshot initially exposed stacked SVG icons; the final CSS explicitly restores inline icons. Reference rail styling still differs. Screenshots establish inspectable geometry, not acceptance.

Real production browser interactions verified listing→detail, native photo next/previous, related selection by scroll and keyboard, related room navigation and Back, repeated completed menu opening/closing and Escape without residual lock, and Story→Rooms scroll-only navigation with the same published hero image. 390px and360px adaptations had no horizontal document overflow and no video elements. Physical touch momentum, safe-area hardware and actual system reduced motion were unavailable. Zero/single cases were covered by HTTP rendering checks; mobile is an adaptation, not an exact match to an unseen mobile reference.

| Actual observer sample | Duration | rAF intervals / moving intervals | Median / p95 | Maximum | Intervals above16.7ms | Estimated missed rAF opportunities | Long tasks / LoAF |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Combined scroll, photo selection, menu and route navigation |124.36s, including tool/idle intervals|20459 /97|6.1 /6.2ms|36.3ms|4|62|0 /0|
| Sustained native ArrowDown scrolling through listing |8.90s|1463 /286|6.1 /6.2ms|11.9ms|0|5|0 /0|

Conditions: production build20712, Windows, in-app Chrome154,1279×702 CSS viewport,DPR approximately1,165Hz reported display. The sustained sample used72 native ArrowDown presses, moving from0 to2738px. Instrumentation adds overhead; samples are not a controlled before/after benchmark. The combined sample includes pauses and must not be described as124s of continuous animation.

[Combined measurements](reference-rooms/performance-final-summary.json), [combined browser trace](reference-rooms/performance-final.trace.json), [sustained measurements](reference-rooms/performance-sustained-summary.json), [sustained browser trace](reference-rooms/performance-sustained.trace.json). These traces contain real rAF/PerformanceObserver events, not native DevTools/GPU frame data. Missed callback estimates are not measured physical dropped frames. The36.3ms gap remains a measured limitation; available observers cannot assign it to GPU painting/image decoding. Requested60Hz profiling remains unverified. No universal60fps result is claimed.

