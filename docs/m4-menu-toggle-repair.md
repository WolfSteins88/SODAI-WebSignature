# M4 Signature menu toggle repair — 8 October 2026

Implemented the supplied Menu Toggle Repair brief. No M5, deployment, content, services or authentication changes. Visual acceptance remains with the owner.

## Cause and correction

Native showModal() placed the overlay in the browser top layer and made the persistent external handle inert. A separate CSS rule hid the rail. The handle only opened; two unrelated GSAP timelines killed/reset each other.

The Signature navigation now owns a modal semantic boundary containing both the persistent rail button and the visual overlay. Background page siblings are inert while the overlay is active; the same stationary button remains above it, with requested-state labels/aria-expanded. Duplicate close buttons are removed. A single reversible timeline coordinates the rail color/handle, photo, surface, logo, links, secondary links, contact and legal details. Dock text transforms remain separate. Layout-effect starting styles avoid first-paint flashes; no per-frame React state updates or menu geometry reads occur.

A small intent controller guards completion callbacks, lock lifetime and pending navigation. Closing remains mounted and interactive until reverse completion; reopening cancels pending navigation/cleanup. Escape works during opening. Keyboard focus wraps through the button and visible menu actions; ordinary close restores button focus. Completed menu navigation retains the existing route choreography and now focuses destination main content even on Gallery/Terms, which have no hero. NextScene respects the non-native menu's active lifecycle.

Scroll lock saves/restores exact scroll coordinates and prior overflow/overscroll property values and priorities on both root and body; inert states are restored. Lock occurs once per active lifecycle. Route/unmount cleanup releases it. Reduced motion uses immediate settled timeline progress and the same cleanup path.

## Browser verification

Production Next.js build, Windows in-app Chrome155, CSS1279×700/DPR~1; mobile390×844 and360×800.

- Same persistent handle open/close and repeated open/close/open; reverse completion releases lock and hides links.
- Escape immediately after Enter opening; exact nonzero Packages scrollY2852 restored; focus returns to handle and root/body overflow restored empty.
- Desktop keyboard Gallery selection, pointer Terms selection from settled menu, Terms→Gallery; destination main receives focus, menu hidden and unlocked.
- Back Packages and Forward Gallery after menu navigation; no stale menu lock.
- Mobile keyboard Shift+Tab wraps to Terms (last available action); resize390→360 while active; same-handle close and no horizontal overflow.
- Reference live menu opening, settled composition and closing observed. The reference moves a red surface across the page before the photo/text composition settles. Established composition is retained; exact timing equivalence is not claimed. Evidence review caught the animated full-width mobile rail covering the menu logo; active mobile rail is now transparent, preserving the logo and persistent handle. The centered persistent close handle is intentional to meet this repair brief, replacing the reference's separate upper CLOSE target.
- An early automated pointer click on Gallery during opening did not activate the moving link; keyboard activation worked. A subsequent settled pointer Terms click completed. Persistent handle clicks are stationary and succeeded repeatedly; no debounce added.

## Checks and evidence

- 32 tests pass, including stale completion, reversal lock lifetime, cancelled pending navigation, one route commit and idempotent cleanup.
- Production builds78951 and31415 pass, including TypeScript. Standard and Signature published PostgreSQL/Drizzle HTTP regression suites pass (routes, modules, metadata, booking, draft/site isolation). Local fixture only, not live Netlify.
- Screenshots: reference-menu-toggle/desktop-open.png and mobile-open.png.
- Actual production rAF/PerformanceObserver data and trace-event export: reference-menu-toggle/performance.json, performance-summary.json, performance.trace.json. This is an observer trace, not a DevTools compositor/GPU trace. Final sample results are recorded alongside those artifacts.

## Remaining limits

Controlled physical60Hz/GPU dropped-frame measurement, cold-image decode stalls, real touch momentum, OS reduced-motion setting and Firefox/Safari remain unverified. Immediate reduced-motion code is implemented, but OS behavior is not represented as tested. Prior unrelated Packages Forward-after-new-scroll issue remains outside this repair. No universal60fps or exact choreography matching claim; no live Netlify verification.

## Local manual review

http://127.0.0.1:3112/gallery (also /packages and /).

Startup from project root: npm run build, then npm run review:signature. Review uses the established local published database fixture. Server is running on the owner's machine; no deployment performed.

Modified: src/components/signature/navigation.tsx, menu-controller.ts, menu-fidelity.css, signature.css, next-scene.tsx, motion.tsx; tests/menu-controller.test.ts; this report, latest-changes.md, implementation-progress.md and evidence. Standard components, account configuration and published accessors unchanged.

Final-build production observer: 44.96s, 7411 intervals; median 6.1ms, p95 6.2ms, maximum 18.1ms; 2 intervals above16.7ms, 0 long tasks, 0 long animation frames. ~165Hz callback cadence, warm images. Final raw/summary/trace files use performance-final names. This sample includes idle time around the menu cycle and is not isolated compositor presentation or dropped-frame evidence.

Final mobile layering CSS production build15079 also passed, including TypeScript. Desktop observer sample precedes only this mobile-scoped transparency correction; no animation JavaScript changed afterward.
