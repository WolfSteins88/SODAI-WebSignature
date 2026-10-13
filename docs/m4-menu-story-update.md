# M4 — Menu and Our Story update — 8 October 2026

Implemented the owner-authorized PROMPT_M4_Menu_Our_Story_Update.md. This supersedes the prior menu-logo fade requirement only for navigation from an active menu. The closed rail logo retains its restrained home fade. Owner visual acceptance is pending. No M5, deployment or live Netlify verification.

## Changes

- Signature primary menu says Rooms; /rooms and existing content IDs remain unchanged. Dock proximity/focus behavior and reversible menu timeline remain intact.
- Optional social links now have stable id, platform, HTTPS account URL, order and enabled fields. Validation checks the platform hostname and rejects credentials, deceptive hosts and duplicate IDs. Only configured enabled links render, sorted by order; an empty row renders nothing. Local real Simple Icons SVG assets, accessible platform labels, focus outlines and CC0 notices are included. No accounts were invented for the demo; its social row is empty. M5 owns editing controls.
- Removed room/table booking controls and equivalent Reserve/Book Now actions from both public templates, including shared legacy rendering, fixed/mobile controls, room detail and dining offers. Empty action wrappers are omitted. Existing booking data and contextual WhatsApp/contact and package-enquiry behavior remain available.
- Removed the final elderly-man still from the reference seed. The same stable panel ID is an optional typed video block, disabled by default; M4 omits every video block from DOM and measured Story geometry. There is no player, poster placeholder, video request or dead viewport. Underlying reference media remains on disk.
- Narrative Story paragraphs, including timeline entries, are justified with text-align-last:start, hyphens:auto and inherited English language metadata. Dates, headings and captions retain their alignment.
- Dedicated menu routing uses explicit source/destination hero selectors, measured bounds, actual decoded assets and uniform scaling. The source shrinks toward a centered small frame while graying; the outgoing page snapshot fades to avoid a duplicated full hero underneath. The destination blends in, expands to its measured bounds, regains color and reveals its real title/content through the final layer fade. An offscreen source uses its designated asset without moving the live page. Gallery/Terms/restaurant-menu lack designated heroes and use the fade fallback.
- Destination HTML/media readiness and decode waits are bounded; image failures fall back. Reduced motion skips hero choreography. The existing fixed handle stays above the route layer at its normal size. Handle/Escape/resize/history cancel the coordinator, release saved styles and inertness, remove observers/timers/layers and restore appropriate focus. A guarded microtask separates the persistent route timeline from the outgoing menu GSAP callback context, preventing menu unmount from reverting it. New intent supersedes uncommitted navigation; already committed navigation settles without a second push.
- Ordinary scroll-linked Story and next-page handoffs remain on the existing scheduler; no per-frame React state or geometry reads were added. Measurements occur at transition boundaries. Authentication and site-scoped published access remain unchanged.

## Stored-content compatibility

Content remains in the existing JSON database contract; no SQL table change is necessary. signature-content-upgrade.ts adapts each individual parsed snapshot without writing it or combining draft and published data. The known legacy documentary-still/layout=still becomes the disabled future-video block. Legacy labeled social entries map to typed platform entries and still pass the new URL/ID validation. Invalid content remains rejected. New reference seeds already use the new shape. Media assets are not deleted. M5 will edit these constrained fields, not arbitrary HTML/JavaScript.

## Checks and browser evidence

- 35 unit/integration tests pass, covering Auth.js roles/login/logout, revocation/rate limiting, database persistence, publication/site/environment isolation, content validation, optional video defaults, compatibility conversion and menu-controller cancellation.
- Final production build7323 and explicit TypeScript check pass. Standard and Signature HTTP suites pass against the final build, including all public routes, publication changes, draft/site isolation, disabled routes, metadata and social enabled/disabled rendering. Public booking-label removal is asserted on every route.
- Windows in-app Chromium155, desktop1279×700: captured actual grayscale/shrink transforms, small frame, two actual hero frames at blend/expand, then layer removal and main focus. Story→Rooms, Rooms→Dining, Dining→Cultures and hero/no-hero navigation exercised across the production revisions; final hero verification includes Story→Rooms and Dining→Cultures. Menu reopening in prepare cancels before commit and preserves Cultures; Escape then closes with no route layer and restored root/body overflow. Fixed handle remains44×44. The outgoing duplicate-hero screenshot was corrected before the final evidence.
- Mobile390×844 and360×800: Culture→Story menu navigation, Back→Culture/Forward→Story, disabled panel0/video0, justify/start/en computed styles, and document width matching viewport were verified. Same handle remains usable. No claim of native touch momentum or Safari/Firefox verification.
- A published local missing-media case produced the designed Photograph unavailable Story fallback and arrived at / with0 transition frames/no stale layer/unlocked body. The review fixture was restored to default and reloaded.
- Actual enabled social markup/disablement was checked through HTTP. No real account is configured, so live social destinations and visible social-row geometry were not browser-accepted. OS reduced-motion behavior is implemented but not exercised with an actual OS preference in this environment. Modified-click semantics remain delegated to Next Link onNavigate; new-tab creation was not retested here.

Evidence in docs/reference-menu-story-update/: desktop-menu.png is a settled open-menu capture (phase=open verified), with Rooms and the correctly empty social configuration. hero-transition.png shows the grayscale source on a clean canvas; desktop-menu-opening.png is explicitly an opening frame, not a settled-menu fidelity comparison. Other captures include mobile-menu.png, mobile-story.png and culture-arrival.png; some are intermediate choreography frames. Screenshots establish captured states, not complete animation fidelity or owner acceptance.

## Production timing — limitation, not a 60 fps pass

Two PerformanceObserver/rAF recordings from the actual production app are exported as raw JSON, summaries and Chrome trace-event JSON. Conditions: Windows Chromium155,1279×700, existing local PostgreSQL fixture, warm/shared image cache, physical refresh rate unverified. The second pass explicitly enabled browser visibility; near-one-second callback gaps persisted.

| Pass | Duration | Intervals | Median | p95 | Max | >16.7ms | >500ms | Long tasks | LoAF |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Background |41.48s|159|8ms|1006ms|1007.8ms|44|40|0|44|
| Visibility enabled |56.90s|110|686.8ms|1007ms|1008ms|59|55|0|47|

These captures show callback scheduling gaps consistent with browser-surface throttling; the exact cause is not proven. They cannot establish foreground60Hz performance, compositor dropped frames, GPU filter/paint cost, or universal60fps. No success claim is made from these numbers. A controlled foreground60Hz/native-browser trace is still required, especially for full-resolution filtering, slow media, repeated transitions and native touch. Timelines contain only transform/opacity/filter writes during frames; layout reads and image decode occur at boundaries. No optimization based on the throttled timing was used to distort reference geometry or reduce image quality.

## Local review

Review: http://127.0.0.1:3112/; /rooms, /dining, /cultures, /gallery, /packages and /terms. This is the owner's localhost with a published local PostgreSQL fixture, not a remote preview or verified Netlify integration.

Startup from the project directory: npm run build, then npm run review:signature. Optional observer harness: set SIGNATURE_PERFORMANCE_REVIEW=1 before starting review. Capture with Ctrl+Shift+P; stop with Ctrl+Shift+S.

Remaining: owner visual acceptance; controlled60Hz/GPU profiling; actual OS reduced-motion/touch/cross-browser checks; configured social accounts; existing unrelated Packages Forward-after-new-scroll issue and live Netlify checks remain outside this change. Stop before M5.
