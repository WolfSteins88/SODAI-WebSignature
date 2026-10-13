# M4 — Culinary layout update

Implemented 9 October 2026; owner visual acceptance pending. Scope stays within M4.

## Changes

- Signature's legacy Dining page label now renders as Culinary in the hero, navigation, next-page preview, metadata and menu-document back link. `/dining`, stable category IDs and `/restaurant-menu` anchors remain unchanged. Custom published titles and Standard labels are preserved.
- Categories use shared two-column grid rows, equal 16:9 image frames and consistent gutters. Later rows follow the tallest preceding card naturally; the odd final card stays at one column's width and is centered.
- Titles and View Menu share a row on wide screens. Actions move below the description at narrower widths. Body copy is 20–22px desktop / 18px mobile, actions 16–18px with a minimum 44px height and existing keyboard outlines.
- Mobile uses one column in published order. Empty or fully disabled collections omit the category section. Intro, offers, named categories, menu pages and existing actions are retained.
- Existing resize/image/font measurement refresh is reused; no new animation controller or per-frame React work was added.

## Validation

- Production build and TypeScript check passed; 40 tests passed.
- Standard and Signature production HTTP suites passed, including deep links, site/draft isolation, disabled modules, booking context and indexing metadata.
- Local HTTP checks confirmed `/dining` 200 with Culinary title/hero/canonical, `/culinary` 404, and `/restaurant-menu` 200 with Breakfast, All Day Dining and Drinks anchors plus Back to Culinary.
- QA published fixtures: zero, all-disabled, single, two, reversed order and long descriptions rendered successfully; intro/offers remained. Default three-category content restored.
- No download links are configured in the current reference fixture; their rendering logic was preserved, but download behavior was not exercised.

## Remaining verification

Browser automation rejected the attempt to bind the local review tab under its URL security policy. No alternate browser or automation workaround was used. Consequently this revision has **no new browser screenshots or measured desktop/mobile bounds**, and visual alignment, overflow, keyboard interaction and transition choreography remain unverified in the browser. Build and HTTP checks do not establish visual fidelity.

The supplied 121733 screenshot shows the earlier staggered composition. The brief names 143610, which was not supplied. Owner should compare the updated page against the requested symmetry, rather than interpret the supplied stagger as the target.

## Local review

- URL: http://127.0.0.1:3112/dining
- Menu documents: http://127.0.0.1:3112/restaurant-menu#breakfast
- Startup from the project root: `npm run build`, then `npm run review:signature`.
- Current review process: 73746, port 3112. Local published PostgreSQL-compatible fixture through Drizzle; live Netlify integration was not tested. This is the owner's localhost, not a remote preview.

Modified: Signature dining renderer/styles/interactions, navigation and next-page target; public-route labels; new `src/lib/content/signature-labels.ts`; isolated reference seed; QA fixture and content tests. Standard, authentication and other public compositions were not rebuilt. No M5 or deployment.

Next action: inspect the review page in an available browser at desktop 1440px and mobile 390px/360px, capture paired/odd rows, verify keyboard/action destinations and transition labels, then correct any observed differences without repeating completed implementation.
