# M4 Signature Dining rebuild — 7 October 2026

The supplied Dining rebuild is implemented in the existing project. Visual acceptance belongs to the owner. Story, Rooms, Culture, Dock navigation, Standard, authentication and published-site isolation remain in place; no video, hosted service, deployment or M5 editor was added.

## Reference and implementation

The complete36.566633s recording was played sequentially;13 chronological frames were inspected. [Timestamped panel map](reference-dining/panel-map.md) and live source measurements preceded review. The recording is2556×1400; final comparison uses1278×700, exactly half that pixel size. Live measurements were also taken at1280×720 and converted through1440 design-width units. A recording's pixel dimensions alone do not prove its CSS viewport/DPR; the half-scale comparison is disclosed rather than called exact device parity.

The new Signature Dining page renders its illustrated hero, centered introduction, three asymmetric categories and staggered four-offer strip. Desktop offers use direct mouse drag/native horizontal scrolling and a thin centered indicator; keyboard arrows work on the focused track. Mobile stacks them vertically, matching the inspected source responsive rules. The strip is not the Bencho carousel.

View Menu opens `/restaurant-menu` with category fragments. The red document page renders all categories sequentially, preserving actual image ratios and complete page order:3 Breakfast,4 All Day Dining,12 Drinks desktop pages;5/6/13 genuine mobile page variants. Native fragments provide category history and scroll; an observer updates the active category. Documents load lazily, with stable aspect-ratio boxes. No fake PDF state or cropped single-page replacement is used. The new optional schema holds stable category/offer/page IDs, ordering, enabled categories/offers, descriptions, photographs/focal coordinates, reservation destinations, menu pages/mobile variants and download references. Duplicate IDs and invalid sources/destinations are rejected. It remains compatible with existing JSON snapshots; no SQL table migration is necessary. The idempotent reference seed command and local fixture publish the separate dataset; public components never import the seed or read drafts.

Dining→Cultures next-image handoff uses the existing published destination accessor and transition machinery. The destination is confirmed live; this recording does not demonstrate the full terminal expansion. Menus reuse M1 login/navigation infrastructure, not a new authentication flow.

## Validation and measured evidence

The corrected introduction at1280×720 has x395.55,width488.89,top837.33; supporting body top898.65,height128 matches the source. Final intro total265.53 versus264.86 source differs by0.67px from the underline/button box. Menu photograph x320.45,width654.22 matches source. Comparison corrected the initial oversized intro text and inherited90px menu-anchor scroll padding.

Build/type checks pass. All22 tests passed; focused content tests passed after mobile schema changes. Standard and Signature production HTTP suites passed; Signature was repeated after mobile/indicator changes. Tests cover all configured menu pages, disabled Dining, missing menus, empty/single offers, canonical routes, unknown routes, drafts/site isolation, and existing auth/content regressions. Final CSS-only anchor correction has a subsequent production build.

Browser checks: actual updated published dataset; View Menu links; Breakfast→All Day category switch; ordered document scrolling; offers mouse drag from0→366px and keyboardLeft; completed navigation menu/Escape; Dining→Cultures scroll-only handoff and Back; mobile360/390px document width equals viewport and genuine mobile assets load. Booking/reservation hrefs are the published demo placeholders; no reservation was transmitted. Physical touch momentum/safe areas and OS reduced-motion testing remain unverified. System reduced-motion branches and native scrolling are preserved.

## Profiling limits

[Actual production observer summary](reference-dining/performance-summary.json), [raw observations](reference-dining/performance.json) and [trace container](reference-dining/performance.trace.json): Windows, display165Hz,1280×720;44.63s including inspection/tool pauses,7361 callback intervals,median/p956.1ms,max12.2ms,zero above16.7ms,zero long tasks/long-animation-frame entries. Only2 moving callbacks were observed: this is a limited document/menu sample, not sustained-scroll60fps proof. It precedes the final mobile/indicator/anchor adjustments. There is no controlled60Hz or native compositor/GPU attribution, and no physical dropped-frame claim. Native scroll events update only a transform using cached strip geometry; no React state updates, repeated layout reads or duplicate animation loops occur per frame.

## Remaining differences and review

- Source download is a generated button without an actual configured file URL. Download is supported when a valid reference is published; the demo hides it. No fabricated PDF/download file is supplied.
- Rail details, offer inertia/easing, document rasterization, italic words within offer copy and dietary icons differ from the reference. The text and photographs are genuine reference content, but not every motion detail is asserted identical.
- Mobile uses the source's genuine page assets/responsive layout, but the supplied desktop clip does not establish exact mobile fidelity. Physical touch and controlled60Hz verification remain gaps.
- Dining Gallery routes to the existing gallery; its prior category behavior is preserved and has not been rebuilt in this scope.
- Live Netlify Database/Blobs remains unverified without hosted credentials. Reference media/font redistribution rights are unverified; replace comparison content with licensed villa material before commercial delivery.

Review http://127.0.0.1:3112/dining; menus `/restaurant-menu#breakfast`, `/restaurant-menu#all-day-dining`, `/restaurant-menu#drinks`. Restart `npm run build`, then `npm run review:signature`. This is a local published PostgreSQL fixture on the owner's Windows machine, not a Netlify verification. No M5 work started.

## Numbered comparisons

[01 Hero0s](reference-dining/comparison-01.png), [02 Categories6s](reference-dining/comparison-02.png), [03 All Day menu33s](reference-dining/comparison-03.png) show reference left/local right at the disclosed half-scale1278×700 comparison. Category capture has a nearby rather than identical scroll offset. Mobile loading evidence is [390px](reference-dining/after-mobile.png). Source map/contact sheets remain available for all36.57s. Comparisons reveal remaining image crop/parallax, hero shade, rail/notes and minor vertical-offset differences; these are not presented as accepted matches. Menu route entry now resolves its initial hash once the existing transition releases, and the subtitle/hero width-unit inheritance problems found during browser comparison have been corrected.
