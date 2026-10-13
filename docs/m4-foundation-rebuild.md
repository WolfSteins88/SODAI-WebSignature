# M4 Foundation — implementation and manual review

Review: http://127.0.0.1:3112/foundation. Start from the repository with `npm run build`, then `npm run review:signature`. This is the owner's local machine, using an isolated PostgreSQL-compatible PGlite socket fixture and Drizzle, not a verified live Netlify integration. Visual acceptance remains with the owner. M5 has not started.

## Implemented

The previously absent Foundation route now renders its own six constrained compositions: photographic opener; cream heritage introduction and teacher/child photograph; offset commitment photographs; numbered aims; wide dance photograph; deep-red staggered draggable programs; and final initiatives with performance photographs, dancer portrait and closing information. The complete 29.87-second supplied recording was watched sequentially and the strip sequence replayed. Measurements were recorded before implementation in [the composition map](reference-foundation/panel-map.md).

Thirteen corresponding reference photographs and complete copy are held in the separate replaceable comparison dataset. The genuine existing Caslon and Helvetica webfonts are reused. Images have meaningful alt text, responsive sources, loading fallbacks and editable focal points. The hero is prioritized; later images load lazily. No public video, donation/payment action, invented next-page transition or CMS editor is included.

Optional validated `foundation` content uses ordered arrays, stable unique section/program IDs, enabled flags and six constrained layout variants. Rendering filters enabled entries without assuming a section count. The existing site-scoped published accessor, server-configured template selection, route metadata/canonical URLs and sitemap remain in use. Disabling Foundation, or all its sections, omits the menu/sitemap route and returns404. Standard excludes this Signature-only route. Existing snapshots remain compatible; this optional JSON field requires no SQL migration. The existing idempotent comparison seed does not overwrite customer drafts or publications.

The program strip uses native horizontal overflow with mouse drag, native touch scrolling and ArrowLeft/ArrowRight/Home/End controls. It caches geometry on resize/content changes, updates a DOM indicator without React scroll renders, and removes observers/listeners on unmount. Visible focus feedback and empty/single safeguards are included. Existing menu/route choreography and Dock transforms are retained. Mobile sections have native vertical content flow and individual image ratios rather than full-screen desktop boxes.

## Checks and evidence

- Production build and TypeScript passed; all24 tests passed, including actual Auth.js login/logout/roles/revocation, scoped persistent content and the new Foundation schema cases.
- Standard and Signature HTTP regressions passed. Signature checks include Foundation metadata/menu/sitemap, disabled404, empty/single program collections, draft/site isolation and restoration of the full fixture.
- Real browser1279×701: mouse drag moved the strip280px; keyboard endpoints/arrows worked; completed repeated menu opening/Escape restored body scrolling; Dining→Foundation menu selection, Back/Forward and reload were verified. All14 rendered Foundation images, including the decorative SVG, loaded after traversing the page.
- Real browser360px/390px: no horizontal page overflow; variable content-driven section heights. Reversed section order, long text, one enabled section and disabled404 were verified through published fixture variations, then `default` restored. A longer introduction expanded to2891px at360px without page overflow. Actual touch momentum and OS reduced-motion switching remain unverified; the Foundation strip itself adds no tweened motion.
- Final measured desktop boundaries are retained in [browser bounds](reference-foundation/final-browser-bounds.json). After the final indicator-only adjustment, heritage began701.33 and ended2563.73; programs began4982.79 and measured1261.76 high; initiatives began6244.55. Corresponding live-reference values were701.33/2563.76,4980.21/1261.74 and6241.95. This approximately3px accumulated difference is disclosed, not an exact-match claim.

Numbered side-by-side images use the2558×1402 recording normalized to1279×701 against an actual1279×701 browser viewport. The reference's original CSS viewport/DPR cannot be proven from the recording. Programs are aligned by the second photograph's upper edge at approximately107px, rather than arbitrary wheel percentages. End-of-page initiatives use the final recording frame and browser document end. The original reference rail's WhatsApp/divider details differ from the preserved existing deployment rail; booking controls retain published demo destinations.

1. [Hero, reference0s](reference-foundation/01-hero-comparison.png)
2. [Programs, reference20s](reference-foundation/02-programs-comparison.png)
3. [Final initiatives, reference29.8s](reference-foundation/03-initiatives-comparison.png)
4. [390px introduction](reference-foundation/06-mobile390-intro.png)
5. [Sequential reference contact sheet](reference-foundation/chronological-sheet.jpg)

The initial frame export was truncated; it was repaired using bounded chunks and all contact-sheet frames decoded successfully. `report-foundation-evidence.mjs` regenerates comparisons; `report-foundation-frames.mjs` regenerates the chronological sheet. No missing/invalid frames are presented as verified evidence.

## Production performance and remaining differences

[Actual observer JSON](reference-foundation/performance-production.json), [trace-event container](reference-foundation/performance-production.trace.json) and [summary](reference-foundation/performance-summary.json) retain the real browser sample: Windows Chrome154,1279×701, DPR approximately1, display cadence approximately165Hz. The73.29-second session included vertical page boundaries, program drag/keyboard input and repeated menu opening/closing. It recorded12085 rAF intervals,41 callbacks with vertical scroll changes, median6.1ms, p956.2ms, max12.2ms, zero intervals above16.7ms, zero observed long tasks and zero observed long animation frames. Instrumentation was opt-in and local-only. The sample precedes the final indicator spacing/rule-only correction.

These observations do not establish sustained60Hz behavior or physical dropped-frame counts. This environment did not provide a controlled60Hz device or a native compositor/GPU trace; no forced-layout, decode/paint or dropped-frame attribution is claimed. There were no reported long-task entries to attribute in this sample. Touch momentum, slow-network emulation and exhaustive interrupted-navigation/reduced-motion combinations remain manual checks.

Known visual differences: source image parallax/overscan is represented by static focal crops; the indicator thumb uses the native visible-width ratio rather than the source Splide's initial55% fraction; source crop changes during scrolling can differ. The final indicator correction aligns its rule position/thickness while preserving section height. Some available original photographs are small; they are retained at their genuine resolution rather than invented replacements. Mobile is a readable adaptation, not claimed exact fidelity from desktop footage.

Live Netlify Database/Blobs checks remain blocked by unavailable configured hosted credentials. Published booking URLs remain demonstration placeholders. Reference commercial redistribution rights have not been established; replacement with licensed villa assets remains required before that handoff. Existing Bencho MIT notices remain unchanged. No deployment or M5 editing interface was added.

Final8October build8904 passed. Browser reconfirmed six enabled sections, all four program images loaded, second photo y107.03 and corrected2px indicator y646.14 at the matched20s state. KeyboardEnd reaches395.33px against rounded396px maximum. Final comparison02 was refreshed and the viewport override reset. Production review47970 is running on3112 with the complete published fixture.
