# M4 navigation logo transition repair — 8 October 2026

Implemented PROMPT_M4_Logo_Transition_Repair.md. Owner visual acceptance remains pending. No M5, deployment, content/schema, service, Standard or authentication changes.

## Cause and changes

The upper-left rail logo was a MotionLink (.sg-mark) containing a .std-photo. MotionFrame treated every linked photo as a shared transition photograph, cloned it at viewport dimensions and scaled it to fullscreen. The menu's .sg-menu-logo was a noninteractive div. Both navigation logos now use the same existing home destination through an explicit logo intent; the menu logo is a genuine home anchor with the same asset, measured dimensions and CSS position.

Logo selection reverses the existing menu GSAP timeline from its current progress. A timescale gives a complete reversal about220ms, shorter if interrupted early. There is no second exit timeline. Normal toggle/Escape restores normal timeline speed. Intent cancellation/guarded callbacks remain intact; pending route requests are deduplicated. Clicking home while already there closes the menu, restores its lock, then returns to top and focuses main without router.push or reload.

The route system receives explicit fade intent, with no source-photo clone. A defensive selector exclusion also prevents .sg-mark/.sg-menu-logo images from ever taking the shared photo expansion path. Ordinary linked photo expansion and scroll-only handoffs are preserved. The outgoing page snapshot remains visible during destination readiness/media loading, then fades its opacity over180ms to reveal the destination underneath; no extra hero entrance or artificial delay is added. Configured warm-ready animation budget is approximately400ms, excluding route/media readiness; this is not measured end-to-end latency.

Links continue using Next Link onNavigate interception, which leaves modified clicks/native anchor behavior intact. Reduced motion uses immediate menu settlement and immediate route-overlay release once ready, through the established preference path.

## Verification

- TypeScript check passed; production build67752 passed including TypeScript.
-34 tests pass, including two new logo lifecycle cases: reverse intent/one commit/cancellation, and closed rail navigation without menu locking. Existing auth, roles, published/draft/site isolation and content checks pass.
- Standard and Signature PostgreSQL/Drizzle HTTP suites pass. Local published fixtures, not live Netlify.
- Real production browser: Windows in-app Chrome155, desktop1279×700 and mobile390×844.
- Desktop fully open Gallery menu → logo pointer → home: expanded photo count0 at click and after navigation; menu hidden, root/body restored, route overlay hidden, destination main focused.
- Desktop same-home click during menu opening from scrollY533.333 → top0, no unnecessary route push; BackGallery and Forwardhome checked.
- Mobile repeated Enter logo during closing settles closed/unlocked/main focus. Closed rail keyboard Terms→home showed outgoing overlay opacity1 and expanded count0 while destination was loading; later settled hidden/unlocked/main focused.
- Fully open mobile Terms menu → logo pointer → home also settles overlay hidden/menu hidden/unlocked/main focused. Mobile logo remains54×53.281px at x28/y20.354; desktop65.583×64.719px at x468.5/y37.510. Escape during subsequent opening regressed successfully.
- Control-click left the current menu open and current route unchanged. The in-app adapter did not surface a new tab; actual new-tab creation is not claimed as verified. Installed Next Link documentation confirms onNavigate excludes modified navigation.

## Evidence and limits

Screenshots in docs/reference-logo-transition/: desktop-menu.png, desktop-destination.png, mobile-menu.png and mobile-destination.png. These establish composition and settled states, not frame-by-frame timing proof. No before screenshot of the old zoom was captured. The offending clone/scale path was identified in source and explicitly excluded.

No new performance profiling was performed. No60fps, precise latency or exact-reference-animation claim. OS reduced-motion, real touch momentum and Firefox/Safari remain unverified. Live Netlify integration was not tested. Prior unrelated Packages Forward-after-new-scroll issue remains outside this task.

## Manual review

Running on the owner's machine: http://127.0.0.1:3112/ (also /gallery and /terms). From the project root, start with npm run build, then npm run review:signature. Existing published local database review fixture; no deployment.

Changed application files: src/components/signature/navigation.tsx, menu-controller.ts, motion.tsx, menu-fidelity.css; tests/menu-controller.test.ts. Updated this report, latest-changes.md, implementation-progress.md and screenshots. Other logo links and public layouts are unchanged.
