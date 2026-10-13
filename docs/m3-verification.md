# M3 — Signature layout verification

Completed 6 October 2026. Scope follows PRD v1.3 M3: desktop/mobile visual structure before complex motion. M0 reference deliverables, M1 authentication and M2 Standard component sources remain unchanged. Signature now has its own server renderer and scoped stylesheet instead of the earlier shared public experiment.

## Reference comparison

Compared the M0 inventory and desktop contact sheets (0–45 s, 80–155 s), mobile contact sheet (0–40 s), and saved M3 screenshots. Recording dimensions include browser UI; these comparisons establish the composition, not exact CSS measurements or pixel-perfect fidelity.

| Reference                       | M3 implementation                                                                                                               | Evidence / deliberate differences                                                                                                                                                                                          |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Desktop story opener, 0 s       | Large media, fixed 50px taupe rail, lower centered serif title, top-right reservation                                           | m3-desktop.jpg. Published fictional Sodai content/images replace reference branding and assets.                                                                                                                            |
| Desktop story, 5–25 s           | Horizontal cream panels, portrait image/caption, editorial text, alternating image/text placement                               | m3-story.jpg. Native scrolling and anchor links are the M3 baseline; wheel mapping and measured progression are M4. Current content schema supplies two editorial panels; exact reference section count is not reproduced. |
| Rooms, 35–45 / 95–105 s         | Grayscale opener, two-column introductory composition and staggered image/text cards                                            | m3-rooms.jpg. Dynamic card count and text; spacing adapts to available content.                                                                                                                                            |
| Detail / other rooms, 105–155 s | Vertical asymmetric introduction, capacity/area, inclusions/facilities, large media, native horizontal grayscale portrait strip | m3-room-detail.jpg. Centered active-item selection and expanding image transitions are M4. No circular Bencho carousel in Signature.                                                                                       |
| Red menu, 80–90 / 160 s         | Red dialog with roughly one-third image and serif navigation/contact column                                                     | m3-menu.jpg. Basic open/close, keyboard containment and route links work; artistic reveal/route transitions are M4.                                                                                                        |
| Mobile, 0–14 / 24–40 / 70–80 s  | 64px taupe header, single-column story/list/detail, horizontal other-room strip, full red menu with scrollable room sublinks    | m3-mobile.jpg and m3-mobile-menu.jpg. No Safari/status-bar imitation. Booking occupies the opener’s bottom area; observed dynamic visibility is M4.                                                                        |

Approximate M0 colors retained: cream #eeeadd, taupe #91836d and red #9c1922. Georgia/system fonts remain intentional licensed-asset substitutions. Small taupe labels and mobile brand use darker text for contrast; red-menu copy inherits cream. Hero titles stay compact; long names wrap without widening pages. The generic geometric Sodai mark is original UI, not a copied reference logo.

## Implemented pages and data

Home/story entry, rooms and details, gallery, location, enabled dining, experiences/details, packages/details and terms. Gallery reuses the already accessible M2 filter/lightbox and image-error handling; its Signature presentation is scoped to cream/red. No new animation library or dependencies.

All public reads still use M1’s request-local, site-scoped published accessor. No hardcoded backend substitution or draft fallback was added. Disabled/empty optional modules disappear from menus, next-page choices and sitemap and return 404. Missing slugs return the designed 404. Signature `/story` redirects to `/`; there is one canonical story entry. Booking and dining destinations use published settings; footer Admin reuses `/admin/login`. Private preview uses the existing authorized path and renderer.

## Validation

- `npm test`: 15 passed, including existing Auth.js login/logout, roles, CSRF/JWT/revocation, persistent database/limits and isolation.
- `npm run typecheck`: passed.
- `npm run build`: final production build passed. A stale Windows Turbopack worker cache initially failed; clearing the disposable `.next` directory resolved it. No package/version change needed.
- `npm run test:signature`: passed all public deep links, `/story` redirect, layout markers, designed 404s, publication updates, draft/foreign-site isolation, booking context, disabled modules/Admin link, metadata/sitemap/robots, unpublished-media rejection and empty/single galleries through pg + Drizzle.
- `npm run test:standard` and `npm run test:http`: passed Standard and protected-admin HTTP regressions.
- Browser: 45 final layout checks across nine routes at 360, 390, 768, 1024 and 1280 widths; no document horizontal overflow. An initial narrow gallery overflow was fixed without changing Standard components.
- Browser: mobile menu open/close/Escape, reverse Tab containment and exact opener focus restoration; menu-to-room navigation, direct room reload and Back/Forward passed. Desktop story links advance the native track. Long names fit the header/menu; long story text remains fully available in a keyboard-focusable scrolling region.
- Screenshots saved in this directory for desktop opener/story/menu/list/detail and mobile opener/menu. Physical devices, OS reduced-motion toggles and animation timing were not verified in M3. Reduced-motion CSS remains present and no complex motion runs in this renderer.

## Boundaries and remaining work

M4: measured menu reveals, input-to-horizontal story mapping, active room-strip behavior, image expansion, route/media continuity and observed reservation visibility. M5: CMS controls/editor. M6: hosted deployment, Netlify adapter/Database/Blobs integration and final ZIP verification. Live Netlify credentials/configuration remain unavailable to this local verification; local PostgreSQL fixtures do not prove hosted services.

Previously recorded M1 gaps remain separate: newer PRD TOTP/challenge/replay/login controls and the migration/seed script’s CommonJS top-level-await compatibility. M3 did not alter authentication or repair those CLI operations.

## Local review

After `npm run build`, run `npm run review:signature` and open http://localhost:3112. This explicitly creates a persistent local PostgreSQL test publication in the Signature fixture scope; production continues to require Netlify configuration. Type `long`, `empty`, `single`, `missing-media`, `disabled` or `default` in the review terminal and reload for QA variants. Stop with Ctrl+C. Test data is gitignored. `npm run test:signature` runs the corresponding production HTTP suite.
