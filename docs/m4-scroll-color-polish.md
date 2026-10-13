# M4 scroll, main-photo color and title-line polish

Implemented 8 October 2026, following the owner's explicit approval of `PROMPT_M4_Scroll_Color_Polish.md`. No M5, service changes, deployment, public video, or composition redesign.

## Changes

- A single GSAP ScrollTrigger now updates the existing cached document-scroll scenes. The previous independent requestAnimationFrame scheduler is removed. Native scroll distance remains authoritative; no new smoothing library, snapping, global wheel handler or automatic completion tween was added.
- Next-page aperture, image scale, existing title movement, label opacity and grayscale share one paused, linear GSAP timeline. Navigation still commits once after the actual transition distance; existing history and momentum protection remain.
- Story retains desktop horizontal progression and native mobile vertical composition. Native horizontal track input maps to the same document distance, guarded against feedback from programmatic scrollLeft updates. Geometry refreshes through existing resize/content/font observation.
- Explicit `data-signature-main-photo` markers identify the selected main photos in Story, Rooms/detail, Culture/detail, Dining/offers, Foundation/programs, Packages/detail and Getting Here. Stable IDs, published reads, all layout bounds and supporting media remain unchanged. Terms has no main photograph. Gallery consists of thumbnails and a modal viewer; these intentionally receive no entrance filters. Logos, maps, ornaments, supporting photographs and related-room thumbnails are excluded.
- Main photos use one cached linear progress mapping and a paused GSAP numeric timeline driving a single-image grayscale filter. Entrance starts at the entering viewport edge and reaches color after 75% of viewport travel. Native horizontal strips also account for their own horizontal entrance. Already established direct/restored heroes are full color at document top, matching the fully expanded handoff. Reverse input reverses color; established photos have no invented exit effect. Reduced motion shows full color and retains the existing unpinned Story fallback.
- Story heading rules and the lines flanking its date ornament are hidden without collapsing their allocated boxes. Dining Offers' heading border is transparent. Functional timeline rules, markers, facts/facilities dividers, table borders, link affordances and Dock indicators remain.
- Browser verification exposed deferred initial CSS-variable interpolation; this was corrected using a non-lazy GSAP numeric proxy and deterministic style writes. Scrubbed handoff timelines also disable lazy rendering. `data-photo-progress` exposes the authoritative value for review. No per-frame React state or geometry reads were added to these effects.

## Checks completed

- `npm test`: 29 passed, including real local Auth.js login/logout/both-role/session-revocation checks and site/environment/draft isolation.
- `npm run typecheck`: passed. Final production build 21010: passed, including TypeScript.
- `npm run test:standard` and `npm run test:signature`: passed against published local PostgreSQL + Drizzle fixtures. Routes, unknown slugs, disabled modules, booking context, metadata/sitemap/robots and isolation remain covered. These are local fixtures, not live Netlify verification.
- Production browser: Windows Chrome155 in Codex IAB, desktop1279x700/DPR~1, mobile390x844 and360x800.
- Rooms at scrollY536.6667: introductory main-photo progress0.2692459542/filtergrayscale0.730754. Forward to1070 establishes p1/filter0. Reverse to536.6667 restores exactly the same progress/filter. Screenshots show established and reversed states.
- Story: scrollLeft follows documentY (533.33,1600); nearby photographs receive partial color progress; decorative title rules are hidden. End key is an accessible alternative to reach the next scene. PageDown expands it from p0 to0.565 (clip88.7364px229.049px, gray0.247237); PageUp returns p0. Further scrolling commits to Rooms without clicking. Destination hero is full color, overlay cleared and body unlocked. Back and Forward returned to the correct routes.
- Mobile Story uses flow heightauto and track scrollLeft0, with no horizontal overflow at360/390. Resize recalculates photo state. These are viewport/key-scroll checks, not physical touch-device tests.
- Menu opening and keyboard focus into Bungalows checked over scrolled content; Escape eventually returned to closed/unlocked state. Reopening from Gallery after viewer cleanup and explicit Close during opening exercised. The latter action returned without an error but a later snapshot still showed the menu open; route unmount cleaned it up. Moving-target click delivery and throttled timed animation could not be separated from application behavior. Native rapid-close/Escape must be rechecked manually; no exhaustive rapid-interruption success is claimed.
- Gallery viewer opens, ArrowRight changes photograph3→4, Escape closes and restores the thumbnail focus/scroll lock. A direct Next-button browser action failed in the UI adapter and was verified unchanged before testing the keyboard alternative. Gallery contains zero main-photo markers and stays full color.

## Evidence and measured limitations

See `docs/scroll-polish/` for screenshots, three raw observer recordings, Chrome-trace-format exports and `performance-summary.json`.

| Production recording | Duration | Frames | Median / p95 | Maximum | >16.7ms | LoAF / JS long tasks |
| --- | ---: | ---: | --- | ---: | ---: | --- |
| Rooms scroll/menu |68.89s|1653|6.1 /6.2ms|1011.9ms|65|62 /0|
| Story/boundaries/handoff |53.07s|125|12.2 /1006ms|1012ms|61|56 /0|
| Requested foreground scroll/menu |34.24s|78|12.2 /1006ms|1006.1ms|36|21 /0|

The roughly one-second intervals persist even after requesting browser visibility. Browser rendering/throttling is a possible explanation, not an established diagnosis. Some attributed GSAP callbacks took5–15.8ms, including2.7–12.1ms forced style/layout; the foreground menu click took7.4ms with4.2ms forced layout. Most long frames have no attributed script. No native GPU/paint/image-decode trace or controlled60Hz device was available, so these observations neither prove sustained60fps nor isolate the filter as the cause. Do not discard the outliers or report only the6.1ms median. A foreground physical-device performance run is still needed; no image-layer duplication was introduced without attributable filter evidence.

Actual touch momentum, OS reduced-motion, exhaustive interrupted Back/Forward, Firefox/Safari and every secondary-page entrance remain manual verification gaps. All published routes pass HTTP regressions. Live Netlify Database/Blobs credentials were not verified. Booking example destinations remain fixture settings. Owner visual acceptance remains pending.

## Review

Running local published fixture: http://127.0.0.1:3112/ (server7235), with `/rooms`, `/rooms/village-bungalow`, `/cultures`, `/dining`, `/foundation`, `/packages`, `/location`, `/terms`, `/gallery`.

Startup from the project: `npm run build` then `npm run review:signature`. Stop the existing review server before starting another on3112. The review uses local PostgreSQL fixture content, not Netlify. No account credentials are printed or changed.
