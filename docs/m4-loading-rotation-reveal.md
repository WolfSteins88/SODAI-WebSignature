# M4 Loading rotation and hero reveal — 9 October 2026

Implemented for owner review; visual acceptance remains with the owner. This supersedes the earlier static ~0.77-second loading intro only. Culinary composition, Standard, authentication, public-content scope, menu/Dock and route transition architecture remain in place. No M5, deployment or public video playback.

## Corrections

- Optional published `signatureMenu.introBrand` carries separate emblem/wordmark images, aspect ratio and validated emblem bounds. The comparison seed uses vector paths split from the existing comparison logo, with its exact coral footprint. The renderer contains no fixed Tandjung Sari brand. Existing configured emblem/name and combined-logo/text fallbacks remain usable; the combined wordmark never rotates.
- Centralized timing: 1.4s presentation, 1.1s overlapping cream exit, 0.65s logo fade, title at exit+0.55s and rail at exit+0.7s. Dedicated linear counterclockwise emblem tween: 2.8s/revolution, continuous through exit; stationary wordmark.
- Hero bounds/crop stay fixed. Only overlay/logo opacity and emblem transform animate. Visible hero tone is released before the cream fades; the existing photo controller recollects after inert removal, preventing a second grayscale entrance.
- Critical head styles cover the first document paint. Only visible hero, brand and critical fonts participate in readiness. Four-second document deadline, failure fallback, no-JS fallback, reduced-motion early completion and cancellation/lock/focus cleanup remain. Internal Home/history/admin/preview/Standard do not start a new intro.
- Local opt-in instrumentation captures inline animation values without per-frame layout measurement or React rendering. The failure fixture now covers split branding.

## Reference comparison and evidence

The brief names `Loading Screen(1).mp4`; that filename was unavailable. Used the supplied `Loading Screen.mp4` and `Recording 2026-10-09 165836.mp4`. Full-resolution emblem samples at reference 3.50–5.75s show counterclockwise motion with late deceleration. Relative angles: 0, -26, -41, -56, -67, -75, -82, -86, -90, -92 degrees. The readable lettering stays fixed. The earlier rejected recording shows a short static cream/logo interval after browser navigation chrome/previous-page visibility; those browser frames are not treated as new-document hero flashes.

The implementation uses the requested steady 2.8s revolution. It does not claim to reproduce the reference's late deceleration or initial network wait exactly. Current configured mark is 112 CSS px wide; no pixel-identical size claim against the recorded reference.

- [Before sequence](reference-loading-rotation/rejected-sequence.jpg)
- [Reference full frame at 4s](reference-culinary-intro/loading-full-4.png)
- [After sequence](reference-loading-rotation/after-sequence.png): frames 2,20,30,38,45,64, left-to-right/top-to-bottom. Logo presentation → first hero visibility → cream exit → final title/rail. All screenshots from one production reload at 1440×900 CSS px.
- [Sampled production motion](reference-loading-rotation/production-sampled-motion.mp4): 65 real browser screenshots encoded at 20 fps for inspection, **not a continuous screen recording or a performance measurement**. Variable screenshot sampling means playback timing is approximate. Raw rAF traces supply actual timing.
- [Cold trace](reference-loading-rotation/cold-trace.json), [cached trace](reference-loading-rotation/cached-trace.json), [slow trace](reference-loading-rotation/slow-trace.json), [failed-logo trace](reference-loading-rotation/failed-logo-trace.json), [failed-hero trace](reference-loading-rotation/failed-hero-trace.json).

## Validation

- Production build and TypeScript pass; 43 tests pass, including Auth.js login/logout/roles/revocation, persistent content/rate limiting and site/environment/draft isolation. Added split-brand optionality and invalid bounds coverage.
- Standard and Signature production HTTP suites pass: public deep links, 404s, content publication/isolation, booking context, disabled modules, metadata/sitemap/robots and empty/single galleries.
- Real browser: cold entry and cached hard reload; wordmark transform remains empty throughout every recorded frame; negative emblem angles continue throughout cream exit. Final hero tone is 0, overlay hidden, root/body overflow restored, site inert false. Menu works after completion. Culinary route and internal Home, Back to Culinary, Forward Home were checked with settled URLs; no intro replay.
- Failed split emblem shows configured villa name; failed hero shows the media fallback. Both release at ~2.5s and clear locks. Six-second critical-image/logo/font response delay releases through document deadline at 3949.4ms from hydration. Default fixture restored; slow server stopped.
- No console errors during default production checks. Expected 404s occur only in deliberate asset-failure fixtures.

| Production trace | CSS viewport / DPR | Intro duration | rAF median / p95 / max | Intervals >16.7ms |
| --- | --- | --- | --- | --- |
| Initial entry | 603×676 / 1.5 | 2501.7ms | 6.1 / 6.2 / 36.4ms | 1 |
| Cached reload with screenshot capture | 1440×900 / 1.5 | 2493.3ms | 6.1 / 6.2 / 18.2ms | 1 |

Windows 10, Chromium 155 in-app browser, production webpack build. No long tasks in either trace. Initial trace includes one 77.1ms long animation frame before the intro start mark (script initialization); cached trace has none. The environment's ~6ms rAF cadence is not a documented physical 60Hz display, and screenshot capture adds overhead. These measurements do not establish dropped displayed frames or universal 60 fps.

## Remaining differences / limits

Owner visual acceptance remains pending. Actual OS reduced-motion mode, JavaScript-disabled browser, failed-font network rejection and physical touch/cross-browser/controlled 60Hz GPU profiling were not exercised: available browser controls do not expose those emulation modes. Reduced-motion/no-JS paths were inspected; bootstrap eligibility/failsafe were tested. First sampled new-document frames are cream-covered, but no compositor-level first-paint filmstrip was collected. Sampled motion and rAF values cannot substitute for that check. Netlify live integrations were not reverified; review uses local PGlite PostgreSQL protocol + Drizzle published snapshots.

## Local review

Running: http://127.0.0.1:3112/ (homepage loading on reload), http://127.0.0.1:3112/dining (preserved Culinary). Review session 17609, default reference dataset. Browser viewport override reset.

From the project directory:

```powershell
npm run build
npm run review:signature
```

Optional local trace instrumentation: set `$env:SIGNATURE_PERFORMANCE_REVIEW='1'` before the review command. The review fixture uses generated account hashes and local database content; it is not a Netlify deployment.
