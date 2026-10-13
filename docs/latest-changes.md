# Latest changes — 12 October 2026

## M5 CMS typography and wrapping repair

- Fixed the split “Gallery 1” label by widening nested collection cards and using natural UI word wrapping. Short labels stay intact; long list titles are bounded to three lines with full accessible names and complete selected headings.
- Audited all 16 CMS sections and responsive widths. Final build and TypeScript passed; 66 tests passed. Owner Draft 9 / Live 9 is unchanged. Review at http://localhost:3112/admin/rooms. [Details and screenshots](m5-cms-typography-wrapping.md).
- Native 125%/200% browser zoom was unavailable; equivalent CSS viewport checks passed. No image Update/Delete work was included.

## M5 Villa Studio CMS visual redesign

- Shared grey/white/coral app shell, icon sidebar, collapse/mobile drawer, real search/account actions and dashboard from actual saved snapshots. Original Draft9/Live9 remains unchanged.
- Compact category/master-detail structure across all content/settings menus; searchable collection lists, applicable Content/Image/Photos/Media/Amenities/Options/SEO tabs, expandable paragraphs, preserved actions/fields/IDs and disabled video.
- Story selection now positions the actual public preview after committed geometry; room selection opens its detail. Room metrics/hero and extra wording are grouped. Media search/filter grid and selected metadata; focused revision/diagnostic details without iframe.
-66 tests pass; TypeScript and production build pass; Standard/Signature public HTTP suites pass. Production browser: every menu inspected, mobile360/390, keyboard tabs/drawer/collapse/search, isolated CRUD/validation/save/publish/persistence/media tested. No owner content writes.
- Review http://localhost:3112/admin/dashboard, /admin/story and /admin/rooms. Startup: npm run demo:local. Report and evidence: [CMS redesign](m5-cms-visual-redesign.md). Physical touch/OS reduced motion/hosted OTP UI and Netlify deployment remain unverified; visual acceptance belongs to owner. No M6.


## 10 October 2026 — M5 offline demo and replacement content

- Local-only admin/admin Credentials login without OTP; fail-closed hosted guards, persistent limits and existing hosted TOTP preserved.
- Persistent local-data PostgreSQL and actual immutable filesystem image uploads; private draft/public publication checks retained. Previous CMS store copied safely; no edit reset. Paired stopped-store backup/restore excludes auth secrets.
- Optional shared identity/hero slots, neutral fallback, clear images, clearer Story/Copy groups; published navigation/next-scene/footer labels and SEO/Open Graph/Twitter wiring. Existing compositions/video-off/Standard preserved.
- Fixed transactional media-reference query deadlock.49 tests, TypeScript, production build, both public suites and isolated API/restart/rebuild/backup workflow pass. Browser login/save/media/logout verified.
- Review http://localhost:3112/admin/login; admin/admin. Preserved draft8/published8. Details and coverage: [M5 local demo](m5-local-demo.md). Netlify live and physical network-off browser verification remain unverified. No M6.


## M5 Custom CMS — local review implementation

- Added structured content editors, collection duplicate/order/visibility/archive/restore, authenticated preview, transactional save/publish/history and optimistic conflicts. Preserved fixed public compositions, M4 motion and disabled video.
- Added real password-plus-TOTP authentication, persistent replay/rate controls, private media handling and scoped Netlify Blobs upload/library operations. Exactly two fixed roles; diagnostics Super Admin only.
- Added migrations0002/0003, compatible schema upgrades, operator-only account provisioning, pinned dependencies and persistent local CMS review runner.
- Final build/TypeScript,46 tests and both public HTTP suites passed. Production browser verified login/logout/both roles, draft/public separation, publish/restore, mixed Story reorder and archive position. Actual upload error correctly reports unavailable storage.
- Review http://localhost:3112/admin . [Setup, content coverage, evidence and explicit remaining checks](m5-custom-cms.md). Netlify credentials/operator accounts unavailable; hosted integrations and mobile/reduced-motion review remain pending. No M6/deploy/ZIP.

## Previous: Culinary stagger restored and homepage intro

- Restored Breakfast/Drinks left and lower All Day Dining right; kept readable text, Culinary label, `/dining`, real menus and offer choreography.
- Added homepage-only cream/configured-brand intro with hero/font readiness, four-second fail-safe, no-JS fallback and interaction cleanup; no replay on internal Home or history.
- Final build/typecheck, 42 tests and both HTTP suites passed. Desktop/mobile, all category anchors, reload/history and failed hero/logo tested. Six-second asset delay releases at fail-safe. OS reduced-motion/JS-disabled browser checks remain.
- Review: http://127.0.0.1:3112/ and http://127.0.0.1:3112/dining . [Full evidence/report](m4-culinary-restoration-loading.md). Owner acceptance pending; no M5/deployment.

## Previous (superseded): Culinary label and symmetrical categories

- Signature Dining now renders as Culinary; `/dining`, category names and menu anchors stay intact.
- Equal photo frames in shared two-column rows, centered odd final category, larger readable descriptions/actions and mobile published-order stack.
- Build/typecheck, 40 tests and both HTTP suites passed; variable published category counts/order exercised. Browser visual checks blocked by browser URL security policy; owner acceptance pending.
- Review: http://127.0.0.1:3112/dining . [Details and remaining checks](m4-culinary-layout-update.md). No M5/deployment.

## Latest: Rooms readability and supplied gallery mechanics

- Restored asymmetric intro; Our Rooms hero/transition label; retained aligned listing rows. Larger20â€“22px desktop descriptions,16â€“18px actions,18px mobile body; balanced justified detail prose.
- Actual supplied CSS DynamicGrid ratios/timing and Motion14 shared layouts/spring replace GSAP gallery approximation. Stable room/photo IDs, decode/return/focus/scroll/resize cleanup; lower strip retained.
- Final build/typecheck,39tests and both HTTP suites pass. All six details checked desktop/mobile;0/1/3/6/9 and reversal/resize/error cases exercised. Active profile max12.1ms,no intervals>16.7/no long tasks; physical60Hz remains unverified.
- Review: http://127.0.0.1:3112/rooms . [Full report/evidence](m4-rooms-readability-gallery-repair.md). Owner acceptance pending; noM5/deployment.

## Previous: Rooms layout and detail galleries

- Equal introduction images, aligned room rows, centered leads and balanced justified prose.
- Reusable spatial photo gallery on all Signature details, optional validated ordered collection (0â€“9), Close/Escape/focus/scroll restoration and safe error/resize cleanup. Legacy lower strip preserved.
- Production build/typecheck,39tests and Standard/Signature HTTP pass. Desktop/mobile and variable photo counts checked. Profile max24.3ms,one interval over16.7ms,no long tasks; physical60Hz remains unverified.
- Local review: http://127.0.0.1:3112/rooms. Details and evidence in [Rooms report](m4-rooms-layout-galleries.md). Owner acceptance pending; noM5.

## Previous: Gallery and Terms navigation repair

- Explicit server page metadata distinguishes actual heroes from Gallery/Terms/menu documents.
- Four coordinated GSAP branches preserve heroâ†’hero, shrink/dissolve into hero-less content, introduce/expand actual hero from hero-less pages, and gently fade between hero-less pages.
- Actual destination palettes, layout/decode readiness, faint source coverage while waiting, viewer cleanup, deterministic single-layer/commit cleanup. No fake Gallery hero.
- Final production/type build,38tests, Standard/Signature HTTP suites pass. Desktop/mobile ten-direction matrix; viewer/filters/anchors/history/keyboard/Escape/reopen/resize and failed-media checks recorded.
- Final sampled profiles:0longtasks/LoAF, median6.1ms; maximum42.3ms. Readiness286â€“323ms extends some transitions; physical60Hz/GPU performance remains unverified. Owner acceptance pending.
- Review: http://127.0.0.1:3112/gallery. No M5/deployment; local published database fixture, not live Netlify.
- Full evidence and remaining limits: [M4 hero-less repair](./m4-heroless-transitions-repair.md).

## Earlier changes

# Latest changes â€” 8 October 2026

Scope: latest M4 Signature work, including the hero continuity repair and smooth hero morph repair, the Menu and Our Story update, logo transition repair, menu toggle repair, Gallery menu layout fix and scroll/color/title polish. This is a change summary, not visual acceptance. M5 has not started.

## Latest: Hero continuity repair

- Removed the readiness fallback that restored the fullscreen source after shrinking. The source snapshot is now removed; a decoded destination blends inside the same small frame and expands behind an opaque mask.
- New600/200/900ms choreography, unchanged28% desktop frame, ready-stage clock reset, actual shade opacity and late title reveal.
- Escape-before-layer and resize intent/focus cleanup repaired. Slow/failed/no-hero handling retained with explicit causes.
- Full production screenshot sequences and per-frame paint checks recorded. Normal Storyâ†”Rooms measured1.696/1.688s with one commit and no fallback;37tests, production/TypeScript and both HTTP suites pass.
- Controlled60Hz/GPU cost and owner acceptance remain unverified. Evidence/report: `docs/m4-hero-continuity-repair.md`. NoM5.

## Previous: Smooth hero morph repair

- Replaced independent hero frames with one shared clipping plane, uniform image scaling and a smaller28% desktop intermediate frame.
- Early route/media readiness, overlapping400/150/640ms choreography, real destination crop/shade/title and color ownership prevent a second entrance.
- Local elapsed-time GSAP ticker avoids accumulated lag-smoothing delays; slow/failed/no-hero fallback and delayed-menu navigation intent repaired.
-37tests, TypeScript, production build and both HTTP suites pass. Desktop/mobile navigation, history, Escape/handle interruption and slow/failed media exercised.
- Actual production traces still contain~1s callback stalls: controlled60Hz smoothness and owner visual acceptance remain unverified. Report/evidence: `docs/m4-hero-morph-smooth-repair.md`. NoM5.

## Previous: Menu and Our Story update

- Rooms menu label; typed, validated, ordered optional social icons. Empty social configuration stays hidden.
- Removed public room/table booking buttons in both templates; preserved WhatsApp/contact and stored booking data.
- Removed the final elderly-man still and all disabled-video geometry; future video contract remains disabled, with no playback.
- Justified Story narrative paragraphs, preserving headings and captions.
- Added actual source-hero shrink/grayscale â†’ destination blend/expand/color menu routing, fixed handle cancellation and no-hero/media-error fade fallbacks. Preserved ordinary scroll handoffs and authentication/publication isolation.
- 35 tests, final production build, TypeScript and both HTTP suites pass. Desktop/mobile browser states and raw timing evidence are documented in docs/m4-menu-story-update.md. Timing remained throttled even with browser visibility enabled; foreground60Hz performance and owner visual acceptance remain unverified.

## Previous: navigation logo transition repair

- Removed the navigation logos from the shared fullscreen photo expansion path.
- Logo home navigation now reverses the existing menu timeline in about220ms and reveals the ready destination with an180ms opacity fade.
- Preserved outgoing content during readiness, stable logo geometry, normal anchor semantics, same-home top behavior, focus/scroll cleanup and existing menu/Dock repairs.
- 34 tests, TypeScript, production build and Standard/Signature HTTP checks pass. Desktop/mobile browser verification and remaining limits: `docs/m4-logo-transition-repair.md`.

## Previous: persistent menu toggle repair

- Fixed the native modal top-layer/inertness and hidden-rail causes that prevented the original handle from closing the menu.
- Kept the same stationary button accessible above the overlay, with dynamic labels and expanded state; removed duplicate close controls.
- One reversible GSAP timeline now coordinates rail, photo, surface, logo, links and contact details, including interrupted open/close sequences.
- Added guarded lifecycle, exact scroll/style restoration, background inertness, keyboard containment, Escape, cancelled pending navigation and destination focus for pages without a hero.
- Preserved Dock hover, reference layout, Standard, authentication, published-content isolation and grayscale scroll choreography.
- 32 tests, production build and both HTTP regression suites pass. Desktop/mobile browser checks and production observer evidence are documented in `docs/m4-menu-toggle-repair.md`.

## 1. Signature menu layout bug fix

- Fixed the CSS specificity conflict that allowed the generic two-column menu layout to override the reference menu.
- Restored the desktop rail, photograph and navigation to three explicit columns in one viewport-height row.
- Removed the unintended left offset and prevented navigation from wrapping below the viewport.
- Preserved the responsive mobile menu, existing opening/closing choreography and Bencho Dock enhancement.

Changed file: `src/components/signature/menu-fidelity.css`.

## 2. Scroll synchronization

- Replaced the shared independent requestAnimationFrame scroll scheduler with one GSAP ScrollTrigger.
- Retained cached scene geometry and native document scrolling, without adding smooth-scroll libraries or a global gesture interceptor.
- Coordinated next-page aperture, photograph scale, title movement, label opacity and color through one paused linear GSAP timeline.
- Preserved scroll-only Story â†’ Rooms navigation and reverse expansion before navigation commits.
- Kept desktop Story horizontal progression and mobile native vertical layouts.
- Added synchronization for native horizontal Story input, with protection against programmatic scroll feedback.
- Retained resize, content, image and font refresh handling and cleanup on unmount.

## 3. Main-photo grayscale-to-color

- Added explicit main-photo markers to selected Signature photographs in Story, Rooms/details, Culture/details, Dining/offers, Foundation/programs, Packages/details and Getting Here.
- Added reversible, linear grayscale-to-color interpolation driven by entrance progress.
- Centralized the established-photo threshold at 75% of viewport travel.
- Kept already established direct/restored heroes full color, preserving continuity with the expanded next-page photograph.
- Accounted for horizontal entrance in native photograph/offer/program strips.
- Excluded logos, maps, ornaments, supporting images, related-room thumbnails, Gallery thumbnails and its modal viewer.
- Terms contains no main photograph and therefore receives no photo effect.
- Removed the separate Culture grayscale controller.
- Corrected initial interpolation using a non-lazy GSAP numeric timeline and deterministic filter updates.
- Retained full-color reduced-motion behavior in code; actual OS reduced-motion testing remains pending.

## 4. Decorative title lines

- Hid Story title rules and the lines flanking the introductory date ornament without collapsing their layout boxes.
- Removed the visible Dining Offers heading border while preserving its spacing.
- Preserved functional timeline rules/markers, facilities dividers, table borders, link affordances and Dock indicators.
- Disabled snapping on the Story and room-photograph tracks.

## 5. Files changed by the polish

| Area | Files |
| --- | --- |
| Shared scroll and color logic | `src/components/signature/scroll-frame.ts`, `photo-progress.ts`, `scroll-polish.css`, `motion.tsx`, `next-scene.tsx` |
| Story | `src/components/signature/story.tsx`, `story-panels.tsx` |
| Signature photo markers | `src/components/signature/index.tsx`, `rooms.tsx`, `rooms-interactive.tsx`, `culture.tsx`, `dining.tsx`, `foundation.tsx`, `packages.tsx`, `location.tsx` |
| Removed competing color controller | `src/components/signature/culture-entrance.tsx` |
| Optional photo marker prop | `src/components/standard/photo.tsx` â€” default disabled; Standard visuals unchanged |
| Reports/checkpoint/evidence | `docs/m4-scroll-color-polish.md`, `docs/implementation-progress.md`, `docs/scroll-polish/` |

No dependencies, authentication model, content schemas, services, deployment settings or CMS editing interface were added by this polish. Video remains disabled.

## Validation completed

- 34 tests passed: the29 existing content/auth/isolation regressions plus5 menu/ logo lifecycle tests.
- TypeScript checks and final production build passed.
- Standard and Signature published-route HTTP regressions passed.
- Browser checks confirmed deterministic forward/reverse photo color, partial/reversed next-page expansion and scroll-only Story â†’ Rooms navigation.
- Back/Forward routes and mobile Story geometry were checked.
- At 360px and 390px widths, Story retained native vertical composition without horizontal overflow.
- Gallery viewer opening, keyboard next-photo navigation, Escape closing and scroll-lock cleanup were checked.
- Raw production observer recordings, trace-format exports, performance summaries and screenshots were saved in `docs/scroll-polish/`.

## Remaining gaps

- Earlier scroll-polish profiles contained roughly one-second frame gaps. The menu repair sample was better (median6.1ms/p956.2ms/max18.1ms;2above16.7ms;0longtasks), but controlled60Hz and compositor dropped frames remain **unverified**.
- The prior persistent-handle/native-modal defect is repaired; rapid reversal and Escape during opening now passed production browser checks. Owner visual judgment and cross-browser verification remain pending.
- Physical touch/momentum, OS reduced motion, Firefox/Safari and exhaustive interrupted history navigation remain unverified.
- Live Netlify Database/Blobs integration was not verified; checks used local published PostgreSQL fixtures.
- Owner visual acceptance remains pending. The previously recorded Packages Forward-after-new-scroll gap was not resolved by this polish.

## Review and evidence

- Local review URL: http://127.0.0.1:3112/
- Packages: http://127.0.0.1:3112/packages
- Startup: `npm run build`, then `npm run review:signature`.
- Detailed verification: [M4 scroll/color polish report](./m4-scroll-color-polish.md).
- Performance results: [Observer summary](./scroll-polish/performance-summary.json).
- Screenshots: [Story desktop](./scroll-polish/story-desktop.png), [Story mobile](./scroll-polish/story-mobile390.png), [partial handoff](./scroll-polish/handoff-partial.png), [reversed photo color](./scroll-polish/rooms-color-reversed.png).

## M5 CMS studio and unsaved preview — 11 October2026
Grouped navigation, compact selected-item editing, persistent save/publish status, resizable authenticated unsaved preview, mobile pane/viewport tabs, per-slot upload and safe archive Undo. Adapted owner-supplied useLayouts tabs/dropdown with existing Motion14 and retained Bencho notices.52 tests and production builds pass; both public HTTP suites pass. Browser results and limitations: [validation](m5-cms-ui-validation.md); [architecture/workflow](m5-cms-ui-live-preview.md). Existing owner snapshots preserved; no M6/deploy.

## 2026-10-11 — Signature menu CMS link
- Admin CMS beneath contact/social area, independent Navigation visibility toggle, native /admin auth flow after reversible menu exit, public hero transition bypass.
- Production/types and54 tests pass; both public HTTP suites pass. Browser signed-out/in, saved draft→preview→publish, hidden direct admin, keyboard and360/390px layouts verified in isolated dataset. OwnerDraft8/Live8 preserved; localhost3112 running.
- Details: [M5 Signature menu CMS link](m5-signature-menu-cms-link.md). Physical touch/new-tab/OSreduced-motion and liveNetlify checks remain unverified.

## 2026-10-11 — Get in Touch social icons
- Shared validated email/social row below Get in Touch; blank/disabled URLs produce no public icon.44px targets, safe external relationships and keyboard names; CMS link preserved.
- Identity → Social links editor with empty defaultURLfields, platformicons, enabled/order controls and existingcontactemailfallback. Owner-populatedvalues preserved; unsavedpreview/SaveDraft/Publish reuse existing scoped content.
- Production/types/56tests and both publicHTTPsuites pass. Browser empty/one/all/clear/disable/invalid/privatepreview/publication/restart/signedout/360px checks complete in isolateddataset. OwnercurrentlyDraft9/Live9 unchangedbyagent;3112 running.
- Details: [M5 social links](m5-social-links-get-in-touch.md). MissingreferencePNG/physicaltouch/nativeexternalapps/Netlifychecks remain unverified.

## 11 October 2026 — M5 navigation-panel logo shortcut

- Panel logo:300ms single-click Home, double-click/double-tap CMS, Shift+Enter CMS, ordinary Enter Home, accessible instructions and stable mobile target. Visible panel Admin CMS link removed; outside entries/authentication retained.
- Public Home reuses the exact handle GSAP timeline at normal speed. Actual CMS/login enters in a750ms right-to-left screen exchange; short reduced-motion fade and cancellation/lock cleanup included.
- CMS timestamps now deterministic UTC after a browser hydration mismatch was found. Legacy link-setting value retained and labeled explicitly. No owner content reset/save/publish.
-59 tests, TypeScript and initial production build pass; Standard/Signature HTTP regressions pass. Real browser signed-in/out, keyboard,360px, Back/reopen/Escape and transition-layer cleanup checked. Final rebuild verification is recorded in implementation-progress.md.
- Details/evidence/remaining physical-device checks: [Logo CMS shortcut](m5-logo-cms-shortcut.md).

## 12 October 2026 — M5 login split surface, slide and Bali clock

- Responsive split login with coral sun, published branding and expandable live WITA clock; real auth-driven slider with pointer/keyboard confirmation, cancellation and retry. Existing authentication, hosted OTP and public-menu CMS transition retained.
- Final build/TypeScript and63 tests pass. Browser verified partial/full pointer drag, keyboard/field Enter, validation/retry/login/logout, clock and360/390px layouts. OwnerDraft9/Live9 preserved.
- Local review: http://localhost:3112/admin/login (`npm run demo:local`). [Changes, evidence and explicit remaining device/hosted checks](m5-login-slide-island.md). No live Netlify/M6 verification.

## 13 October 2026 — Windows offline launcher
- Added Start-Villa-Demo.bat; starts actual existing PostgreSQL/Next runner, waits for private readiness and opens default browser. Reuses only verified same-project server; rejects occupied ports without killing processes.
- Hardened runner startup/lock/owned-child cleanup; Enter and authenticated --stop preserve database/uploads. Normal startup has no npm install/build/download/cloud-credential requirement.
- Setup/results: docs/windows-offline-launcher.md and windows-offline-launcher-checks.json. Windows BAT/duplicate/conflict/stop/restart,70tests,TypeScript,productionbuild and outbound-blocked CMS/media persistence suite passed. Physical browser network-off remains unverified. Owner9/9 preserved, review http://localhost:3112/.
