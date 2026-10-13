# M4 — Smooth hero morph repair · 8 October 2026

Implemented for owner review; this report does not establish visual acceptance. No M5 or deployment.

## Defect and reference inspection

Inspected the complete supplied 10.13-second, 2548×1396, 30fps recording sequentially, then every frame from 2.2–3.2s and 7.2–8.2s. The source shrank around 2.3–2.4s, held until approximately 2.87s, then changed aspect around 2.97s before expanding. Around 7.7–7.93s two differently sized frame edges overlapped. The old implementation created independent source/destination frames and handed off without the destination shade/title.

Inspected the live [useLayouts expandable gallery](https://uselayouts.com/docs/components/expandable-gallery), its See all/back behavior and official public registry source. Its Motion shared-layout geometry inspired continuity; its spring and gallery UI were not adopted. Code UI requires login, but registry source was accessible. No component source, license-dependent code, Motion dependency or competing animation engine was copied.

## Changes

- A single persistent clipping plane contains separate source/destination images. Uniform cover scaling preserves natural proportions and the destination focal point throughout; both images share exactly the same swap bounds.
- Central configuration in `hero-morph-geometry.ts`: desktop intermediate width 28% of content viewport excluding the rail; mobile 64%, capped at340px; 400ms shrink,150ms swap,640ms expansion with25ms overlap. Non-bouncing easing. These are configured durations, not measured guarantees on stalled devices.
- Readiness starts alongside menu exit: prefetch published route/media, decode the actual destination responsive image and measure its bounds once. Source background fades during shrink; destination shade/title appear near the expansion end.
- Destination photo ownership excludes competing scroll/color writes until handoff; release establishes full color without a second entrance. Snapshot retains horizontal track scroll.
- GSAP's global lag smoothing stretched a nominal1.165s morph over13.37s under this browser's stalled callbacks. A paused local timeline now advances from elapsed time on the existing GSAP ticker; no extra RAF loop or global lag changes. It cannot create frames when the browser does not deliver callbacks.
- Slow, failed or absent heroes use a fade fallback without parking a small loading photograph. Route/decode waits are bounded separately; a delayed menu exit no longer discards the destination through an outer fallback timeout.
- Latest intent/cancellation, Escape, handle interaction, history/resize/unmount cleanup, keyboard/touch scroll suppression, focus and existing reduced-motion path retained. No per-frame React updates or geometry reads in the morph paint function. Temporary ticker, observers and listeners are removed at cleanup.

## Verification and evidence

Production build87554 including TypeScript passed.37 tests passed, including cover geometry and desktop/mobile safe bounds. Final Standard and Signature HTTP suites passed: published/draft/site isolation, disabled routes, deep links, persistence, metadata and booking context. Authentication/role/session checks passed in the existing test suite. Tests do not prove animation fidelity.

Actual Windows Chromium155 in-app browser, production local PostgreSQL fixture:

-1279×700: Story→Rooms, Rooms→Story, Dining→Story; one frame/two image children captured during swap/expansion. Final photo owner removed, grayscale0, main focused and body unlocked. Reopening, Escape during selection and handle interruption exercised.
-390×844: Rooms→Story, Story→Rooms→Dining; BackRooms/ForwardDining; Gallery no-hero fallback with0 image frames.360×800: no horizontal overflow, video0, restored media and handle interruption/reopening/closing.
- Existing local slow proxy delayed real RSC/image responses1500ms: Rooms arrived and overlay cleared. Failed published Story hero arrived with accessible Photograph unavailable fallback, main focus and no layer/scroll lock. Default fixture restored and reload verified.
- Controlled OS reduced motion, physical touch, cross-browser, exact resize-time focus and modified new-tab behavior were not independently verified in this pass. Their existing implementation paths remain; no acceptance claim.

Evidence in `docs/reference-hero-morph/`:

- `defect-sequence.jpg`, `sequence-2.2.jpg`, `sequence-7.2.jpg`: sequential recording contact sheets; individual30fps frames retained.
- `comparison.jpg`: illustrative before/after composition comparison, with source timestamps. Recording and browser dimensions differ; it is not a matched-viewport pixel comparison. After intermediate captures precede only the final local-clock/fallback timing correction; geometry is unchanged.
- `reverse-frame.png`, `reverse-expanded.png`, `final-forward-swap.png`, `final-forward-expand.png`: one-frame geometry, blending and expansion.
- `final-rooms-arrival.png`, `final-story-arrival.png`, `final-mobile-story.png`, `final-mobile-rooms.png`: final arrivals; screenshots inspected.
- Raw observer/rAF JSON, summaries and derived trace-format JSON: `profile-initial*`, `profile-reverse*`, `profile-final-desktop*`, `profile-local-clock*`. Trace-format exports contain browser PerformanceObserver entries, not a full DevTools GPU/compositor capture.

## Performance limits

Final local-clock production sample:1279×700, Windows Chromium155,8.61s,15 rAF intervals. Active morph9 intervals: median6.4ms,p95/max1006.5ms,2 above16.7ms;0 long tasks,11 long-animation-frame entries overall; maximum script-attributed forced style/layout2.9ms. Intent→cleanup2.096s; destination decode2.5ms. An earlier active sample had17/34 intervals above16.7ms and13.37s intent→cleanup; the local clock prevents that accumulated lag-smoothing extension.

Callbacks alternate between roughly6ms and1s despite document.hidden=false and visible review. This is not a controlled60Hz device or evidence of compositor dropped-frame counts. Long-frame entries often show0 blocking time; no long task was attributed to image decode, but observer data cannot isolate GPU filter, image paint/decode or compositor cost. Smooth60fps, exact nominal choreography under these stalls, and final owner visual acceptance remain unverified. A foreground60Hz DevTools recording on the owner's browser is still needed; do not interpret0 long tasks as no jank.

## Review

Final server: http://127.0.0.1:3112/ · Rooms `/rooms` · Dining `/dining` · Gallery `/gallery`.

Startup from project directory: `npm run build`, then `npm run review:signature`. Optional local instrumentation: set `SIGNATURE_PERFORMANCE_REVIEW=1` before startup; Ctrl+Shift+P starts, Ctrl+Shift+S stops and writes `#signature-performance-report` JSON in the page. No telemetry transport.

Server52337 retains the restored reference fixture, powered by scoped local PostgreSQL/Drizzle published reads; live Netlify integration was not exercised. Slow proxy stopped. Standard, authentication, CMS schemas and video-disabled content preserved. No Git repository: changes remain in place.
