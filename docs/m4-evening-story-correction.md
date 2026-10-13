# M4 Story correction — desktop, mobile and performance

Updated 7 October 2026. M5 has not started. The demo remains image-only.

## Corrections

- The timeline has all three ordered entries, alternating photographs/copy, its connecting rule and markers. Collection-derived explicit widths replace ambiguous intrinsic sizing: the list is `104 + 407 × entry count` reference units; the complete composition is `1240 + 407 × entry count`. Its existing three-entry geometry remains 2461 units. Track travel still comes from actual rendered dimensions.
- The full-height color building photograph follows the timeline. The following order remains building → narrow founding column → beach photograph → airport-history column. No section was shortened or removed to conceal a gap.
- The third archival interior uses a new immutable image filename. The old optimized response visibly differed from the source; the refreshed image now includes the staff beneath the lamps. Existing reference files remain available for old published snapshots.
- Mobile introduction spacing follows the new recording, with a smaller centered logo, date, ornament and copy. It uses natural content height. The vertical timeline retains all entries, centered rule segments/markers and the building photograph. Existing individual editorial/red/architecture/later-history/book compositions remain intact.
- Mobile booking visibility excludes the area behind the fixed header and disappears through editorial/red sections. The booking divider matches the short centered rule in the recording.
- Story and next-page animation share one scheduled frame callback. Geometry is cached; resize, font readiness and content/fallback replacement refresh it. Scroll ticks do not measure DOM geometry, write document height or update React state. Red-photo movement still uses transforms; desktop progression retains native horizontal scroll offsets.
- Nearby panel images are prepared as they approach view. The handoff reuses cached nodes/dimensions and skips unchanged progress writes. Automatic navigation now snapshots only the destination scene and fixed controls, rather than cloning/measuring the whole Story before discarding it.
- Menu route/motion changes clear interrupted animations and locks. Opening always resets/replays the choreography. Rapid Enter/Escape interruption and completed pointer closing were verified. Bencho Dock scales remain 1.14/1.105/1.035 for pointer proximity and 1.06 for keyboard focus; its MIT notice remains intact.
- Long desktop timeline text has keyboard-accessible scrolling inside its constrained editorial columns. Mobile text remains unbounded, growing the reading sequence. IDs, order and enabled flags remain structured published data.

The supplied rejected desktop clip omits the third entry/building. The initial current Chromium fixture already contained three entries; the exact cause in the supplied older clip was not reproduced. Explicit geometry and the corrected image are verified in the current fixture, rather than claiming an unverified root cause.

## Visual evidence

The three supplied recordings were played continuously and inspected chronologically. Their 30 fps encoding was used for composition, never for performance claims. Desktop reference frames are normalized from 2558×1400 to **1279×700 CSS pixels**, consistent with M0 measurements; mobile frames from 772×1368 to **386×684**. No browser chrome is included in the comparisons. Recording pixel density is inferred; browser rasterization can differ.

| Evidence | Reference timestamp | Comparison |
|---|---|---|
| 01 — complete three-entry timeline | `204140`, 0.0 s | [Side by side](reference-2026-10-06-evening/comparison-01-timeline.jpg) |
| 02 — building and founding column | `204140`, 3.6 s | [Side by side](reference-2026-10-06-evening/comparison-02-building.jpg) |
| 03 — beach and airport column | `204140`, 10.0 s | [Side by side](reference-2026-10-06-evening/comparison-03-beach-airport.jpg) |
| Mobile centered introduction | `UI Mobile panel`, 4.1 s | [Side by side](reference-2026-10-06-evening/comparison-mobile-intro.jpg) |
| Mobile full vertical timeline/building | Sequence approximately 5.4–9.8 s | [Complete corrected timeline](reference-2026-10-06-evening/mobile-after-03-full-timeline.jpg) |

[Rejected recording / corrected sequence](reference-2026-10-06-evening/comparison-00-before-after.jpg) retains the omission evidence, with browser chrome removed. [Mobile hero comparison](reference-2026-10-06-evening/comparison-mobile-hero.jpg) and [mobile reading-order overview](reference-2026-10-06-evening/mobile-after-overview.jpg) provide additional context.

Additional numbered mobile captures cover hero, founding, red editorial, architecture, culture, later history, book, static poster and next scene (`mobile-after-01` through `11`). The chronological reference/current/mobile contact sheets retain the full inspected sequences. The existing [M0 panel map](reference-2026-10-06/story-panel-map.md) remains the detailed composition specification.

Verified matches: photo identity/order, complete timeline/building, fixed reference column/photo dimensions, introductory date/copy arrangement, vertical mobile timeline, and native scroll-only routing. Small rail ornaments, logo positioning, font rasterization and a few spacing differences remain. Native wheel easing still differs from the live site's smoothing. The documentary is intentionally a static poster.

## Actual production browser profiling

**The requested 60 Hz acceptance remains unverified.** Windows reports 165 Hz; a user request to switch to 60 Hz was unanswered. Native OS control and DevTools/CDP tracing are unavailable through the browser tools. No 60 Hz result or universal 60 fps claim is made.

Test conditions: Windows; Ryzen 7 5800H; 16 GB RAM; reported NVIDIA RTX 3060 Laptop GPU; display 2560×1600 at 165 Hz; real in-app Chrome 154; measured viewport 1279×700; reported DPR approximately 1.0. Next 16.3.8/React 19.3.0/GSAP 3.15.0 optimized Webpack production build, served by the isolated published PostgreSQL fixture. HTTP regression servers were stopped before the final sample. Actual GPU backend and physical presentation drops were not measured.

An opt-in local-only recorder captures real `requestAnimationFrame` timestamps, scroll positions, resource timings, long tasks and long animation frames. Both baseline and later samples include this instrumentation. Raw JSON and trace-event containers are stored under `docs/reference-2026-10-06-evening/`; these are **browser observer traces, not native DevTools compositor/GPU traces**.

| Sample | Frame intervals / moving frames | Median / p95 | Maximum | >16.7 ms | Estimated missed rAF opportunities | LoAF / long tasks |
|---|---:|---:|---:|---:|---:|---:|
| Baseline horizontal scrolling | 1402 / 742 | 6.1 / 6.2 ms | 24.2 ms | 1 | 7 | 0 / 0 |
| Cached geometry, sustained panel boundaries | 3795 / 580 | 6.1 / 6.2 ms | 12.1 ms | 0 | 1 | 0 / 0 |
| Menu opening/closing sample | 6883 / 0 | 6.1 / 6.2 ms | 12.2 ms | 0 | 3 | 0 / 0 |
| Intermediate combined sample, before minimal snapshot | 7623 / 354 | 6.1 / 6.2 ms | 78.9 ms | 2 | 27 | 1 / 0 |
| Minimal snapshot, progression and two handoffs | 5903 / 420 | 6.1 / 6.2 ms | 24.3 ms | 2 | 15 | 0 / 0 |
| Final compiled cache refresh, menu and consecutive handoffs | 13137 / 270 | 6.1 / 6.2 ms | **24.1 ms** | **3** | 21 | 0 / 0 |

“Estimated missed rAF opportunities” rounds each interval against that sample's median cadence; it is **not a count of physically dropped display frames**. Samples contain tool/idle intervals, and use different input sequences/cache states. They are diagnostic observations, not a controlled statistical A/B benchmark. The instantaneous large-scroll sample is retained but not used as evidence of sustained motion.

The intermediate 69.9 ms long animation frame occurred at routing. It attributed two React scheduler `MessagePort` callbacks (5.8 and 5.4 ms), with 0.5 ms forced style/layout. Remaining wall time and image decode/GPU paint cost could not be attributed. Source inspection independently identified the discarded full-page snapshot and repeated scroll geometry reads; both were removed. The minimal-snapshot sample still has 24.3 ms and approximately 18 ms gaps. The final compiled cache-refresh sample recorded 24.1 ms maximum and three intervals above 16.7 ms, with no observed long task or long animation frame. It includes Story → Bungalows → Dining and a completed menu opening/closing, plus tool/idle time; 270 intervals changed scroll position. The 16.7 ms target is therefore **not an every-frame guarantee**, even on this tested setup.

Raw evidence: [baseline](reference-2026-10-06-evening/performance-before-scroll.json), [intermediate stall with script attribution](reference-2026-10-06-evening/performance-after-latest-build.json), [minimal-snapshot sample](reference-2026-10-06-evening/performance-after-snapshot-final.json), [final compiled sample](reference-2026-10-06-evening/performance-after-cache-final.json), [all summaries](reference-2026-10-06-evening/performance-summary.json). Corresponding `.trace.json` files preserve observed callback/PerformanceEntry timestamps. `node scripts/summarize-signature-performance.mjs` regenerates them.

## Validation and remaining gaps

- Production build and its TypeScript check pass. All 19 existing unit/integration tests passed during this revision, including fixed-role authentication, login/logout, session revocation, persistent rate limits and scoped database operations. Final Signature and Standard production HTTP regressions pass for deep links, 404s, disabled modules, bookings, metadata and draft/site isolation.
- Browser verified Story → Bungalows → Dining without clicking; normal destination scrolling, reverse aperture contraction (progress .519 → .260), Back/reload/Forward restoration, repeated menu opening, keyboard/pointer Dock, and image-error fallback.
- At 360/390 px, long copy, reversed panel order, single panel and single timeline entry were checked. At 390 px, long timeline text grows to 6125.6 px without horizontal overflow. Desktop long text is focusable and readable to its scroll end. Mobile Story → Bungalows works through vertical scrolling. The 386×684 reference timeline is 2456.7 px high and all five photographs are loaded.
- Physical touch momentum, notched-device safe areas and a real system reduced-motion session remain unverified. Reduced-motion branches and cleanup remain implemented; the available browser only exposes viewport/visibility controls.
- Native 60 Hz/GPU/decode-paint profiling remains blocked. Occasional handoff stalls remain; do not infer performance from video samples or passing builds.
- Netlify credentials/runtime are unavailable. All database/browser checks use the isolated local published fixture, not live Netlify integrations.
- Existing deployments retain their stored snapshots. The idempotent reference seed does not overwrite content; adopting the new image filename requires an intentional authorized publication. No draft is promoted by a migration or seed retry. Reference asset/font commercial rights remain unverified, as documented previously.

M5 editing, video playback/transcoding, M6 packaging and hosted deployment verification were not implemented.
