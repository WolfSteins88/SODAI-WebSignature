# M4 hero-less navigation repair — 9 October 2026

Implemented for owner review. Visual acceptance remains with the owner; M5 has not started.

## Root cause and changes

The controller skipped the source morph for Gallery/Terms through a URL exception, but destination readiness still required a hero image. Both directions therefore used a short fallback fade instead of the requested choreography.

- Every Signature server page now declares explicit `data-signature-transition` and `data-signature-background` metadata. Gallery, Terms and restaurant-menu declare no hero; their thumbnails, viewer, logos and illustrations cannot become hero candidates. Hero lookup remains restricted to existing real hero containers.
- One existing GSAP lifecycle handles four branches: hero→hero retains600ms shrink/200ms swap/900ms expansion with25ms overlap; hero→none shrinks/grays the source, dissolves its small frame, then reveals usable content; none→hero fades content, introduces the decoded real destination in the small frame, expands/colors and reveals its real title/shade; none↔none fades content without a photo frame or zoom.
- Hero-less readiness checks the actual main layout; real heroes require image decode and measured destination bounds. Destination background metadata supplies the actual cream/red palette. The hero source copy is permanently removed after shrink. Hero-less outgoing content holds at15% opacity during readiness and fades over120ms alongside incoming appearance/reveal, avoiding a completely empty waiting plane.
- Gallery viewer dismissal uses its existing close/unlock/focus cleanup before snapshotting. Dialogs are excluded from snapshots. Filters, masonry, Terms index and public layouts are unchanged.
- Preserved fixed menu handle, Dock, menu exit lifecycle, single commit, cancellation/resize cleanup, focus, history, image ownership release and ordinary photo color progression. No extra animation loop or per-frame React rendering/DOM measurement. Removed empty-target GSAP set warning.

## Changes and checks

Application files: `src/components/signature/menu-hero-transition.ts`, `hero-morph-geometry.ts`, `gallery-client.tsx`, and metadata in `index.tsx`, `gallery.tsx`, `terms.tsx`, `dining.tsx`, `foundation.tsx`, `location.tsx`, `packages.tsx`. Focused coverage in `tests/hero-morph.test.ts` and `scripts/check-standard.ts`.

- Final production build49525 passed, including TypeScript;38tests passed after coverage refinement. The later empty-target correction removes only an unused GSAP set; final production build/typecheck and browser capture verify it.
- Final Standard and Signature HTTP suites passed: deep links, unknown routes, disabled modules, metadata/sitemap/robots, published changes, draft/site isolation, booking context, gallery edges and explicit transition metadata on all Signature routes.
- Desktop1279×700: Story↔Gallery, Rooms↔Gallery, Story↔Terms, Rooms↔Terms, Gallery↔Terms, plus Story→Rooms hero control. Every recorded run commits once, with no branch fallback; final states have no transition layer, photo owner, scroll lock or inert main and focus the main content.
-390×844: all ten directions plus hero control; no horizontal overflow or retained lock/inert/layer.360×800 final build: Gallery→Rooms→Terms→Gallery also settles cleanly without overflow.
- Gallery Bungalows filter/viewer→Menu→Terms with Enter verified. Viewer closes before navigation; no viewer becomes a frame. Gallery Dining filter survives same-route menu selection. Terms cancellation anchor, Back/Forward and anchor reload verified; heading settles~19px from top on desktop. Scrolled Terms→Gallery and route Back/Forward preserve usable pages.
- Pending Escape, reopen after commit, and resize cancellation verified; no stale layer/lock/inert; focus returns to the handle. Repeated menu opening/navigation exercised throughout matrix.
- Failed destination Story image from Gallery settles through labelled `destination-image-unavailable` fallback to accessible Photograph unavailable with usable main focus. Default published fixture restored and checked.
- Captured final branches inspected sequentially through numbered contact sheets: no Gallery/Terms expansion, no empty hero frame for none↔none, no source full-hero restoration, same small destination crop expands to real hero/title/shade. Faint source persists during measured readiness wait.
- An early automation attempt clicked a secondary item while it was moving into place; no navigation intent occurred. Retried after menu reveal settled. An HTTP check launched during a rebuild failed because the build ID was being replaced; rerun after build completed passed. Neither is concealed as an application regression.

## Production performance evidence

Windows10/Chromium155 IAB,1279×700 CSS px, DPR~1, published local PostgreSQL/Drizzle fixture, production webpack build; sampled browser screenshot capture running concurrently. Approximately6.1ms rAF cadence (~164Hz), **not a controlled physical60Hz test**. Times exclude menu opening but include overlapped exit/readiness. Raw rAF, Long Task and Long Animation Frame observers plus lifecycle marks are saved; this is not a GPU/compositor trace or hardware dropped-frame measurement.

| Final direction | Total ms | Readiness wait ms | Active rAF intervals | Median / p95 ms | Max ms | Intervals >16.7ms |
|---|---:|---:|---:|---|---:|---:|
| Gallery→Story |1640.4|323.0|263|6.1 /6.2|24.2|2|
| Story→Gallery |1128.9|0.2|171|6.1 /12.1|42.3|1|
| Gallery→Terms |901.2|286.4|146|6.1 /6.2|12.1|0|
| Terms→Gallery |905.4|295.7|145|6.1 /6.1|18.1|1|

All four final runs:0observed long tasks,0Long Animation Frames, one commit, no fallback. Larger-than-target total times for none→hero and none↔none include route readiness; intentional motion remains~1.3s/~0.6s. The faint outgoing coverage masks those waits rather than accelerating image decode or concealing timing. The42.3ms interval remains an observed stall; observer/screenshot evidence does not isolate GPU paint/decode causation. No universal60fps claim.

Evidence under `docs/reference-heroless/`: initial full desktop matrix and raw profiles, mobile/additional checks; `final/` contains four final screenshot sequences/GIFs/contact sheets, failed-media check and raw profiles. GIFs are **sampled browser screenshots**, not continuous60fps video. `node docs/reference-heroless/verify-evidence.mjs` checks final coverage/frame/commit invariants and initial matrix cleanup and regenerates `final/performance-summary.json`.

- [Final Gallery→Story sampled capture](reference-heroless/final/gallery-story.gif)
- [Final Story→Gallery sampled capture](reference-heroless/final/story-gallery.gif)
- [Final Gallery→Terms sampled capture](reference-heroless/final/gallery-terms.gif)
- [Final Terms→Gallery sampled capture](reference-heroless/final/terms-gallery.gif)
- [Final timing data](reference-heroless/final/performance-summary.json)

## Remaining limits and review

OS reduced-motion mode, physical touch momentum, modified-click behavior and cross-browser verification were not newly exercised; existing reduced-motion immediate cleanup and Next onNavigate semantics remain. No controlled60Hz/GPU trace, deliberately slow-network run for these new branches, or forced route-timeout document fallback verification. Timing waits and isolated frame stalls remain above the ideal target. Owner visual acceptance is pending.

No live Netlify Database/Blobs integration or deployment was verified: local review uses real scoped published PostgreSQL+Drizzle fixture. Standard/authentication unchanged, video disabled, no M5.

Review server14385 runs on **http://127.0.0.1:3112/gallery**; also `/`, `/rooms`, `/terms`. This is the owner's local machine, not a remote preview. Restart from the project directory with `npm run build`, then `npm run review:signature`. Opt-in profiling start command: `$env:SIGNATURE_PERFORMANCE_REVIEW='1'; npm run review:signature`. The retained review tab is Gallery, default fixture restored, viewport override reset.

The progress checkpoint was reconstructed from preserved reports after a Windows text-encoding write truncated its older verbose history. Original phase evidence/report files remain. Future writes explicitly use UTF-8; this repair and exact continuation action are recorded.
