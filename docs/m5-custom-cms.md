# M5 Custom CMS - implementation and review

M5 amendment: PROMPT_M5_Custom_CMS.md (9 October 2026) overrides old user-management and password-only requirements. No M6 deployment or ZIP packaging has been performed.

## Architecture and workflow

The existing Next.js App Router/TypeScript, Auth.js Credentials JWT, Drizzle/PostgreSQL and Netlify Blobs architecture remains. React Hook Form 7.89.0 and OTPAuth 9.5.2 are pinned alongside the existing package versions in package.json/package-lock.json. Admin-only JSON Schema metadata is generated from the shared Zod content contract; forms render constrained fields and implemented composition presets, not a JSON/HTML/CSS editor. Public reads remain site-scoped published snapshots.

Password verification creates a five-minute opaque HttpOnly challenge. A valid six-digit authenticator TOTP is required before Auth.js issues a session. PostgreSQL row locks and monotonic counters prevent challenge/code replay; persistent account/IP limits and five attempts per challenge apply. Account IDs, bcrypt hashes, TOTP secrets, auth secret and version remain server environment configuration. Changing configuration fingerprints invalidates existing sessions. Owner and Super Admin can edit/publish/restore; diagnostics additionally require Super Admin on the server. There is no user CRUD/registration/invitation UI.

Save Draft uses the current revision and one transaction. Stale requests return 409 without overwriting edits. Publish validates the database draft and commits publication/history/audit together. Restore produces a new draft only. Archive retains the stable parent path/value and audit record; Revisions restores entries. Image readiness is checked separately before publication. Publish refreshes public routes; Refresh retries cache invalidation without publishing a second snapshot.

## Content coverage

| Area | Implemented wiring | Limits / remaining verification |
| --- | --- | --- |
| Identity | Name, tagline, existing logo/rail/menu/intro media, contact/address, social URL/order/enabled, Admin footer toggle | Standard has a text brand; no new Standard logo frontend or testimonials renderer invented |
| Navigation / pages | Registered destination labels/order/visibility, menu photo, page enabled + SEO | Page labels and slugs remain independent. No arbitrary route creation. Root landing cannot be disabled |
| Story | Existing fixed composition types, stable IDs, copy/images, add/duplicate/reorder/enable/archive/restore | Existing 32-panel cap retained. Opener pinned. Loading geometry/timing locked. Video planned, publish rejects enabled blocks |
| Rooms | CRUD/slug/enabled/order, capacity/area, descriptions, inclusions/facilities, images, gallery, related IDs | 30 rooms; at most nine enabled gallery photos (up to 30 retained entries). Related references exclude current/disabled rooms |
| Culinary | Intro, ordered category/offers, enabled flags, menu image collections, validated PDF/download links | No document upload decoder broadened; no booking engine or restored Book Room/Table buttons |
| Culture / Foundation | Existing article/program/initiative and editorial section contracts | Fixed implemented compositions only; no position controls |
| Packages | Existing details, price wording/inclusions/terms/images/enquiry | Existing external/WhatsApp destinations, no payment/availability system |
| Gallery | Categories/photos, associations, order/enabled, alt/captions | Signature comments/reviews/forms absent; gallery category references validated |
| Getting Here / Terms | Existing contact/map/distance/travel rows; ordered typed terms blocks | Newsletter remains unavailable; Terms IDs stay stable |
| Standard | Existing intro/story/gallery/amenities/rooms/location/optional modules and migrated prominent copy labels | Absent testimonials/facility-category frontend not added; some secondary accessibility/navigation UI wording remains code-owned |
| Media | Real byte validation/upload, library selection/replacement, metadata/focal point, archive/reference check/delete | Netlify live uploads remain blocked without runtime credentials. Aspect choices preview framing only; fixed public geometry is preserved |
| Preview / history | Authenticated renderer with private image URLs, noindex/no-store, revisions/archive UI | Public image optimizer bypassed only for private draft media |

Admin section routes include /admin/identity, /admin/navigation, /admin/story, /admin/rooms, /admin/culinary, /admin/culture, /admin/foundation, /admin/packages, /admin/gallery, /admin/location, /admin/terms, /admin/standard, /admin/booking, /admin/media and /admin/revisions. The schema-driven Other section contains remaining compatible content fields and public copy labels. No typography/theme/animation controls.

## Setup and migrations

1. Install pinned dependencies with npm ci.
2. Privately run npm run accounts:provision in an interactive terminal. It asks for exactly two identifiers/passwords and writes ignored .env.provisioned with bcrypt hashes, generated TOTP secrets and private authenticator enrollment URIs. It never persists plaintext passwords. Open this file privately, enroll both authenticators out of band, restrict filesystem access, and copy named values to server-only environment variables. Never commit, log, include in ZIP, or put in NEXT_PUBLIC_. The utility refuses to overwrite an existing file.
3. Follow .env.example: SITE_ID, CONTENT_ENV, TEMPLATE_VARIANT, CONTENT_MODE, AUTH_URL, AUTH_SECRET, AUTH_SESSION_VERSION, OWNER_IDENTIFIER, OWNER_PASSWORD_HASH, OWNER_TOTP_SECRET, SUPER_ADMIN_IDENTIFIER, SUPER_ADMIN_PASSWORD_HASH, SUPER_ADMIN_TOTP_SECRET, optional DATABASE_URL. For Next .env.local escape dollar signs in bcrypt hashes; Netlify UI stores literal values. TOTP secrets are uppercase Base32, 32-128 characters. AUTH_URL must match the browser origin, including localhost vs 127.0.0.1.
4. Against the selected Netlify-managed PostgreSQL branch, run npm run db:migrate then npm run db:seed (fictional) or the explicit comparison seed. Seeding is idempotent and does not overwrite edits. Migration 0002_thick_dexter_bennett adds challenge/replay/archive tables and media metadata; 0003_left_cannonball preserves original archive positions. 0000/0001 stay intact. Local tests apply all migrations twice safely. No live Netlify migration has been claimed.
5. npm run build then npm run start for the configured database/Netlify runtime. No static export.

Local content/CMS review without hosted credentials: npm run accounts:provision then npm run build then npm run review:cms. Open http://localhost:3112/admin/login with the configured identifier/password and current authenticator code. Local PostgreSQL fixture data persists in ignored test-results/standard/cms-signature across restarts. This runner does not emulate Blobs or prove Netlify behavior. Set TEMPLATE_VARIANT=standard for Standard review. The ordinary review:signature/review:standard commands remain isolated disposable public QA fixtures.

## Media and publication safety

JPEG/PNG/WebP only, maximum 4 MB, decoded dimension/pixel bounds, animated/unsafe/corrupt formats rejected, re-encoded WebP. Immutable UUID object keys; replacements upload a new object. Draft-only bytes require authenticated delivery with private no-store; currently published enabled assets use public paths and supported Next Image optimization. Disabled content is not a public media authorization source.

Media deletion locks the site before checking current draft/publication/retained history/archive references and blocks referenced images. Archive preserves existing references. Failed uploads stay not-ready and cannot publish; after fifteen minutes they can be explicitly cleaned up via the same idempotent deletion path. Provider failure leaves the pending metadata visible for retry. Metadata edits apply to library defaults; content slots retain their own alt/framing until selected/edited. Publication and Blobs are deliberately not represented as one distributed transaction.

Explicit storage namespace derives from server SITE_ID/content environment/deployment context; request parameters cannot select another store. Netlify deploy previews need DEPLOY_ID and a separate CONTENT_ENV. Public routes/indexing/next-scene references omit disabled modules; hiding a menu link alone preserves direct access.

## Verification status

Implemented for local owner review; hosted acceptance remains pending.

- Final production build (including TypeScript) passed. 46 tests passed: real Auth.js password/TOTP, both roles/logout/CSRF/revocation, invalid/expired/replayed/concurrent OTP, persistent PostgreSQL throttling/restart, scope isolation, optimistic conflicts, transactional publication/archive/restore, image byte/size/dimension validation, registered route visibility, protected landing/version and existing M4 controllers.
- Standard and Signature production HTTP regression suites passed: public deep links/404, publication changes, draft/site isolation, booking context, disabled modules, metadata/sitemap/robots and empty/single collections.
- Production browser at 1280x800: Owner password/current TOTP, save/reload persistence, authenticated draft preview versus unchanged public snapshot, publish/history, restore into a new draft, Story duplicate/disable/reorder across heterogeneous compositions/save/reload, archive and restore at original position. Corrected stale nested React Hook Form registrations discovered during this test. Original content restored and published as local revision8; test clone archived.
- Logout returns to login; Super Admin password/current TOTP reaches dashboard and diagnostics. Owner diagnostics page returns404. Anonymous API checks return401 and preview redirects to login. Direct browser navigation to the diagnostics API was blocked by the browser client; role checks are also enforced server-side.
- A real locally generated PNG upload returned503 with explicit storage-unavailable feedback and remained not-ready. This proves the failure path, not a successful hosted upload. Failed pending items appear on reopening Media; incomplete cleanup waits15 minutes. No simulated bytes/store were substituted.
- Bencho Preview and Code inspected for all seven admin components. Applicable MIT notices retained. Video remains planned/disabled and publishing enabled video is rejected.

Evidence: [draft saved](m5-evidence/01-draft-saved.png), [publication/history](m5-evidence/02-published-history.png), [storage failure](m5-evidence/03-upload-unavailable.png), [Super Admin diagnostics](m5-evidence/04-super-admin.png), [room editor](m5-evidence/05-desktop-rooms.png), [dashboard](m5-evidence/06-dashboard.png).

Remaining verification: actual 360/390px mobile editing and physical touch; browser viewport override did not apply (DOM remained1280px), so the room screenshot is desktop evidence. Actual OS reduced-motion, full keyboard audit, every collection edit workflow, successful uploaded-byte delivery/private CDN isolation/reference deletion/orphan cleanup against Netlify, cache refresh failure/retry and60-second hosted update target remain unverified. Prominent public copy is migrated; some secondary navigation/accessibility wording remains code-owned. Existing absent Standard testimonials/facility-category frontend is not created by M5.

Review server: http://localhost:3112/admin and /admin/login; public http://localhost:3112/; authenticated http://localhost:3112/preview. Current process uses isolated temporary test accounts, not operator accounts; the existing browser session can review the UI. For your own credentials run npm run accounts:provision privately, stop the review server, then npm run review:cms (reads .env.provisioned). Passwords/authenticator enrollment are never printed in this report.

External blocker: no DATABASE_URL/Netlify Database runtime context, Netlify Blobs runtime context/token, or operator-configured accounts were present in this shell or .env.local. No hosted persistence/upload/cache-refresh SLA/deploy-preview integration is claimed. Local isolated browser test accounts are temporary and are not operator credentials.


## 10 October local demo amendment

The explicitly selected `npm run demo:local` now supports admin/admin without TOTP, isolated persistent PostgreSQL plus real filesystem images. Normal hosted accounts/TOTP and Netlify providers retain the workflow above. Shared branding/hero slots and a dedicated Copy group supersede the earlier Other-only copy description. See [local demo coverage, configuration and backups](m5-local-demo.md). No M6/deployment.
