# Sodai villa templates — M4

M2 implements the Standard public website on M1’s scoped published-content accessor: home, story, rooms and details, gallery, location and enabled optional pages. Standard uses warm cream and olive, an accessible mobile menu, gallery filters/lightbox, booking settings, SEO and adapted Bencho showcases. M0 reference deliverables and M1 authentication are preserved. M3 adds Signature layout; M4 adds its interaction sequences. The full CMS and deployment/ZIP verification remain later phases.

## Setup

Use Node 22.12+ (Netlify pins Node 22; local verification ran on 24.19.0).

```powershell
npm ci
Copy-Item .env.example .env.local
npm run password:hash
# Repeat for the second account; configure .env.local privately.
npm run dev
```

The hash command prompts without echo and prints only a bcrypt hash, cost 12. Passwords must have 12+ characters and at most 72 UTF-8 bytes; never put plaintext passwords in source, environment files, command arguments or Netlify settings. Generate `AUTH_SECRET` locally with `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"` and store it privately.

Escape **every `$` as `\$`** in bcrypt hashes in `.env.local`: Next expands environment variables, even in quoted values. Netlify's UI needs the **raw hash without backslashes**. Environment files are gitignored.

Without configuration, login shows a setup notice and operations fail closed. Configured login also requires a migrated database for persistent rate limits. Public pages require a migrated, seeded database and always read only its scoped published snapshot. There is no demo fallback. The fictional seed becomes visible only after it is stored as published content.

## Server environment

| Variable                                              | Configuration                                                               |
| ----------------------------------------------------- | --------------------------------------------------------------------------- |
| `SITE_ID`                                             | Stable villa/deployment identity, distinct for each demo                    |
| `CONTENT_ENV`                                         | Explicit `local`, `production`, `preview` or other environment label        |
| `TEMPLATE_VARIANT`                                    | Server-selected `standard` or `signature`                                   |
| `CONTENT_MODE`                                        | Legacy compatibility flag; use `live`. Public reads always use the database |
| `AUTH_URL`                                            | Exact application origin; HTTPS on Netlify                                  |
| `AUTH_SECRET`                                         | Random secret of at least 32 characters                                     |
| `AUTH_SESSION_VERSION`                                | Required version string; change and redeploy to revoke all JWTs             |
| `OWNER_IDENTIFIER`, `OWNER_PASSWORD_HASH`             | Fixed Owner account; identifier and bcrypt hash                             |
| `SUPER_ADMIN_IDENTIFIER`, `SUPER_ADMIN_PASSWORD_HASH` | Fixed Super Admin account; distinct identifier and bcrypt hash              |
| `DATABASE_URL`                                        | Netlify-managed connection (optional) or Neon pooled URL (required on Vercel) |
| `DATABASE_URL_UNPOOLED`, `BLOB_READ_WRITE_TOKEN`      | Neon direct URL for migrations; private Vercel Blob store token             |
| `CONTEXT`, `DEPLOY_ID`, `NETLIFY`                     | Netlify runtime values; reproduce the exact target scope when seeding       |
| `VERCEL`, `VERCEL_ENV`, `VERCEL_DEPLOYMENT_ID`        | Vercel runtime values; mapped onto the same scopes as `CONTEXT`/`DEPLOY_ID` |

Account identifiers, password hashes and auth secret belong in server-only Netlify Environment Variables scoped to the intended deployment context and Functions runtime. Non-secret template/scope variables must also be available during builds. Never use `NEXT_PUBLIC_`, `next.config` env injection or committed secrets. Auth initialization is lazy. There is no auth adapter, account/session table, registration, invitation, third role or user-management UI.

Auth.js encrypts eight-hour JWT sessions and sets HttpOnly/SameSite=Lax cookies, Secure with secure prefixes on HTTPS. Netlify rejects HTTP configuration; HTTP is for local development. Every session access and server operation validates a fingerprint of both fixed accounts, hashes, roles, scope and session version. Rotating identifiers, hashes, secret, scope or version and redeploying invalidates sessions. Logout clears the browser cookie; immediate global revocation of copied JWTs requires configuration rotation.

Both roles can read, save and publish content for this deployment. Super Admin has every implemented permission within this deployment, with no cross-deployment access. Request parameters cannot select a role or site. Admin and preview are private and uncached. Content operations require exact Origin, bounded JSON, schema validation and the current revision. Saving changes only drafts; publishing copies the locked draft into the published snapshot with audit/revision records in one transaction. Stale writes return 409. The full editor is deferred. The authenticated content API supports GET and POST `{action:"save"|"publish",expected:number,content?:VillaContent}`.

## Database and images

Enable **Netlify Database**. Production uses `@netlify/database.getConnectionString()` with Drizzle's PostgreSQL driver. Obtain a selected branch connection using supported Netlify tooling for operator work. Never use a production connection for a preview; no external hosted database is needed.

```powershell
# Select DATABASE_URL and EXACT target SITE_ID, CONTENT_ENV, CONTEXT, DEPLOY_ID first.
npm run db:migrate
npm run db:seed
```

The reviewed Drizzle migrations create `sites`, `revisions`, `audit`, `media` and `login_limits`, then add the M4 Story collection to legacy JSON snapshots. The M4 migration transforms draft, published and revision snapshots independently; it never promotes a draft or enables Culture on an existing deployment. Fictional seed data is idempotent and preserves existing drafts/publications. Review SQL before applying new migrations. Migrations are operator-controlled and never run automatically in preview builds.

This is a fresh M1 baseline. Earlier **un-deployed** migrations are preserved in `archive/pre-m1-migrations` and are not executed. If someone separately deployed that experimental account schema, do not apply this baseline over it: a reviewed data-conversion migration is required. This task has not deployed that experiment.

Content primary keys and Blobs store names derive from a SHA-256 partition of `(SITE_ID, CONTENT_ENV, CONTEXT, DEPLOY_ID)`. Local and production partitions are stable; other deployed contexts require a unique platform deploy ID. Preview content/images remain isolated even in a copied database branch. Seed each preview deliberately. For production operator commands set `CONTEXT=production`; unset context seeds local scope. Changing scope does not migrate old data.

Login limits persist atomically in PostgreSQL: ten attempts per 15 minutes for both IP and account identifier, including successes and failures. Only Netlify's platform-owned `x-nf-client-connection-ip` is trusted; direct local requests share one IP bucket. HMAC keys avoid plaintext identities/IPs. Concurrent requests consume counters, denied attempts do not roll them back, expired entries are pruned, and database errors prevent login. There is no in-memory fallback.

Server-only Blobs helpers authorize every read/write/delete, accept no caller namespace, normalize bounded image bytes to immutable UUID WebP keys, and use strong consistency in the current namespace. M2’s public image route returns only ready images referenced by the current published snapshot, matching both scope and namespace. Unpublished or foreign images return 404. The media-manager UI is deferred. Direct `next dev` has no Blobs context; use linked Netlify Dev for real checks. No tokens are exposed to browser code.

## Netlify deployment

1. Authenticate to [the supplied team](https://app.netlify.com/teams/diosatriafamouz/projects), then create/link separate Standard and Signature projects from this source.
2. Use Netlify Next.js framework detection/adapter, build `npm run build`, publish `.next`, Node 22. Do not static-export.
3. Set distinct site IDs, origins, auth secrets and fixed accounts; select each template. Production uses `CONTENT_ENV=production`; previews use `preview` plus the platform deploy ID. Configure server-only variables per deploy context.
4. Enable Netlify Database, select the proper branch, apply migrations and seed using exactly matching scope; verify Blobs runtime context.
5. Set `CONTENT_MODE=live`, deploy and perform the hosted checks in `docs/verification.md`.

The CLI currently reports **Not logged in**. No authenticated linked project, Database connection or Blobs runtime context is available, so live integrations remain unverified.

## Vercel + Neon deployment

The same code also runs on Vercel with Neon Postgres and a private Vercel Blob store; Netlify support is unchanged.

| Netlify                              | Vercel + Neon                                                          |
| ------------------------------------ | ---------------------------------------------------------------------- |
| Netlify Database                     | Neon `DATABASE_URL` (pooled; `DATABASE_URL_UNPOOLED` for migrations)   |
| Netlify Blobs                        | Private Vercel Blob (`BLOB_READ_WRITE_TOKEN`), `villa-<scope>/` paths  |
| `CONTEXT` / `DEPLOY_ID`              | `VERCEL_ENV` (`production`, `preview`→`deploy-preview`, `development`→`local`) / `VERCEL_DEPLOYMENT_ID` |
| `x-nf-client-connection-ip`          | `x-real-ip` (trusted only when `VERCEL=1` outside `development`)       |

1. **Neon** – create a project (e.g. region `aws-ap-southeast-1` for Bali), or add it from the Vercel Marketplace (Storage → Neon) so `DATABASE_URL` and `DATABASE_URL_UNPOOLED` are injected per environment. Enable preview branching only if previews should get their own database branch.
2. **Vercel project** – import this repository (one project per template: Standard and Signature). Framework *Next.js*, build `npm run build`, Node 22. Do not static-export.
3. **Blob** – Storage → Create → Blob, connect it to the project for Production and Preview; this adds `BLOB_READ_WRITE_TOKEN`. Images are stored with `access: "private"` and served only through `/api/media/[id]`.
4. **Environment variables** (Production, and Preview with its own values): `SITE_ID`, `CONTENT_ENV` (`production` / `preview`), `TEMPLATE_VARIANT`, `CONTENT_MODE=live`, `AUTH_URL` (the exact HTTPS origin), `AUTH_SECRET`, `AUTH_SESSION_VERSION`, `OWNER_*` and `SUPER_ADMIN_*` (identifier, raw bcrypt hash without `\` escapes, TOTP secret). Mark secrets *Sensitive*.
5. **Migrate and seed** from a workstation, once per target scope:

```sh
vercel link && vercel env pull .env.local   # or paste the Neon URLs manually
npm run db:migrate
VERCEL_ENV=production SITE_ID=<prod site id> CONTENT_ENV=production npm run db:seed
```

Preview deployments get a per-deployment scope (`VERCEL_DEPLOYMENT_ID`) and therefore start empty; seed a preview deliberately with `VERCEL_ENV=preview VERCEL_DEPLOYMENT_ID=dpl_… CONTENT_ENV=preview`. Never seed a preview against the production branch.

6. Deploy, then sign in at `/admin/login` and run the hosted checks in `docs/verification.md`.

## Compatibility and verification

All direct versions are exact; the lockfile pins transitive dependencies.

| Area             | Pinned versions                                                                                |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| UI/runtime       | Next 16.3.8, React/DOM 19.3.0, TypeScript 5.9.3, Tailwind/PostCSS 4.3.3, GSAP 3.15.0           |
| Auth             | next-auth **5.0.0-beta.32**, bcryptjs 3.0.3                                                    |
| Persistence      | @netlify/database 2.0.1, @netlify/blobs 11.1.3, @vercel/blob 2.8.0, Drizzle 0.45.3, drizzle-kit 0.31.11, pg 8.23.1 |
| Validation/media | Zod 4.6.5, sharp 0.35.5                                                                        |
| Local tests      | PGlite 0.5.8, PGlite Socket 0.2.11, tsx 4.23.15                                                |

The [documented Auth.js App Router setup](https://authjs.dev/getting-started/installation) uses v5 beta; this release is explicitly pinned, not described as stable. Password limits follow [bcryptjs documentation](https://github.com/dcodeIO/bcrypt.js). PGlite is a dev-only local PostgreSQL engine, not a deployed service or production fallback.

```powershell
npm run typecheck
npm test
npm run build
npm run test:http
npm run test:standard
```

Tests exercise real Auth.js Credentials/CSRF/JWT/logout and the same Drizzle repository SQL against persistent local PostgreSQL. The HTTP fixture starts an isolated production app with ephemeral fictional hashes and checks unauthorized routing, without external credentials. These checks do not prove Netlify connectivity. Restricted Windows sandbox system-user lookup can require permission for tsx/drizzle-kit. See `docs/verification.md` for evidence and hosted blockers.

## Standard local review and phase boundaries

After `npm run build`, run `npm run review:standard` and open http://localhost:3110. This explicitly starts an isolated persistent local PostgreSQL fixture with fictional published data, a distinct draft and another site. It is a test harness, never a production content fallback or a Netlify verification. Enter `empty`, `single`, `missing-media`, `disabled` or `default` in that terminal to publish a QA variant; reload the page. Stop with Ctrl+C. Test data stays in gitignored `test-results/standard`.

The HTTP suites now use this database-backed harness. See [M2 verification](docs/m2-verification.md) for evidence and remaining limitations. Bencho geometry and accordion falloff were adapted with responsive/keyboard/swipe safeguards; no autoplay runs. System reduced motion and the carousel’s Still view provide a static presentation. Full MIT attribution is in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). No Bencho images, fonts or branding are bundled.

M1 gaps against the newer PRD v1.3: password login has no TOTP challenge, replay protection or Bencho login controls. M2 preserves that flow as requested. The migration/seed CLI now uses an async entry point compatible with the pinned tsx configuration. The checked-in migration itself runs successfully in the local verification harness. No hosted integration, deployment or source-ZIP verification is claimed.

## M3 Signature layout

Signature now has an independent published-content renderer with the reference-derived cream/taupe/red layout: desktop rail and horizontal story composition, staggered listings, vertical details, grayscale other-room strip, next-page cards and a mobile red menu. Set server-only `TEMPLATE_VARIANT=signature`; no visitor switcher is exposed. The M2 Standard renderer and M1 authentication remain intact. M3 evidence records the layout before M4 interaction work.

After a production build, `npm run review:signature` opens the isolated local PostgreSQL review workflow at http://localhost:3112; `npm run test:signature` verifies its production routes and data isolation. The review harness accepts `long` in addition to the M2 QA variants. See [M3 verification and reference comparisons](docs/m3-verification.md). Local fixtures do not verify hosted Netlify services.

## M4 Signature interaction

Signature now carries native scrolling through the desktop horizontal story into a portrait next-page scene, expands the published destination photograph and advances without a required click. Mobile remains vertical. The ordered Story collection supports stable IDs, enabled panels and reordering; its distance is measured from rendered geometry. Culture Bali has a dedicated editorial index and detail routes. A retained decoded-image handoff prevents blank routing frames; history/gesture guards prevent accidental repeat commits. The menu reveals from the left with staged image/text movement and Bencho Dock-inspired proximity on its text links. System reduced motion remains supported. See [the latest Story, Culture and Dock verification](docs/m4-story-culture-dock.md) and [the earlier fidelity revision](docs/m4-fidelity-revision.md).

See [M4 verification](docs/m4-verification.md) for earlier reference mapping and [the latest revision](docs/m4-story-culture-dock.md) for the new schema, comparisons, checks and limitations. The custom CMS editor remains M5; M6 packaging/deployment remains out of scope. `npm run build` uses Next 16's documented Webpack option because Turbopack's PostCSS worker exits unexpectedly on this Windows host.

The Signature review terminal also accepts `one-room`, `two-rooms`, `story-one`, `story-reordered`, `story-long`, `culture-disabled` and `culture-reordered`; enter `default` to restore the Signature reference comparison publication (Standard retains its fictional baseline). `npm run review:signature:slow` starts an isolated fixture at 3116 behind a local proxy at http://localhost:3114 that delays RSC and image responses by 1.5 seconds. Use it separately after a production build, then stop with Ctrl+C. This is a development-only continuity check against real local published content, not a Netlify integration or production fallback.


## M4 Our Story composition rebuild

The Signature comparison fixture now publishes the complete Tandjung Sari Story sequence, using ten distinct constrained compositions plus the next-page scene. Its measurements, numbered reference/after images and acceptance notes are in [the composition rebuild report](docs/m4-story-composition-rebuild.md). The reference dataset is separate from fictional villa seed content in `src/lib/content/signature-reference-demo.ts`; rendering reads the configured site's published snapshot only.

To seed this dataset into an explicitly selected **empty Signature comparison scope**, set server-only `TEMPLATE_VARIANT=signature`, `SITE_ID`, `CONTENT_ENV`, deployment context and `DATABASE_URL`, run migrations, then `npm run db:seed:reference`. This command does not overwrite existing drafts or publications. Existing deployments need a deliberate content publication through the authorized repository workflow; rerunning seed is not an update mechanism. The new optional composition fields live in validated JSON snapshots and require no additional SQL migration. Existing generic Story fields remain schema-compatible; the new renderer uses `signatureStory.sections`.

The local Signature review also accepts `story-timeline-one` to test changing timeline geometry, `story-one`, `story-reordered`, `story-long` and `missing-media`. Enabled sections and ordered entries determine actual rendered distance; no panel count is assumed. Current demo rendering is static-image only. Optional video metadata defaults disabled; valid supported HTTPS MP4/WebM and a poster are required if enabled. Playback, upload/transcoding and CMS toggles remain later-phase work, and enabling metadata currently does not instantiate or load a video player.

Reference photographs, copy and measured webfonts are included for private comparison as requested. Their commercial redistribution rights have not been established; replace them with licensed villa assets before deployment or final source-ZIP distribution. Bencho MIT notices remain in THIRD_PARTY_NOTICES.md.

### M4 evening correction and local performance review

See [desktop/mobile corrections and actual browser traces](docs/m4-evening-story-correction.md). The requested 60 Hz profile remains unverified; measured 165 Hz results include remaining handoff stalls. Geometry is cached and automatic handoffs retain only the next scene; mobile Story and long timeline text remain content-driven.

For optional local diagnostics, set server-only `SIGNATURE_PERFORMANCE_REVIEW=1` before `npm run review:signature`. The recorder renders only with `CONTEXT=local`; Ctrl+Shift+P starts and Ctrl+Shift+S stops. Results appear in the local DOM script `#signature-performance-report` with no network transmission. Export its JSON to the evidence directory, then run `node scripts/summarize-signature-performance.mjs`. Do not enable this diagnostic flag in hosted deployments. The isolated recording viewer in `scripts/reference-review-server.mjs` is an analysis tool only and is not imported or served by the villa website.

### M4 Signature Bungalows review

Run `npm run build`, then `npm run review:signature`. Open http://127.0.0.1:3112/rooms or http://127.0.0.1:3112/rooms/village-bungalow. Five additional detail routes use the corresponding bungalow slugs. The local production fixture publishes the replaceable reference dataset into isolated PostgreSQL; it requires no hosted credentials. [Rooms correction report](docs/m4-rooms-rebuild.md) includes the measured desktop panel map and validation limits. Optional `signatureRooms` and `rooms[].signature` metadata is validated JSON; M5 owns editing controls. Existing seed/deployment content is not overwritten. No video is served by the demo.

### M4 Signature Culture review

Run `npm run build`, then `npm run review:signature`. Review http://127.0.0.1:3112/cultures and its ten linked `/culture/{slug}` details. The separate `signature-culture-reference.ts` comparison seed contains ordered, enabled, stable-ID editorial sections. Optional fields remain compatible with existing published JSON; no SQL migration or CMS editor is required in this phase. [Culture rebuild evidence and limitations](docs/m4-culture-rebuild.md) include sequential measurements, mobile captures and actual production observer traces. Regenerate comparison/report artifacts with `node scripts/report-culture-evidence.mjs` after collecting browser evidence. The demo remains static-image only.

### M4 Signature Dining review

Start `npm run build`, then `npm run review:signature`. Open http://127.0.0.1:3112/dining and `/restaurant-menu#breakfast`, `#all-day-dining`, `#drinks`. The optional structured Dining comparison seed supplies complete desktop/mobile menu pages, ordered categories/offers and stable IDs through the normal published accessor. Download is hidden until a real valid file is configured. [Dining rebuild report](docs/m4-dining-rebuild.md) documents sequential evidence, measurements, validation and remaining differences. No CMS editor or video playback is added.

### M4 Signature Foundation review

Run `npm run build`, then `npm run review:signature`; open http://127.0.0.1:3112/foundation. Optional `foundation` published JSON supplies six constrained layout types and ordered enabled sections/program entries with stable IDs and image focal metadata. Disabled or empty modules return404 and disappear from the menu/sitemap. The optional field is compatible with existing snapshots; no SQL migration is needed. The separate comparison seed never overwrites existing customer drafts/publications. No video, payment UI, automatic next-page handoff or CMS editor is added. See docs/m4-foundation-rebuild.md for evidence and limits. Local QA stdin supports foundation-reordered, foundation-long, foundation-single, foundation-disabled and default (restore).

### M4 Signature Packages & Activities review

Run npm run build then npm run review:signature; open http://127.0.0.1:3112/packages and /packages/seaside-wedding-and-honeymoon, /packages/hideaway-stay, /packages/stay-and-dine. Five ordered entries and three structured offer details use the existing site-scoped published accessor. Cooking Class/Kado have configured external enquiry links. All current enquiries are example.com demo destinations; configure real validated HTTPS/WhatsApp destinations before deployment. Optional signaturePackages/packages[].signature JSON is compatible with old snapshots; no SQL migration or M5 editor was added. Rates are labelled reference-demo content. See docs/m4-packages-rebuild.md for timestamped comparisons, production observer measurements and remaining differences. Local review QA stdin supports packages-long, packages-reordered, packages-single, packages-empty, default (restore).

### M4 Signature Getting Here review

Run npm run build then npm run review:signature and open http://127.0.0.1:3112/location (canonical route). Optional signatureLocation published JSON supplies replaceable contact/map/media fields and ordered enabled stable-ID destination/note rows. Compatible with existing snapshots; no SQL migration or CMS editor. The newsletter defaults disabled and is always omitted in normal rendering. The isolated local comparison alone may show its inert visual with an unavailable status, disabled controls and no form/submission handler; no email collection or subscription service. Reference phone/email and distances are comparison content, not live villa estimates. See docs/m4-getting-here-rebuild.md for timestamped comparisons, measurements, browser checks and performance limits. QA stdin supports location-long, location-reordered, location-single, location-empty, location-disabled, location-newsletter-off, default (restore).

### M4 Signature Terms & Conditions review

Run `npm run build` then `npm run review:signature`; open `http://127.0.0.1:3112/terms`, or `/terms#guaranteed-reservations`. Optional `signatureTerms` published JSON contains enabled/title/description and ordered sections with unique stable IDs, enabled flags, titles, constrained paragraph/list bodies and an optional compact heading gap. No HTML/JavaScript blocks or M5 editor. The same enabled collection supplies anchors and article order. Disabled/empty modules disappear from Signature navigation/sitemap and return404. Legacy snapshots and Standard retain the existing `terms` string; no SQL migration is needed for this optional JSON addition. Complete reference policy text lives only in `signature-terms-reference.ts`, consumed by the explicit comparison seed/local fixture; it is not automatically applied to customer sites. Existing idempotent seeding does not replace customer drafts/publications. Local QA commands: terms-long, terms-reordered, terms-single, terms-empty, terms-disabled, default (restore). Evidence/limits: `docs/m4-terms-rebuild.md`. No public video or external integration.

### M4 Signature Gallery comparison

See docs/m4-gallery-rebuild.md and docs/reference-gallery/panel-map.md. Local review: npm run build then npm run review:signature; open http://127.0.0.1:3112/gallery. The optional signatureGallery JSON collection is compatible with old snapshots and needs no SQL migration. Explicit seed-reference uses the isolated reference dataset; normal seeding preserves customer content. Array order controls photos; clear/update optional reference viewerOrder when reordering in a future CMS. No guest comments, public video or M5 editing UI. Standard gallery remains separate.

### M4 Rooms gallery mechanics/readability repair

Motion14.0.0 is pinned for the owner-supplied ExpandableGallery shared-layout mechanism (React18/19 peers), with LayoutGroup and stable room/photo layout IDs, spring160/18/1. CSS owns DynamicGrid tracks (1.95/0.9,500ms) and separate700ms hover scale; GSAP page/menu navigation does not control gallery transforms. Intro alone restores the retained measured asymmetric composition. Review: npm run build then npm run review:signature, http://127.0.0.1:3112/rooms. QA room-grid-six now joins0/1/3/9 fixture cases. No M5/deployment.

## M5 custom CMS

Current account/content workflow supersedes earlier M1/M4 descriptions of a future editor: see [M5 setup and coverage](docs/m5-custom-cms.md). Exactly two env-configured accounts now require password plus authenticator TOTP. Privately run `npm run accounts:provision`, configure `.env.example`, run migrations/seed, then build/start. `npm run review:cms` provides persistent local PostgreSQL CMS review at http://localhost:3112/admin/login after provisioning. Local Blobs are not emulated. No credentials are included in source/handoff.


## Offline local CMS demo

Run `npm ci`, `npm run build`, then `npm run demo:local`. Public: http://localhost:3112/ · Admin: http://localhost:3112/admin/login · local-only login: **admin / admin** (no OTP). Persistent PostgreSQL and real filesystem images live in ignored `local-data/signature`; first startup adopts a copy of the previous CMS store. Hosted authentication/storage remain unchanged. See [local setup, content coverage and backup/restore](docs/m5-local-demo.md). Stop before backup: `npm run demo:data -- backup my-villa-backup`.

### M5 studio and live preview
See [CMS UI and live preview](docs/m5-cms-ui-live-preview.md). Unsaved preview uses the authenticated public renderer without autosave. Open local admin with npm run demo:local, edit → live preview → Save Draft → explicit Publish. Owner data is retained.

### Windows offline launcher
Double-click Start-Villa-Demo.bat after the one-time Node24/npm ci/build setup. Read [Windows setup and safe shutdown](docs/windows-offline-launcher.md). Launch reuses only this project's verified server and preserves local-data. Press Enter to stop safely.

