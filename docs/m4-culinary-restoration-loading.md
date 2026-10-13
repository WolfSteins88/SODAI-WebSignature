# M4 — Culinary restoration and homepage intro

Implemented 9 October 2026. This supersedes the symmetrical-category revision; owner visual acceptance remains pending.

## Reference and changes

Both supplied recordings were inspected as complete chronological half-second frame sequences: Culinary 9.43 seconds, loading 8.83 seconds. Contact sheets are in [reference-culinary-intro](reference-culinary-intro/). Timestamps read left to right, then top to bottom, beginning at 0 seconds.

- Culinary 0–4.5s: Breakfast left, All Day Dining lower right, Drinks & Wines beneath Breakfast. Restored measured design margins (left 162.86, right 113, gutter 94.14), 295px image height at 1440px width, right offset 170.05px and third-card offset −47.69px. No centered last card. Larger 20px desktop/18px mobile copy and 16px actions remain intentional readability differences from the smaller reference text. Mobile stacks published order with no stagger.
- Culinary 4.5–9.43s: existing staggered offers strip, native scrolling/drag and progress behavior retained. No booking buttons restored. Culinary hero/menu/metadata/next-page label, `/dining`, category names and document anchors retained.
- Loading 0–3s: reference blank cream wait intentionally shortened. Around 3–6s its small centered logo appears; approximately 6–8s the cream fades to the homepage. The implementation uses the published villa's configured menu logo, preserving proportions, with a configured-name fallback. It never imports reference branding into the public renderer.

The new homepage-only intro covers already server-rendered content. A document bootstrap runs only on initial `/` navigation or reload, excluding history restoration. The completed marker survives SPA routing, so internal Home returns do not replay it. Standard, admin and preview do not render the overlay.

One GSAP opacity timeline gently reveals the mark and fades the cream; it adds no hero transform, rail displacement or route morph. Readiness waits only for the visible opener image/decode and the two critical typefaces. It does not wait for `window.load` or all Story media. A bootstrap deadline and component deadline release it within approximately four seconds; CSS has an additional visibility fallback. No-JavaScript content is present with a noscript overlay override. Prehydration pointer/keyboard guards and hydrated inert/overflow protection are released on completion, navigation, pagehide, reduced motion or cancellation. Prior styles and focus are restored without scrolling to zero.

## Validation

- Final production build 18757, TypeScript and 42 tests passed. Standard and Signature production HTTP regression suites passed after the final application changes, including auth/content isolation checks in the test suite.
- Production browser: Chromium 155 on Windows, 1440×900 CSS viewport / DPR approximately 1. Category frames measured 535×295px; right offset 170.04px. No horizontal document overflow. Actual photos loaded and retained the established photo-color behavior.
- Mobile 390×844: category frames 343.21×193.05px, body 18px, published Breakfast → All Day Dining → Drinks order. 360px also had no horizontal overflow. No claim of exact reference mobile fidelity from the desktop recording.
- All three View Menu links opened their genuine category fragments and focused the matching headings. Back to Culinary worked; menu showed Culinary. Offers accepted keyboard horizontal scrolling. Existing fixture has no configured download files, so actual download execution remains untested.
- Cold entry and reload visibly showed the cream/emblem then released all inert/inline overflow locks. Internal Home return and browser Back/Forward did not replay the overlay. No stale menu-route layers remained.
- Failed hero exited to the existing photograph fallback. Failed logo exposed a prehydration error-handler gap; fixed by checking already-complete broken images at hydration. Retest showed the configured villa name and clean lock release.
- Local proxy held hero, logo and font responses for six seconds. Intro measurement was 3642.7ms from component initialization to fail-safe completion, while the document deadline began earlier. This demonstrates bounded exit despite readiness delay. Proxy stopped; normal default fixture restored.
- SSR checks confirm actual Story content, no-JavaScript override and zero video elements. Bootstrap tests cover excluded routes/history, reload eligibility and completion when hydration never finishes.

## Evidence and performance limits

- [Desktop categories](reference-culinary-intro/desktop-after.png), [mobile categories](reference-culinary-intro/mobile-categories.png), [intro](reference-culinary-intro/home-entry-final.png), [ready homepage](reference-culinary-intro/home-ready.png), [failed hero](reference-culinary-intro/failed-hero.png).
- [Production raw trace](reference-culinary-intro/production-profile.json), [delayed-load measurement](reference-culinary-intro/slow-intro-profile.json).
- Cached intro measured 768.9ms, approximately 0.8 seconds. The 137.43s opt-in production trace includes menu open/Escape close and substantial idle/tool time: 22,514 frame intervals, median 6.1ms, p95 6.2ms, max 30.2ms, eight intervals above 16.7ms; zero recorded long tasks/long animation frames. This is rAF/PerformanceObserver evidence, not a GPU/DevTools trace or a controlled physical 60Hz benchmark. It does not prove universal 60fps or that all eight intervals were rendering drops.

Remaining: actual OS reduced-motion and JavaScript-disabled browser runs, failed-font network run (delayed fonts tested), physical touch, cross-browser and controlled hardware/GPU profiling. No deployment or live Netlify integration was verified. Owner judges visual fidelity; no M5 work.

## Review and changed files

Normal review is running at http://127.0.0.1:3112/ and http://127.0.0.1:3112/dining (process 16844). This is the owner's localhost, backed by scoped published local PostgreSQL-compatible storage through Drizzle, not a remote preview. Start from the project root with `npm run build`, then `npm run review:signature`. Slow QA can use `$env:SIGNATURE_REVIEW_DELAY_MS='6000'; npm run review:signature:slow` on port 3114; it is not currently running.

Changed: `src/components/signature/dining.css`, new `home-intro.tsx`, `home-intro.css`, `home-intro-bootstrap.ts`, Signature `index.tsx`, `src/app/layout.tsx`, local-only `performance-review.tsx`, QA fixture/slow proxy, new `tests/home-intro.test.ts`, checkpoint/latest changes and this report. Unrelated page compositions and authentication were preserved.

Exact next action on continuation: inspect checkpoint/runtime and owner feedback, then address a concrete observed difference or the outstanding reduced-motion/no-JavaScript/failed-font checks. Do not restart completed implementation or proceed to M5.
