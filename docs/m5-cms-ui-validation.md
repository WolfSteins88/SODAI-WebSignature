# CMS UI browser and regression validation

Date: 11 October2026. Production Next16.3.8 / React19.3 / Motion14, local PGlite-backed PostgreSQL and filesystem media. Browser: Codex in-app Chromium, Windows host. Isolated dataset `cms-ui-preview-check`, localhost3116; owner dataset not used for mutations.

-52 tests pass: schema/booking/M4 regressions, both fixed roles and real TOTP/JWT/CSRF/rate limiting, storage, unsaved preview schema/size/fallback purity, archive derivation and transactional save/archive/restore/conflict behavior.
- Production builds75303 and23322 passed. Final cosmetic/preview fixes tracked in checkpoint.
- Standard and Signature public HTTP suites pass (deep links,404, drafts/site isolation, booking, disabled modules, metadata/sitemap/robots, empty/single galleries).
- Actual browser login admin/admin verified. Unsaved identity changed the actual Signature footer/name without publication. Navigation uses one selected form and retains values across sections. Save advanced draft2/live1; unsaved text was absent from public HTML.
- Unsaved Story opener, room title, Culinary category, Gallery title and Terms title were observed in iframe public components. Gallery disable produced Page unavailable; re-enable recovered without save. Story duplicate11/remove10/Undo11/reorder/save3 and explicit publish3 verified. Public HTML then included the published Story title. Old editor save returned409, retaining its exact typed `Mobile unsaved story` value.
- Anonymous `/preview/live`:307 to/admin/login, private/no-store and noindex/nofollow. Anonymous content API401. Channel/source/scope/version/payload checks are enforced in source; malformed scope/route/commands/extra fields/oversized content have unit coverage. No claim of exhaustive adversarial browser injection testing.
- Actual CSS viewports1280×720,1440×900,390×844,360×800: no document horizontal overflow.390 Editor/Preview switching retained inputs; Mobile preview selected actual390-width iframe. Keyboard dropdown ArrowDown/Escape, compact navigation Escape and preview separator ArrowLeft42% verified. Collapse/reopen retained mounted live preview. Physical touch and OS reduced-motion setting not exercised; reduced-motion code paths are implemented.

## Preview timing samples
Observed production browser,1280×720 editor, desktop1280×900 preview scaled to fit; no CPU/network throttling. Timed interval covers server action roundtrip through two post-render animation frames, excludes300ms typing debounce. rAF sampling is transient only while a preview update runs; no per-frame React state/layout reads. Long-task PerformanceObserver active during each sample.

| Update | Roundtrip/settle | rAF samples | Largest gap | Gaps >20ms | Observed long tasks |
|---|---:|---:|---:|---:|---:|
| Room title |98.5ms|12|6.1ms|0|0|
| Culinary category |79.5ms|11|18.1ms|0|0|

The virtual browser did not establish a physical60Hz refresh rate; these are update-latency/observed-jank samples, not dropped-frame traces or a60fps certification. Remote latency, large photos, slow devices and other edit scenarios can stall. Last measured details are exposed as `data-preview-profile` on the private preview root for local inspection.

## Remaining limits
Netlify hosted Database/Blobs integration is blocked by absent credentials/context. Comprehensive screen-reader, physical touch, OS reduced-motion, zoom and every field/collection combination need broader device testing. Owner determines visual acceptance. No M6/deployment performed.

Final build79143 passed; final52-test run16561 passed. Real local integration89017 passed login/wrong/logout, ready upload/private/public media, save/preview/409/publish/restore/restart/exact bytes and paired backup/restore. Selected room-hero UI upload returned ready private WebP, browser decoded120px image with ?draft=1 before Save Draft; public URL remained404. File chooser took about91seconds in the automation bridge; no upload speed claim. Replaced authentication cookie with another local test session: preview correctly paused, retained exact typed title, and Retry after reauthentication restored the unsaved render. Owner3112 login confirmed Draft8/Live8; no owner content changes.
