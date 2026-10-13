# M5 — Signature navigation CMS link

Implemented 2026-10-11 for localhost owner review.

## Changes
- Added understated **Admin CMS** below the Signature menu contact/social area. It is outside both Dock groups; public labels/order/hover are unchanged. Stable 44px keyboard/touch target and visible focus outline.
- Added **Show CMS link in navigation** in Navigation settings. The separate `showCmsLinkInNavigation` boolean defaults true on legacy snapshot parsing; footer `showAdminLink` is unchanged. Existing scoped content JSON/save/private preview/publish paths persist the field; no relational migration or reset is needed.
- Ordinary clicks use the existing reversible menu controller. Only after reverse completion and scroll/inert cleanup does a fresh-document `/admin` navigation run. This bypasses public hero/intro/ScrollTrigger lifecycles and uses existing auth redirects. Escape, reopening and controller cleanup cancel a pending admin intent. Modified clicks retain native anchor handling.
- Authentication/security, Standard and page compositions are unchanged.

## Validation
- Production `npm run build` and TypeScript passed; `npm test`: 54 passed.
- Both `npm run test:standard` and `npm run test:signature` passed, including scoped published reads and draft isolation.
- Real production browser, isolated `cms-menu-link-check` on port3116: signed-out CMS click → `/admin/login`; existing local Auth.js login; signed-in keyboard Enter → `/admin`, no Signature menu nodes on admin.
- Hidden setting saved draft2/live1; public DOM retained link while private preview omitted it. Publish2 hid public link; direct authenticated `/admin` worked. Saved/published enabled setting3 restored link. Only isolated test content was changed.
- Desktop1280×720 and mobile390×844 /360×800: subordinate contact placement, 44px target, no horizontal overflow; Escape restored overflow/focus; repeated close/reopen and resize tested. Controller regressions cover duplicate completion, cancellation/reopen and unlock-before-admin ordering.
- Control-click retained the original menu, but this browser backend did not create a tab. Native new-tab opening, physical touch and OS reduced-motion remain manual checks; the native anchor and existing reduced-motion controller path are preserved.
- Screenshots: `evidence/m5-menu-cms/desktop.jpg`, `mobile-390.jpg`. No visual acceptance claimed.
- No Netlify configuration/integration was verified; no deployment/M6 changes.

## Owner review
Server: `http://localhost:3112/rooms` (open menu → Admin CMS). Navigation setting: `http://localhost:3112/admin/navigation`. Startup: `npm run demo:local` from the project root. Local demo uses existing admin/admin; never included in public menu.
Owner content remains Draft8 / Live8. Persistent owner store was neither reset nor edited. Server session95495; stop with Ctrl+C. If stopped, inspect running.lock PID/process before removing a stale lock/restarting.
