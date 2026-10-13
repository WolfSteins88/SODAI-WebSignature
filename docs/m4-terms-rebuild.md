# M4 Terms & Conditions rebuild — 8 October 2026

Implemented canonical `/terms` as a cream editorial text page: genuine local TS Caslon/TS Helvetica fonts, centered title, retained left index, separate narrow reading column, complete ten-section comparison copy, red headings and measured paragraph/section gaps. No photographic hero/cards/accordion/video. Existing rail, booking and menu/Dock remain. Customer settings still decide which booking actions exist.

## Content and scope

Optional `signatureTerms` JSON adds enabled/title/description and ordered sections with unique stable IDs, enabled flags, titles and constrained paragraph/list bodies. React renders escaped text; arbitrary HTML/JS block types fail validation. `compactIntroduction` preserves the source Pricing heading gap. Both index and articles use the same enabled collection. Signature disabled/empty routes return404 and disappear from menu/sitemap; canonical metadata uses the structured title/description. Standard and old snapshots retain the original terms string. This additive optional JSON contract requires no SQL migration, and does not rewrite existing snapshots. Separate explicit reference seed contains complete source policy text for comparison only, not a customer-policy default. Existing idempotent seeding/published accessor remains unchanged. No M5 or hosted service changes.

## Evidence and geometry

Full16.8666s supplied recording inspected sequentially before implementation. Timestamped frames0/4/8/12/16.7 and pre-code map: `reference-terms/panel-map.md`; complete live DOM measurements/text: `reference-terms/source.json`. Source at1279×700 CSS; original recording CSS/DPR unknown, so normalized recording comparisons are not an exact device-scale assertion.

Final measured opener at1279×700: title y90.771/h56.844 (source90.781/56.844); first index x155.396/y211.615 (source155.396/211.615); reading x418.448/y209.938/w442.427 (source418.448/209.948/442.427). Later headings differ by at most~0.313px across the full collection. Line breaks match measured live text. All three comparison images inspected. Initial evidence caught a stale route snapshot on hash history; scoped Terms-only history handling now avoids starting the route overlay for same-page Back/Forward, preserving cross-page choreography.

- `reference-terms/01-opener-comparison.png`: supplied0s against updated production.
- `reference-terms/02-guaranteed-comparison.png`: matched live1279×700 anchor (recording around8s shows a different scroll position).
- `reference-terms/03-children-comparison.png`: supplied16.7s against final anchor.
- `reference-terms/mobile-390.png`, `mobile-360-long.png`: native-flow mobile adaptation, not claimed source-mobile fidelity.

No pre-rebuild screenshot was captured; these are source-versus-updated comparisons, not fabricated before/after evidence.

## Validation

27tests passed, including authentication/login/logout/rate-limit/revocation/site-environment/draft isolation, backward-compatible content, duplicate Terms IDs, rejected HTML block type, enabled/empty availability and retained order. Production builds93952/90015/final81616 passed with TypeScript. Standard HTTP and Signature HTTP passed; Signature repeated against final build, including published updates, deep links, metadata/robots/sitemap, escaped script-like text, single-section rendering, empty404/menu/sitemap omission.

Real browser: desktop1279×700 geometry; native scroll/reverse and active retained index; short Pricing and final Children anchors; keyboard Enter/focus; section Back/Forward and hashless Back to0 with overlay hidden; direct Guaranteed URL/reload; repeated menu open/Escape unlock. Single final section, reverse order, empty404, disabled404/menu/sitemap exclusion verified; default ten sections restored.360long content and390default show no horizontal overflow; compact native section selector lands heading at~100px below the mobile header. No public video elements.

Reduced-motion anchor navigation explicitly uses immediate scroll; actual OS reduced-motion mode, native touch momentum and controlled slow-media conditions were unavailable and are not claimed tested. No images need loading in the Terms article itself.

## Remaining differences and review

Geometry is closely measured, but recording resampling/text antialiasing and source DPR are unknown. Accessible keyboard heading focus is intentionally visible. Current booking destinations remain example.com; WhatsApp rail action is omitted where published booking mode makes it unavailable. Mobile navigation is a readable compact adaptation, with no mobile Terms recording supplied. Animation timing acceptance belongs to the owner; no visual acceptance is asserted.

Prior shared Packages Forward-after-new-scroll restoration gap remains outside this Terms fix. Live Netlify credentials are unavailable; tests use isolated local PostgreSQL/Drizzle and do not establish hosted Netlify integration. Reference commercial asset/content rights remain a handoff consideration.

Review: http://127.0.0.1:3112/terms and http://127.0.0.1:3112/terms#guaranteed-reservations. Startup: `npm run build`, then `npm run review:signature`. Local isolated comparison only; no customer drafts overwritten. Stop before M5.

## Actual production performance observation

Final build81616, WindowsChrome155,1279×700 CSS, DPR~1. Local performance observer captured64.12s with10559rAF intervals and243callbacks where scroll position changed; native scroll/reverse, smooth section anchors, hash Back/Forward and repeated menu open/Escape were exercised. Median6.1ms, p956.2ms, max12.1ms;0intervalsabove16.7ms,0observedlongtasks/long-animation-frames. Raw `reference-terms/performance-observer-final.json` and summary saved. Earlier42.24s sample before history correction had1intervalabove16.7ms/max18.1 and0longtasks, retained separately.

Actual display cadence was~165Hz, not controlled60Hz. These are rAF/PerformanceObserver timings, not compositor/GPU dropped-frame counts, forced-layout traces or decode/paint measurements. The sample includes idle periods and does not prove sustained native touch momentum or universal60fps. No per-scroll DOM measurements or React frame loop were added; headings are cached on content/size/font changes and active state changes only on section changes. Terms has no article media to decode. Final section's bounded18px anchor offset is not identical to the normalized recording end-scroll position; visible keyboard focus is intentional.
