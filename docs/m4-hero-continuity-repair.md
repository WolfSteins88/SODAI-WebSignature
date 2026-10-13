# M4 — Hero continuity repair

Implemented for owner review, 8 October 2026. This supersedes the previous hero timing report. No M5 or deployment.

## Root causes confirmed

Inspected the entire 7.85-second iPhone camera recording sequentially, then every frame from 5.6–7.1 seconds at 60fps. It records a desktop display, not a mobile website. Around 6.13 seconds the small grayscale Story image gains a fullscreen source behind it; Story is restored fullscreen around 6.18–6.25 seconds, followed by a generic fullscreen destination fade.

The code explicitly restored the cloned source page to opacity1 when destination readiness missed the shrink deadline. This was a fallback ownership error, not just a short duration. The normal path also faded its masking background before expansion completed. A local wall-clock tick could consume later phases when appended to an already completed timeline. Finally, temporary Story shade opacity reached1 while the live shade uses0.7, producing a separate brightness jump at handoff. The full screenshot sequence exposed that mismatch and it was corrected before the final recordings.

## Implemented

- Once shrinking finishes, the fullscreen source snapshot is removed permanently. A decoded destination blends into the same small clipping plane; a delayed route retains only that small source frame while bounded readiness completes. No source-restoration fallback remains.
- The established background remains opaque until the final image, crop, bounds, color and decoration align. There is no early reveal of the fullscreen live destination.
- Reuse one GSAP timeline and persistent layer. Reset the ready stage's elapsed-time origin so a stalled shrink tick cannot consume a blend/expansion that has not rendered. Source and incoming image children retain uniform cover scaling; neither distorts.
- Central settings:600ms shrink,200ms blend,900ms expansion,25ms overlap, gentle non-bouncing easing. Intentional total1.675 seconds. Desktop small frame stays28% of available content width, mobile64% capped at340px. Title/shade reveal uses the final200ms and each live element's actual target opacity.
- Decode the real responsive destination image and its transition child before swapping; measure geometry once. Scroll/color ownership releases in full color without a second entrance. Paint ticks perform cached arithmetic/style writes, with no React rendering or layout measurement.
- Explicit fallback reasons are recorded in opt-in local profiling. Hero-less, unavailable-media and reduced-motion paths remain minimal. Exceptional route-readiness timeout keeps its mask and directly replaces the pending document rather than uncovering the source. That timeout branch was inspected but not independently forced in this pass.
- Escape now cancels a pending selection even before its transition-layer microtask runs. Resize cancels both picture and pending menu intent, then restores focus through the existing menu reverse lifecycle. Existing handle, Dock, anchor semantics and history remain.

Application files: `menu-hero-transition.ts`, `hero-morph-geometry.ts`, `navigation.tsx`, opt-in `performance-review.tsx`; geometry test updated for the superseding timing. Existing layouts/content, authentication, Standard, booking removal, social settings, disabled video and Story text remain unchanged.

## Production browser evidence

Final geometry/opacity recordings are in `docs/reference-hero-continuity/final/`:

- `forward-sequence.gif`:33 sampled screenshots, Story→Rooms.
- `reverse-sequence.gif`:34 sampled screenshots, Rooms→Story.
- All original PNG screenshots, shot metadata and six numbered contact sheets retained; every screenshot was inspected in order. GIFs use recorded capture timing and an added final hold; they are sampled browser recordings, not a continuous60fps capture or performance proof.
- Raw `forward-profile.json`, `reverse-profile.json`, `slow-profile.json`, `failure-profile.json`; summaries and derived trace-format JSON retained. These are browser PerformanceObserver/rAF records, not full DevTools GPU traces.
- `../verify-capture.mjs` checks actual captured paint states: one commit, source width only decreases during shrink, snapshot never restored after shrink, background retained, frame never empty, same swap geometry/two children, destination width only increases, expected media-failure reason. All four recordings pass; results in `invariants.json`.
- Initial recordings/contact sheets outside `final/` document diagnosis of the shade mismatch. They are not the final result.
- `defect-sequential.jpg` and all five60fps detail sheets preserve source timestamps. Camera perspective/HDR means those frames are diagnostic evidence, not a matched CSS-viewport pixel comparison.

Both normal production directions execute shrink→blend→expand→aligned, with no fade fallback or exceptional readiness hold. Final source owner removed, grayscale0, main focus, body unlocked and no abandoned layer verified. Third hero Dining and Back/Forward exercised.390×844 mobile Dining→Rooms arrival and360×800 no horizontal overflow/Gallery no-hero fallback checked. Failed Story image produces the accessible Photograph unavailable state with main focus and cleanup. Default fixture restored.

The local slow harness delays real RSC/image responses1500ms. Its captured sequence shows shrink→await-ready→blend→expand; source stays small during the exceptional wait and never returns fullscreen. The failed-image sequence shows shrink→labelled fade with no source restoration.

## Measurements and limits

Windows Chromium155 in-app browser, production build,1279×700 CSS viewport, warmed local reference assets, active screenshot sampling and opt-in observation. Interval statistics cover intent through cleanup, excluding unrelated idle time.

| Recording | Total | Active rAF intervals | Median / p95 / max | Above16.7ms | Long tasks / LoAF | Route commits |
|---|---:|---:|---|---:|---:|---:|
| Story→Rooms |1696.4ms|271|6.1 /6.2 /18.3ms|1|0 /0|1|
| Rooms→Story |1688.0ms|276|6.1 /6.2 /12.2ms|0|0 /0|1|
|1500ms delayed responses |2866.1ms|463|6.1 /6.2 /24.4ms|2|0 /0|1|

Normal decode-through-measure:12.2ms forward,14.2ms reverse; readiness completed before shrink ended. Slow run readiness wait1177ms; decode-through-measure6ms after responsive media had been warmed. No forced-layout duration attributed by long-animation-frame scripts; absence of such entries does not prove zero layout or GPU cost.

This callback cadence is approximately165Hz, not a controlled physical60Hz setup. Counts above16.7ms are callback intervals, not measured compositor dropped frames. Screenshot capture adds overhead. GPU grayscale/filter/paint cost is not isolated, and prior runs of this browser showed scheduling stalls. Controlled60Hz smoothness, physical touch, OS reduced-motion and Safari/Firefox remain unverified. Existing reduced-motion implementation is preserved and bypasses the morph; owner visual acceptance remains pending.

## Checks and review

37 tests pass; production build and TypeScript pass; both public HTTP suites pass, preserving deep links, draft/site isolation, disabled modules, persistence, metadata and booking context. Build/tests do not establish visual fidelity. Final navigation-guard build and last resize/focus verification are recorded in the checkpoint.

Review: http://127.0.0.1:3112/ · Rooms `/rooms` · Dining `/dining` · Gallery `/gallery`. This is the owner's localhost process, not a remote preview or Netlify deployment. It reads scoped published content from the existing local PostgreSQL/Drizzle reference fixture. Live Netlify was not exercised.

Startup from the project directory:

```powershell
npm run build
npm run review:signature
```

Optional instrumentation: set `$env:SIGNATURE_PERFORMANCE_REVIEW='1'` before startup. Ctrl+Shift+P starts; Ctrl+Shift+S stops and writes `#signature-performance-report` JSON in the DOM. No telemetry transport or public profiling control.

Final build16800 includes the additional resize guard: a resize before commit retains the source route, removes the layer/lock and restores the navigation handle focus. Final37 tests pass. Recorded morph geometry/opacity is unchanged by these cancellation guards. Review server84264 remains running with the restored fixture; the slow proxy is stopped.

Current checkpoint: `docs/implementation-progress.md`. Stop before M5; next work is owner visual feedback or controlled device profiling, not a page redesign.
