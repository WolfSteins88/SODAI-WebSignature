# M5 — Social links beneath Get in Touch

Implemented 2026-10-11 for owner localhost review.

## Changes
- Signature contact area now has one compact icon row: configured email first, then enabled social accounts in the existing saved order. Default platform order is Instagram, Facebook, YouTube, TripAdvisor. Other existing supported platform values are retained.
- Reused existing CC0 Simple Icons assets/notices; email SVG is original project markup. Icons are18px within44px hit areas, with visible keyboard outlines and wrapping on narrow screens. Admin CMS remains below this row, outside Dock groups.
- Added **Identity → Content area → Social links**: blank URL inputs, platform icons, enable toggles and numeric order fields. A blank optional menu email override reuses the existing villa email in Getting Here. Existing populated values and IDs remain intact; startup/seed never clears them. Social/email controls were removed from the generic menu editor to avoid duplicate settings.
- Reused shared structured social schema. Empty URL values are valid unconfigured fields and never become anchors, even if enabled. Nonempty invalid/unsafe/wrong-platform URLs fail shared validation. Public rendering independently validates links/email and omits disabled or blank links. External links retain native `_blank` behavior, `noopener noreferrer` and accessible new-tab labels; no public hero event handlers are attached.
- Existing authenticated Save Draft, unsaved live preview and Publish flows persist these same fields. No relational migration, registration/auth changes, sample owner accounts, reset, new dependencies or M6 changes.

## Checks
- Production build22065 and TypeScript pass;56 unit/integration tests49824 pass.
- Standard HTTP suite passes. Signature HTTP suite21735 passes, including actual disabled/blank social anchor omission; the accessible-name assertion now accepts equivalent “new tab” wording.
- Production browser using isolated `cms-social-check` on3116: four empty platform inputs, email-only public menu, one enabled link, all four + email in correct order, unsafe URL visible errors and refused save, unsaved preview updates, Save Draft/public isolation, explicit Publish, clearing Facebook and disabling YouTube. Public becomes email/Instagram/TripAdvisor after Publish4. Configured disabled YouTube URL and blank enabled Facebook input survive restart, along with their order/enabled values. Signed-out visitors see only the published configured set.
- Desktop1280×720 and mobile360×800: all five44px targets fit one row; no horizontal overflow; Admin CMS remains below. Keyboard Tab moves between named social anchors with solid visible outline; Escape restores menu scroll/focus. External target/rel and native-anchor handling inspected; external services/mail apps and physical touch were not opened/tested.
- Evidence in `docs/evidence/m5-social-links/`: desktop-all-configured.jpg and mobile-360-all-configured.jpg use only the isolated test content; owner-social-fields.jpg shows the real blank owner fields.
- The brief's named `Screenshot 2026-10-08 122426(1).png` was unavailable at Downloads; followed the explicit icon order/scale and preserved existing menu geometry. Exact comparison to that image is pending. No owner visual acceptance or live Netlify integration claimed.

## Owner review
- Running: http://localhost:3112/ — open menu for current email icon and Admin CMS.
- Configure: http://localhost:3112/admin/identity → Content area → Social links.
- Startup from project root: `npm run demo:local`.
- Current owner dataset observed Draft9/Live9, all four social URL inputs blank. No owner save/publish or database edits were performed in this task; all content mutations were isolated on3116. Owner session restored. Server61519; Ctrl+C stops it. Inspect running.lock PID before removing any stale lock/restarting.
- No M6/deployment. Physical touch, native external-app/tab behavior and unavailable reference-image comparison remain manual checks.
