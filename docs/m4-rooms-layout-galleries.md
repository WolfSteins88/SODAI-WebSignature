# M4 Rooms symmetry and galleries — 9 October 2026

Implemented for owner review; visual acceptance remains with the owner. No M5 or deployment.

## Changes

- Equal 4:3 introduction frames, aligned outer margins/gutter, centered large lead; desktop two-column room rows with equal 16:10 photos, aligned titles/actions and consistent row starts. Removed obsolete stagger rules rather than hiding missing content.
- Detail leads centered in the area excluding the rail; equal justified prose columns with natural final lines and language-aware hyphenation. Mobile stacks in reading order.
- Every Signature detail now uses one reusable gallery. Legacy showcase wide/small/tall map to three stable IDs; explicit new `signature.photoGrid` supports ordered enabled entries, captions and validated images, maximum nine entries with unique IDs. Explicit empty collection stays empty. Existing lower gallery (up to twenty), content and related rooms are retained, without truncating legacy media.
- Native modal dialog and a persistent decoded image plane expand spatially from the selected thumbnail into a natural-aspect contained photo. Close/Escape return to current originating bounds, restore focus/scroll, cancel stale decode work and release locks on resize/route/unmount. Upper-right safe-area close, loading/error feedback, reduced-motion branch. No per-frame React updates or layout measurements; geometry measured at open/close only.
- Public media authorization excludes disabled new grid entries. Optional JSON content extension requires no new SQL table/migration; prior snapshots remain valid. No CMS interface, arbitrary page builder, services or video.

## Reference inspection and intentional differences

Inspected both actual useLayouts previews. Dynamic Grid uses six photos in a three-by-two grid and hovered-cell enlargement. Expandable Gallery initially shows three photos and reveals the nine-photo collection with Go back. Its Code panel, and Dynamic Grid Code, require login. No source copied or new motion dependency added. This original GSAP implementation follows the owner's explicitly requested viewport spatial overlay; it is not claimed to duplicate the Expandable preview's collection-reveal behavior or inaccessible source.

## Verification

- Production build/TypeScript passed; 39 tests passed including auth, session revocation, database persistence/site/draft isolation, validated room collection counts 0/1/3/9, reorder/disabled IDs and unchanged legacy lower media.
- Standard and Signature production HTTP regression suites passed (public deep links, publication, site/draft isolation, booking context, disabled modules, metadata/robots/sitemap, designed 404s).
- At 1279 by 700 CSS pixels: introduction frames both 383.84px high, approximately 511.8px wide. All three room row pairs begin at identical document positions: 1646.78, 2206.76, 2716.08px. Detail body columns both 499.42px; centered lead width1000px. Fixed rail excluded.
- Real browser: default three, explicit zero/single/nine same-room photos, stable ordered IDs, loading/full-image display, natural ratio, upper-right Close, Escape, close during opening, focus return, scroll restoration, resize dismissal, keyboard focus rebalance. Following showcase top stayed 1850.10px while focused columns changed; no following-section push. Missing-image modal reports unavailable and Escape releases lock/focus correctly. Final console had no warnings/errors.
- 390 and 360px responsive checks: one-column gallery/prose, no horizontal overflow; one-click opening and Close/Escape; resize while open cleans overlay. Nine same-room images and long prose/captions exercised; empty new grid preserves all six existing lower photographs. No video elements.
- Evidence: `reference-rooms-symmetry/intro-desktop.png`, `final-listing.png`, `final-grid.png`, `expanded-desktop.png`, `grid-mobile390.png`, `expanded-mobile390.png`, `grid-mobile360.png`. Screenshots are implementation evidence, not a claim of owner acceptance. Supplied screenshots show rejected composition before this correction.

## Production performance and limits

Raw observer/rAF trace: `reference-rooms-symmetry/profile.json`; statistics: `profile-summary.json`. Chromium155/Windows,1279x700,DPR1. The25.39s capture includes two gallery open/close cycles, screenshot automation and idle time:4184 intervals,median6.1ms,p956.2ms,max24.3ms,one interval above16.7ms,zero long tasks and zero long-animation-frame entries. This is not an isolated animation benchmark or physical60Hz dropped-frame measurement. No DevTools GPU/paint/forced-layout trace was available through the enabled browser interface. Grid-column interpolation can require layout; fixed rows contain its footprint. No universal60fps claim.

Remaining checks: physical touch momentum, OS reduced-motion/browser verification, deliberately throttled media/decode, cross-browser and controlled60Hz GPU profiling. Reduced-motion paths are implemented (zero-duration expansion/close and no grid interpolation) but OS preference was not changed. Owner visual judgment remains pending. Netlify live integration was not verified; review uses published scoped local PostgreSQL plus Drizzle.

## Local review

Running at http://127.0.0.1:3112/rooms, with details including /rooms/village-bungalow and /rooms/two-storey-bungalow (also beachfront-bungalow, south-garden-bungalow, garden-seaview-bungalow, family-bungalow). Run `npm run build`, then `npm run review:signature` from the project root if stopped. QA fixture commands: room-grid-empty, room-grid-single, room-grid-nine, room-grid-long, room-grid-missing; `default` restores the reference demo. Default restored after testing. Optional local profiling: set SIGNATURE_PERFORMANCE_REVIEW=1 before review; Ctrl+Shift+P starts, Ctrl+Shift+S stops.
