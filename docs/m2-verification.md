# M2 Standard verification — 2026-10-05

M2 is complete in source. M0 reference specifications and frames, M1 fixed-account Credentials/JWT authentication, and Signature component sources are preserved. No CMS editor, Signature redesign, hosted deployment or ZIP packaging was performed.

## Implementation

- Separate Standard renderer and styles: warm cream/olive, responsive desktop navigation and compact mobile dialog; home, story, rooms/details, gallery, location, enabled dining, experiences/details, packages/details and terms.
- Every public page, route availability decision, metadata and sitemap reads the scoped published database snapshot. Removed the former demo-content fallback. The public query selects only the published column; React cache deduplicates within a request, not across publications. Public request parameters cannot choose a site or draft.
- Booking destinations come from published settings; WhatsApp text encodes villa/room context, external URLs preserve the configured destination, unavailable actions disappear. Optional routes, sections, navigation and sitemap entries share one availability function. Footer Admin visibility follows published settings and links to M1 login.
- Bencho Carousel ring geometry and Image Accordion Gaussian flex falloff adapted to real published photographs, with bounded secondary previews, responsive sizing, pointer swipes, keyboard controls, reduced-motion/static presentation and empty/single safeguards. No autoplay or perpetual animation. MIT notice in THIRD_PARTY_NOTICES.md.
- Gallery category filters and native modal lightbox provide previous/next, pointer swipes, arrow keys, Escape, explicit Tab containment and opener focus restoration. Navigation dialog uses the same focus containment.
- Next Image sizes, hero preloading, lazy lower images, alt text and accessible image-failure placeholders. Public Blobs delivery checks the current publication, ready media, scope and namespace before reading bytes. Invalid/unpublished media returns uncached 404.
- Canonical/Open Graph/Twitter metadata, enabled-route sitemap, private-route robots exclusions, loading/error/404 designs. Layout preflight resolves unknown/disabled routes before streaming, preserving HTTP 404.

## Completed checks

- `npm run typecheck`: passed.
- `npm test`: 15 passed, 0 failed. Retained M1 tests cover real Auth.js login/logout, both roles, invalid credentials/CSRF, secure JWT/revocation, persistent limits, database persistence and site/environment/deploy isolation. Added Standard route/booking tests.
- `npm run build`: production compilation, TypeScript and route generation passed after final interaction fixes.
- `npm run test:http`: passed production login page, protected redirects, unauthorized GET/POST rejection, cache/provider/origin policies and removed account/editor routes. Harness now supplies a real local publication instead of relying on the removed fallback.
- `npm run test:standard`: passed all public deep links, designed HTTP 404s, publication changes, draft/foreign-site isolation, room WhatsApp context, disabled modules/Admin link, sitemap/robots and empty/single galleries. Invalid and unreferenced public media rejected before Blobs access. Production app uses pg + Drizzle against persistent PGlite through its PostgreSQL socket.
- Browser review: home, rooms, room detail, gallery and location checked at 360, 390, 768, 1280 and 1440 widths. Tablet accordion caption overflow found and fixed; final tablet scroll width equals client width. Desktop/mobile screenshots: m2-desktop.jpg and m2-mobile.jpg.
- Browser room listing/detail navigation, direct reload, Back/Forward passed. Mobile menu open/close/Escape, exact trigger focus restoration and Tab/Shift+Tab cycle passed.
- Browser gallery Nature filter, lightbox arrows, Escape, exact opener focus restoration and Tab/Shift+Tab cycle passed. Gallery and carousel horizontal pointer drags advance the current photograph. Carousel buttons/arrows, accordion arrow focus/selection passed.
- Still view verified: only current carousel card visible, transition duration 0s; system preference hook and global reduced-motion CSS reviewed. Browser API does not provide OS reduced-motion emulation. Physical touch hardware and OS preference changes were not exercised; shared pointer handlers and static presentation were exercised.
- Explicit local QA publications for missing hero media, empty gallery and single gallery passed in the browser; missing image retains alt/context and booking/navigation, empty gallery shows a message, single-photo navigation is disabled.

## Remaining blockers and prior-phase gaps

Netlify CLI previously reports **Not logged in**. No authenticated linked project, Netlify Database connection/branch or Blobs runtime context is available. Local tests do not verify hosted Database, Blobs image delivery, Netlify routing/adapter or hosted booking destinations. Those live checks remain blocked; deployment/packaging verification is M6. Seed booking URLs are illustrative, not live commercial destinations.

PRD v1.3 introduces TOTP login/challenge and replay protection plus Bencho login controls. Existing M1 has password-only Credentials; M2 deliberately preserves that authentication. Those are separate M1 gaps. Existing scripts/setup.ts has top-level await under CommonJS tsx and needs an M1 CLI compatibility repair; the checked-in migration itself is verified by the local harness.

Remaining Bencho CMS configuration controls are M5, not M2. Signature is M3/M4. The local review harness is dev-only and never replaces production backend reads. Run npm run review:standard after a build; stop its local process with Ctrl+C.
