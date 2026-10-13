# M5 navigation-panel logo and CMS entry

## Implemented

- Only the small logo at the top of the open Signature red menu gains the shortcut. Mouse clicks and synthesized touch clicks share a cancellable 300 ms timer. The second activation cancels Home; no separate dblclick handler runs. Ordinary keyboard Enter goes Home; Shift+Enter enters `/admin`. Modified clicks retain native anchor behavior. Screen-reader instructions describe both actions; the mobile target is at least 44px and uses `touch-action: manipulation` only on this logo.
- Removed the visible Admin CMS link from this panel at all sizes. The saved `showCmsLinkInNavigation` value/schema is retained for compatibility, with an explicit legacy label in CMS. It does not gate the new shortcut. Existing footer access and authentication remain unchanged.
- Public Home exits reverse the **same extracted GSAP menu timeline** used by the handle, at normal speed: panel clip, photograph travel/scale, content translation, staggered text and handle rotation. No generic route fade or public hero-morph event is emitted by this logo. The rail logo remains separate.
- A persistent root boundary retains the outgoing menu while the actual authenticated Next.js destination loads. CMS enters from the right and grows as the outgoing panel recedes/slides left, with a dark gap and restrained perspective. One 750ms GSAP timeline owns this exchange. Reduced motion uses a 140ms fade. There is no fake CMS screen, iframe substitution, video, authentication bypass or content mutation.
- Escape, resize, history changes and unmount clear temporary layers/timelines and restore focus, inert state and scroll. Slow route reads hold the menu; an 8-second fail-safe releases a failed route. Rapid activations cannot commit another navigation while the transition is active.
- Fixed pre-existing locale-dependent CMS timestamps discovered during browser testing: explicit UTC output avoids server/browser timezone hydration mismatch.

## Reference inspection

Both supplied recordings were decoded sequentially for their complete durations. Contact sheets are in `docs/evidence/m5-logo/`.

- `Recording 2026-10-11 133406.mp4`: 6.23s; inspected samples every0.2s. Settings→Photos at3.7–4.2s establishes outgoing-left/recede and incoming-right/grow. Later Photos→Home shrink-to-icon was not used.
- `Recording 2026-10-11 133748.mp4`: 7s; complete sequence inspected. Rooms is visible through4s and Story by5s, demonstrating the rejected flat public change.

## Production browser checks

Isolated local PostgreSQL dataset `cms-logo-check`, port3116, preserved at Draft1/Live1. No owner save/publish/reset performed.

- Signed-out double-click enters existing login; normal authentication succeeds; signed-in double-click enters actual dashboard.
- Single click from Rooms stays on Rooms immediately after activation, then reaches Story. Gallery (heroless) keyboard Enter reaches Story through the shared handle exit. Shift+Enter reaches dashboard.
- Repeated opening/closing, Escape, Back, mobile360px, no visible panel CMS link, 54×53px mobile logo target, no horizontal overflow, and interrupted CMS Escape cleanup checked.
- Final state checks find zero screen-transition layers, zero public navigation shells on admin, no root inert attribute and restored body overflow. In-flight screenshot shows actual dashboard entering beside outgoing red menu.
- Gesture unit tests verify deferred single, cancellation by double, spaced singles never CMS, and explicit cancellation.

## Evidence and limitations

- `menu-desktop.jpg`, `menu-mobile-360.jpg`: panel without visible CMS link.
- `cms-switch-inflight.jpg`: actual CMS entry, screen overlap and outgoing recession.
- `home-handle-exit.jpg`: early public exit frame; exact timing/choreography reuse is established by shared timeline code, not by a still image alone.

Physical touch/double-tap, native modified-click tab creation, OS reduced-motion behavior, exhaustive slow-network/failure cases and universal frame-rate guarantees are not claimed. Reduced-motion and failure cleanup paths are implemented but require those further device/runtime checks. No live Netlify verification or M6 deployment work is included. Visual acceptance remains the owner's.

## Local review

Run `npm run demo:local` from the project directory, then open http://localhost:3112/rooms. Open the menu and use its top logo. `/admin` preserves existing authentication. Do not clear `local-data/signature` or reseed owner content.

## Final checks

Final production build63002 (including TypeScript) passed.59tests passed; both public HTTP suites passed. Fresh final owner dashboard load produced no browser errors; owner Draft9/Live9 remained unchanged. Review server32634 is running on http://localhost:3112. `owner-final-menu.jpg` captures the completed owner panel; temporary isolated server is stopped and its data retained.
