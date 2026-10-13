# M4 — Signature interaction verification

**Superseded implementation:** the user rejected this initial M4 attempt. The scroll-only fidelity revision and current browser evidence are recorded in [m4-fidelity-revision.md](m4-fidelity-revision.md). The timing and public-control descriptions below describe the earlier attempt, not the current implementation.

Implemented on 2026-10-06 using PRD v1.3, the M0 reference inventory/contact sheets and M3 layout. This phase preserves M1 authentication, site-scoped published reads and the separate M2 Standard renderer. No new dependencies, schema changes or external services. M3’s verification describes the prior static baseline.

## Reference mapping and deliberate adjustments

| Reference sequence | M4 behavior |
| --- | --- |
| Desktop story, 0–25 seconds | Wheel input progresses the existing horizontal panels; native horizontal scrolling remains available. Previous/next and focused-region arrows/Home/End work. At track boundaries vertical page scrolling resumes. Long text consumes its own vertical scrolling before progression. |
| Red menu, desktop 80–95 seconds; mobile 70–80 seconds | GSAP reveals the red dialog from the right. Existing modal semantics, Tab containment, Escape and trigger focus restoration remain. Mobile menu remains vertically scrollable. Closing and changing routes interrupt/clean up animation. |
| Other-room strip, desktop 120–155 seconds; mobile 30–44 seconds | Nearest centered card controls the highlighted photograph and announced title/count. Buttons and arrows/Home/End center selection. Mouse drag suppresses accidental room activation; native image dragging is prevented. Touch keeps native horizontal scrolling and page vertical movement. Current room is excluded. No related rooms omits the strip; one related room disables both controls. |
| Next-page / other-room image grows to hero | Internal image links expand the actual published photograph using transforms. An inert, aria-hidden snapshot preserves the outgoing viewport across App Router navigation, then fades over the loaded destination. A live status announces navigation; destination heading receives focus without scrolling. Back/Forward use snapshot continuity. External/admin links retain normal routing. |
| Mobile reservation appears in opener/other-room zones and disappears over story text | Intersection observation follows hero, other-room and next-page sections. The fixed bar remains visible while focused and hides during the menu. Desktop retains top-right reservation. Unavailable actions continue to be omitted by published booking settings. |

The recordings establish sequence and composition, but do not establish exact wheel deltas or animation durations. Chosen durations: menu reveal 0.60 s, close 0.25 s, image expansion 0.55 s, destination crossfade 0.22 s, story controls 0.50 s and room centering 0.45 s. These are responsive/accessibility adjustments, not claims of identical measured timing. No autoplay or circular Signature carousel was introduced.

## Resilience and accessibility

System `prefers-reduced-motion` changes are subscribed to and also supported by pre-hydration CSS. The footer Reduce motion button gives a directly testable override: story becomes vertical, expansion/fade/menu animation stops and room controls move immediately. The override survives client routes/history and resets on reload. Native links and readable server content remain available without animation.

Visual snapshots contain existing rendered public content only, remove duplicate IDs and cannot receive interaction or accessibility focus. Destination images are checked for completion and observed for load/error. Enhancement times out after 3.5 seconds; a 4-second safety cleanup also prevents retained overlays from blocking an error/loading state indefinitely. Resizing and preference changes cancel transitions. GSAP tweens, observers, media listeners, events, timers and animation frames are cleaned up on cancellation/unmount. No secrets or draft data are added to browser code.

## Checks completed

- Production build and TypeScript check passed with pinned Next 16.3.8 and GSAP 3.15.0.
- `npm test`: 15 passed, including existing Auth.js login/logout, both roles, JWT revocation, CSRF, persistent scoped content/rate limits and site/environment isolation.
- `npm run test:signature`: passed public deep links, reloadable routes, story redirect, designed unknown-slug/disabled-route 404s, publication updates, draft/foreign-site isolation, published booking context, disabled modules/Admin link, metadata/sitemap/robots, unpublished-media rejection, empty/single galleries and zero/single related rooms.
- `npm run test:standard` and `npm run test:http`: passed existing Standard and protected-admin regressions after moving the Signature motion boundary into the persistent root layout. Standard does not mount this boundary.
- Browser checked desktop story wheel movement, previous/next, Home/End and room-strip buttons/keyboard. Vertical page scrolling resumes after the last panel. Mouse drag advances the room strip without activating a link. First/last room centering is verified at desktop/mobile widths. [Desktop room navigation evidence](m4-desktop-room.jpg).
- Browser checked animated menu, interrupted Escape close, restored opener focus and cleared body scroll lock; menu-to-room navigation and direct room reload work.
- Reduced-motion button produces the static vertical story, survives client route changes and Back/Forward, and leaves no expanding-image overlay. Route completion focuses the destination heading. Mobile reservation hides over room body content and reappears at other-room selection; desktop reservation stays visible over story.
- Responsive checks across home, room detail and gallery at 360, 768, 1024 and 1280 widths show no document horizontal overflow. Mobile behavior also checked at 390 × 844.
- Missing hero image shows the existing meaningful media fallback and navigation completes. One related room disables both strip buttons; zero related rooms omits the strip.
- A development-only HTTP proxy delayed real RSC responses by 1.5 seconds: the source viewport/image remained present during loading and cleared after destination readiness. Evidence: [transition screenshot](m4-transition.jpg) and [mobile room selection](m4-mobile-room.jpg). This exercises real pg/Drizzle published fixture reads; it does not simulate Netlify services.

## Remaining limitations and boundaries

No authenticated linked Netlify project, Database branch connection or Blobs runtime context is available. Live adapter/database/image integrations remain unverified; local PostgreSQL fixtures are not hosted verification. Physical touch devices and toggling the OS reduced-motion setting were not exercised; the directly exposed reduced-motion override was tested and system handling reviewed. Exact recording input/timing fidelity remains approximate as described above.

Previously recorded M1 gaps remain separate: the newer PRD’s TOTP challenge/replay/Bencho login controls and `scripts/setup.ts` top-level-await compatibility under the current CommonJS tsx CLI. M4 does not change accounts/authentication or repair the migration/seed CLI. The local harness successfully applies the checked-in migration.

Stop at M4. M5 owns the editor/CMS controls. M6 owns hosted deployment and source ZIP validation. Nothing has been deployed or packaged in this phase.

## Reproduce locally

Run `npm run build`, then `npm run review:signature`; open http://localhost:3112. The terminal accepts `default`, `long`, `empty`, `single`, `missing-media`, `disabled`, `one-room` and `two-rooms`, publishing validated fictional QA content into an isolated persistent local database. Reload after changing a case. Stop with Ctrl+C. Data remains under gitignored `test-results/signature`.

For delayed route readiness, run `npm run review:signature:slow` separately and open http://localhost:3114. It uses a separate fixture/namespace and delays RSC responses only; no application feature flags, backend substitutions or hosted configuration changes are required. Stop with Ctrl+C.
