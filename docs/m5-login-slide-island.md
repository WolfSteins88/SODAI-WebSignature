# M5 — CMS login redesign (12 October 2026)

Implemented the supplied login brief and interaction sources. This update changes presentation and submission controls; authentication endpoints, role permissions, scoped content reads and hosted second-factor requirements remain in place.

## Changes

- Responsive white/warm-white split card over blush, published villa branding, coral sun/reflection, accessible labels, autocomplete, errors and Return to villa. Mobile stacks the form above the decoration.
- Compact live Asia/Makassar (WITA) clock. Press expands the full date/time; Escape or six-second timeout collapses it. One shape spring with crossfading content, isolated one-second updates and reduced-motion support.
- Pointer-following coral slider: partial release resets; endpoint release submits once. Pending unfolds the handle leftward into the track. Success appears only after the real response; errors restore an operable slider. Enter/Space on the handle and Enter in fields work with native validation.
- Cached responsive drag geometry, pointer cancellation, blur/Escape/resize/unmount cleanup, synchronous duplicate-submission gate and mounted-response protection. No extra dependencies, fake account actions, credentials in the UI or video.
- Existing public-menu logo CMS transition now lands on the new login surface. Source provenance recorded in THIRD_PARTY_NOTICES.md.

## Validation

- Final production build and TypeScript passed (build session65927).
- Full suite: 63 passing tests, including four new cases covering scaled drag geometry, partial/endpoint/cancel behavior, duplicate submission/retry and Bali date rollover. Existing hosted authentication/TOTP regression tests passed.
- Production browser: 1440×900 desktop, 360×800 and 390×844 mobile; readable stacked form and expanded clock, no horizontal overflow observed.
- Empty fields show native validation and meaningful error. Wrong credentials show pending then failure and allow retry. Slider Space and field Enter submit. Successful local login reaches Super Admin CMS; logout returns to the redesigned login.
- Actual browser pointer drag: partial release returned to 48px handle with no transform; full endpoint drag reached authenticated CMS. Physical touch cancellation/momentum is not verified; cancellation/geometry logic has automated coverage.
- Live WITA/date, auto-collapse, Escape and Return to villa verified. Public menu logo double-click reached /admin/login with one new surface, zero old cards and no browser warnings/errors; transition overlays released.
- Owner content remains Draft9 / Live9. Isolated login test dataset retained separately; no owner save/publish performed.

## Evidence

- [Desktop](evidence/m5-login/desktop-1440.png)
- [360px mobile](evidence/m5-login/mobile-360.png)
- [390px expanded clock](evidence/m5-login/mobile-390-clock.png)
- [Public-menu login destination](evidence/m5-login/menu-login-handoff.png)

## Local review / remaining checks

Running: http://localhost:3112/admin/login . Restart command: `npm run demo:local` from the project directory. Current runner session61994 uses existing local-data/signature.

New hosted second-factor UI, physical touchscreen behavior and OS-level reduced-motion behavior still need device/browser verification. Hosted server regression coverage is not live Netlify verification. No Netlify deployment or M6 work performed. Visual acceptance remains with the owner.

Changed: src/app/admin/login/page.tsx; src/components/admin/login.tsx, login.css, login-slide.tsx, bali-clock.tsx, login-interactions.ts; tests/login-interactions.test.ts; THIRD_PARTY_NOTICES.md; these docs/evidence and implementation checkpoint.
