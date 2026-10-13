# M4 Signature Gallery rebuild — manual review pending

The complete 23.9333-second supplied recording was inspected sequentially before implementation. Measurements and timestamps are in reference-gallery/panel-map.md. This phase does not implement M5 or public video.

## Implementation

Dedicated cream Gallery replaces the previous generic hero/showcase. Five natural-ratio masonry columns use measured desktop margins/gutters; responsive layouts use four/three/two columns. Sticky All/Bungalows/Dining filters switch to taupe when pinned (threshold-only IntersectionObserver). The collection excludes every guest-comment asset, testimonial and rating. The separate comparison seed contains 94 genuine static photographs: 64 Dining, 10 Bungalows, 20 other. Thumbnails reserve native dimensions and lazy-load responsive sizes. Meaningful alt descriptions accompany each photograph.

A native modal viewer uses the taupe viewport, measured portrait/landscape sizing, Close position and optional captions. GSAP moves the panel vertically and photographs horizontally; system reduced motion takes the immediate path. Previous/Next is bounded within the current filter. The selected image and two neighbors are decoded; changing selection keeps the existing photograph visible until the next is ready, and stale requests cannot commit. Errors retain usable navigation. Escape, arrow keys, focus trapping/restoration, saved scroll, mobile buttons/swipe and route/unmount cleanup are implemented. The rail can close the viewer then reopen the established Signature menu. Published booking destinations remain configuration-dependent.

Optional signatureGallery JSON stores stable IDs, media UUIDs, native dimensions, alt/caption/category IDs, enabled status and ordered items. Existing customer snapshots remain compatible; no relational migration is needed for the additive JSON contract. Legacy Standard gallery is unchanged. Reference viewerOrder preserves the source's different viewer sequence; future CMS reorder must clear or update these optional comparison-order values along with item order. Without viewerOrder, array order controls both. The legacy Signature fallback assumes 3:2 dimensions until converted to structured records.

Public routes still use the configured site-scoped published accessor. Disabled Gallery returns404 and is absent from menu/sitemap; empty enabled Gallery renders a safe200 state. Gallery-only disabled media cannot authorize public Blob access; admin foreign-media validation still checks all references. Structured fields do not provide arbitrary markup, code or layout editing. Reference seed remains an explicit isolated opt-in; it does not replace customer content on normal startup.

## Checks completed

29 tests passed, covering M1 authentication/roles, CSRF/session revocation, database persistence, site/environment/draft/foreign-media isolation, schemas, disabled gallery-only public media and existing modules. TypeScript and final production build82543 passed. Standard and Signature local PostgreSQL+Drizzle HTTP regressions passed, including94/93 visible photographs, disabled404/menu/sitemap, empty/single and canonical routes.

Browser1279×700: first thumbnail x86.1667/y128.625/w206.104, source86.177/128.646/206.115 (approximately0.03px maximum). Viewer frame top87.5/height525, portraitwidth390. All94/Bungalows10/Dining64 verified. Selected ceremonial portrait→Previous sunset/caption matched source sequence; Escape restored y4133.333 and original thumbnail focus with body unlocked. Single photograph disables both arrows; empty collection is safe; reordered array and viewer order after clearing comparison overrides verified. Failed media displays fallback with Next enabled. Repeated menu open/Escape checked. Actual360/390/768 viewport widths matched document width without horizontal overflow. Mobile composition is an adaptation: supplied footage establishes desktop only.

## Performance evidence

reference-gallery/performance.json is an actual production browser PerformanceObserver/rAF sample, not a native DevTools/GPU trace. WindowsChrome155,1279×700,DPR~1, approximately165Hz display;68.1264seconds,11185 intervals/58 moving samples. Median6.1ms,p956.2ms,max18.2ms;2 intervals above16.7ms,0 reported long tasks/long animation frames. Included scrolling, viewer opening/previous/closing and repeated menu. This cannot establish controlled60Hz dropped-frame/forced-layout/decode-paint or sustained touch-momentum performance. No universal60fps claim. Sample precedes final arrow/emblem/menu-handoff corrections.

## Differences and limits

Guest comments were deliberately removed; All gallery reflows and has three filter labels rather than four. The recording's CSS viewport/DPR is unknown; comparison frames are normalized1279×700. Transition durations/easing are reconstructed estimates, not exact timing proof. Font rasterization/image resampling, rail/control details and configured WhatsApp availability can differ. The literal sunset caption description comes from supplied footage; current live source captions are empty. Reference assets/fonts require appropriate rights before commercial handoff. Exact mobile fidelity, OS reduced-motion execution, throttled-network decoding and controlled60Hz/native profiling remain unverified. Live Netlify integrations are not verified by these local fixtures. The earlier Packages Forward-after-new-scroll gap remains outside this Gallery correction.

## Local review

URL: http://127.0.0.1:3112/gallery
Startup from project directory: npm run build, then npm run review:signature.
This uses isolated published local PostgreSQL fixtures, not Netlify. Owner visual acceptance remains pending. No M5 work.

Evidence files: 01-gallery-comparison.png (0s),02-portrait-comparison.png (18s),03-landscape-comparison.png (20s),04-mobile390.png. Source-vs-updated evidence only: no pre-rebuild Gallery screenshot was captured.

Final browser follow-up: viewer rail→menu→Terms worked, Back restored Gallery y4133.333 and Forward reached Terms with scrolling unlocked. An injected-debugger synchronization timeout interrupted a subsequent immediate Back/reload attempt; native screenshot remained available and fresh tab12 recovered. This is not claimed as exhaustive rapid-history proof. Final360 long-caption box y632..680/h48 with235px scrollable text, keyboard continuation and no document overflow passed.390 header79 and pinned filters top79/taupe verified. Single-photo Bungalows empty filter gives safe message. Default94 restored. Final Signature HTTP repeated against build82543 passed.

Final production sample (performance-final.json): 79.42s, 13057 intervals/6 moving, median 6.1ms/p95 6.2ms/max 30.3ms; 4 above16.7ms, 0 long tasks/0 long animation frames. Same WindowsChrome155/DPR~1/~165Hz constraints; selected photos were warm-cache. Final corrected build82543; no controlled60Hz/native GPU claim.

Cleanup: owner tab3 recovered by explicit reload, final94 photographs/video0/unlocked/header79 confirmed at default598×676. Duplicate QA12 and source/viewer10/11 closed; analysis3118 stopped; viewport reset. Temporary failed analysis tab9 could not be addressed because its generated error-page URL is blocked by browser policy; no retry/bypass attempted. Review99703 remains running3112.
