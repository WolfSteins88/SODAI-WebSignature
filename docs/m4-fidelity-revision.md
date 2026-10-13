# M4 Signature fidelity revision — 6 October 2026

This revision supersedes the rejected initial M4 attempt. Source requirements: PRD v1.3, M0 inventory, desktop/mobile reference recordings, and the supplied 25.2-second recording of the implementation. Latest user direction controls: Tandjung Sari choreography on Signature, Bencho variations on Standard/admin, no M5 work.

## Evidence inspected

- Desktop reference: `D:/FFOutput/Recording 2026-10-05 122506.mp4`, 310.03 s. M0 consecutive contact sheets supplemented with half-second frames at 24–36 s and 80–95 s.
- Mobile reference: `C:/Users/Dio/Downloads/ScreenRecording_10-05-2026 13-23-50_1.mp4`, 88.40 s. Half-second frames at 12–24 s and 70–80 s.
- Rejected demo: `C:/Users/Dio/Downloads/Recording 2026-10-06 101135.mp4`, 25.20 s, sampled consecutively every 3 s. At 9–12 s it leaves the horizontal story for a vertically separate card; 18–24 s shows the footer interrupting continuation.
- [Before recording contact sheet](m4-revision/before-sequence-sheet0.jpg), [desktop reference transition](m4-revision/desktop-transition-sheet1.jpg), [desktop reference menu](m4-revision/desktop-menu-sheet1.jpg), [mobile reference transition](m4-revision/mobile-transition-sheet0.jpg), [mobile reference menu](m4-revision/mobile-menu-sheet0.jpg).

These are recording-space observations, not original source CSS. The half-second intervals bound visible events; they do not reveal wheel deltas or exact easing curves.

## Corrections and comparisons

| Reference | Revised implementation / verification |
| --- | --- |
| Desktop 24–30.5 s: story continues horizontally into a full taupe field; portrait image centered, small next-page label and keep-scroll prompt | Story now uses native vertical page distance to carry the desktop horizontal track into its last taupe panel, with no button row. Mobile remains vertical. Label centered; initial aperture about 19% of available width and 46% of scene height on desktop, 47% width on mobile. [Card evidence](m4-revision/after-card.jpg). |
| Desktop 30.5–32 s, mobile 15.5–17 s: portrait grows into full opener; title settles at lower center | Scroll-linked aperture expansion with uniform image scaling, not independent X/Y stretching. Source uses the actual published destination hero image and its grayscale treatment. The full expanded image remains while the destination mounts/decodes. Navigation commits once at completion with `scroll:false`; scroll placement resets underneath the retained image, then hands off to one destination hero at its opener. No empty color fade or second visible hero. |
| Continued scroll leads into the next page, without a card click | Browser native wheel gestures passed `/` → `/rooms` → `/dining` consecutively. No clicking or script-triggered navigation was used. [Recorded browser frame sequence](m4-revision/after-sequence-sheet.jpg), [raw route/scroll observations](m4-revision/after-sequence.json), [second destination](m4-revision/after-destination.jpg). |
| Desktop 86.5–88 s: red expands from the left; image establishes its vertical field, navigation reveals in stages | Changed right-to-left whole-panel slide to a left-origin aperture wipe, with image translation/uniform scale and staggered text. Desktop image occupies 32% of panel width; primary links, room sublinks, secondary links and contact are grouped separately. Mobile keeps the full red scrollable layout. [Menu evidence](m4-revision/after-menu.jpg). |
| Desktop 90.5–91.5 s menu departure; reference shows cream loading blankness | Exit now retracts along the same left-origin path. Selection waits for exit before committing the route, then retained content reveals the loaded destination with a wipe. Reference blankness is deliberately removed. No fake loading delay. |
| No public motion buttons or story/strip button rows in reference | Removed the visible Reduce motion button and story/strip controls. Native links, menu, focused-region arrows/Home/End and normal room-strip scrolling remain. System reduced motion still supplies vertical story, static media/menu and direct controls. |

The initial aperture values are responsive translations of the reference proportions. Scroll expansion uses 1.35 scene-heights of input distance, so its elapsed duration belongs to the visitor. Menu reveal is 0.95 s, image settling 1.1 s, staggered links begin at 0.4 s; exit retracts over 0.65 s after a short text departure. These approximate the visible event windows and direction; exact curves/durations are not established by sampled footage.

## Interaction and failure handling

Published destination RSC is prefetched before the scene, and the destination photograph is eagerly decoded as it approaches. No JSON content substitute, draft accessor or browser-side site selector was added. Destination changes can still reject stale/disabled routes normally. Preview never auto-advances or warms public content.

The expansion reverses with scroll until commit. A gesture quiet-period guard consumes residual wheel/touch movement during commit, releases after idle and has a hard 4.5-second safety bound. It does not intercept ordinary scrolling outside the handoff. History restoration and reload do not auto-advance until a fresh gesture. Footer keyboard focus suppresses automatic navigation so its Admin/contact/direct links remain accessible.

The inert snapshot holds the meaningful image while the destination image is loading/decoding; failure uses the existing media fallback. Route errors have bounded cleanup (3.5/4-second safeguards). No navigation animation can hold the overlay indefinitely. Menu exit/open interruption kills its prior timeline and clears transforms/apertures/opacity. Closing restores the trigger and the prior body overflow value. Selection/unmount cancels obsolete animation.

## Verification results

- Final production build and TypeScript check: passed.
- `npm test`: 15 passed, including existing Auth.js login/logout, both roles, CSRF/JWT/revocation, persistent throttling and database scope isolation.
- `npm run test:signature`, `npm run test:standard`, `npm run test:http`: passed public deep links, unknown/disabled routes, publication updates, draft/site isolation, booking, SEO/media rules and protected-admin regressions. These are backend/regression evidence, not proof of choreography.
- Real in-app browser: desktop story native wheel progression; intermediate expansion at 0.438, reverse to 0.181 without route change; completion to rooms at scroll 0; further native scroll to dining. The final sampled sequence records expansion 0.353 → 0.782 → rooms, with residual gestures remaining on the destination opener.
- Real browser: Back restores the story end without bouncing forward; Forward returns to rooms. Reload, then opening menu works. Three rapid open/Escape cycles leave closed dialog, empty clip/transform, unlocked body and exact opener focus. Settled menu selection reaches gallery and can reopen there. Mobile vertical story and scroll-only home → rooms at 390 × 844 passed.
- Delayed local fixture: real RSC **and image** responses delayed 1.5 s; at route commit the overlay contained a loaded retained photograph, rail and booking control. Destination image completion cleared the overlay at rooms/scroll 0. Back remained on the prior story. [Delayed-media evidence](m4-revision/after-slow-pending.jpg). This is pg/Drizzle fixture verification, not Netlify.
- Final responsive checks across home, rooms and room detail at 360, 768 and 1280 widths showed no document horizontal overflow. Browser console recorded no application errors during these checks.

## Remaining differences and unverified checks

The demo continues to use licensed fictional villa media, its original Sodai mark, Georgia/system fonts and shorter published story content. It does not copy Tandjung Sari branding, proprietary typeface, photography, historical/cultural text or exact number of editorial panels. Reference choreography/geometry is approximated from footage, not claimed pixel-identical. Menu selection intentionally avoids the reference's blank network wait and retains the source page while routing.

The browser control environment has no OS preference toggle or physical-touch surface. System reduced-motion behavior is implemented/reviewed but switching it in the real browser remains unverified; unlike the rejected attempt there is no public override button. Physical touch/momentum, mobile browser chrome changes and continuous high-frame-rate performance profiling also remain unverified. Saved after evidence consists of actual browser screenshots/observations, not a continuous video capture or an FPS benchmark.

No authenticated Netlify project, Database branch connection or Blobs runtime configuration is available; hosted integrations remain blocked. The previously documented M1 TOTP/Bencho login and migration CLI gaps remain separate. Standard/authentication are preserved. No M5 editor, deployment or ZIP handoff was undertaken.

## Local reproduction

After `npm run build`, run `npm run review:signature` and open http://localhost:3112. Scroll the story and keep scrolling through the taupe card into rooms, then dining. Use the menu repeatedly; Escape during reveal and select a link after reopening. Back/Forward restores each route, with further gestures controlling continuation.

For slow readiness, run `npm run review:signature:slow` separately and use http://localhost:3114; this now delays real RSC and images by 1.5 s and disables proxy image caching. Stop with Ctrl+C. These are isolated, persistent local PostgreSQL fixtures, never production fallback services.
