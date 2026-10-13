# M5 local demo and content replacement

This revision adds an explicit offline local mode. Hosted deployments retain Netlify Database/Blobs and the two-account password plus TOTP flow. No M6 deployment or dataset synchronization is included.

## Start

Install pinned dependencies with `npm ci`, then `npm run build` and `npm run demo:local` from the project root. Node 24 is the tested runtime. Open **http://localhost:3112/** and **http://localhost:3112/admin/login**. Login **admin / admin**. The server binds only to 127.0.0.1; use localhost consistently for origin-bound authentication. Stop an older server occupying3112 first. No Netlify credentials or authenticator enrollment are required for this mode.

The runner sets server-only LOCAL_DEMO=1, LOCAL_DEMO_RUNNER=loopback-v1, CONTEXT=local, CONTENT_ENV=local-demo, SITE_ID=local-demo-signature, MEDIA_PROVIDER=filesystem, CONTENT_MODE=live, TEMPLATE_VARIANT=signature, loopback AUTH_URL/DATABASE_URL and LOCAL_DEMO_DATA_DIR. It generates/persists a bcrypt12 hash and random auth secret in ignored runtime-secrets.json. Plaintext passwords are never persisted or logged. This intentional demo identity is one Super Admin, not a hosted account-management feature.

Configuration rejects deployed Netlify contexts, deployment IDs/URLs, Blobs context, Netlify Database URL and common function/hosting markers even with LOCAL_DEMO set. Incomplete flags, non-loopback origins/databases and data paths outside local-data fail closed. Request Host and NODE_ENV do not grant the exception. Normal mode still requires both configured account hashes and TOTP secrets. Persistent login limits, Auth.js CSRF/JWT, revision/site/version checks and mutation origins remain active.

## Persistent data and recovery

- `local-data/signature/database`: local PostgreSQL (PGlite) through the existing Drizzle schema/migrations.
- `local-data/signature/media/villa-<scope hash>/<immutable UUID>.webp`: validated/re-encoded actual image bytes. PostgreSQL holds metadata/readiness/references. Draft bytes require authentication; published referenced bytes are public.
- `local-data/signature/runtime-secrets.json`: private local auth material, excluded from backups.
- `local-data/signature/running.lock`: prevents backup while running and duplicate dataset use. After a crash, verify the recorded process and server are stopped before removing this lock.

On first startup only, an existing `test-results/standard/cms-signature` database is copied and adopted into the new scope. The original store remains untouched. Existing drafts/publications/revisions/archives/media metadata are preserved. Previous failed Blobs uploads have no bytes to recover; re-upload them locally. Successful external images are not automatically downloaded. Subsequent startups/migrations/builds use the existing snapshot; seed inserts only into an empty site and never resets edits. Local data is ignored by Git and independent of `.next` and disposable QA output.

For a consistent backup, stop the demo, then `npm run demo:data -- backup my-villa-backup`. It pairs database/media under `local-data/backups/my-villa-backup`, excluding runtime credentials. Keep a copy outside the project yourself. To restore, stop the server, move the existing `local-data/signature` directory aside, then run `npm run demo:data -- restore my-villa-backup`. Restore refuses to overwrite an existing directory. Restart regenerates auth secrets, invalidating old sessions. Commands accept optional final `standard` instead of `signature`. No automatic Netlify sync is promised.

## Replace content

Upload JPEG/PNG/WebP (4MB max) in Media; set meaningful alt text/caption/focal point. Choose the ready library image in each content slot. Replacement uploads get new immutable IDs. Archive hides images from selection; referenced images cannot be deleted. Frame previews do not change approved public dimensions.

Identity → Shared identity slots is optional. Configure it and enable **Use shared slots** to apply selected logo/emblem/wordmark to menu/loading, Story introductory logo and rail. Clear nullable slots for a neutral fallback; no old reference branding is substituted. Existing split-logo frame bounds remain fixed. Enable **Use shared hero** to make the configured root Story hero image/title drive the opener. Without these options, independently editable existing slots retain their content. Menu photo, legal text, social URLs and other authored content still have their own explicit fields.

Save Draft → Preview saved draft → Publish. Preview uses the saved private snapshot; a save does not change public content. Reload loads the saved draft. Stale concurrent writes return409 and retain unsaved edits. Revisions restore into a new draft. Publish updates the snapshot/history/audit together; retry cache refresh if the reported refresh failed.

| CMS group | Public content slots |
| --- | --- |
| Identity | Property name/tagline; shared logo/emblem/wordmark; independent menu/loading assets, menu photo/contact title/email/social/legal/credit; address/email/map |
| Navigation | Stable routes, labels/order/visibility; enabled pages and SEO title/description |
| Story | Hero/title, intro/story copy, legacy panels; all ordered Signature compositions, dates, logos, captions, timelines, photographs, closing and next-page title; disabled video configuration |
| Rooms | Listing introduction/hero/ornament; rooms/slugs/capacity/area/copy/inclusions/facilities/showcase/photo grid/gallery/related rooms |
| Culinary | Title/hero/editorial introduction; categories/offers/menu images/download links, enabled/order |
| Culture | Listing introduction/hero; ordered cultural detail sections, images, captions, Discover More/next destination; optional experiences |
| Foundation | Hero/title and typed editorial sections/programs/initiatives |
| Packages | Listing/detail sections, inclusions/terms/pricing/enquiry links/images/order |
| Gallery | Category labels/visibility and photos/captions/associations/order |
| Location / Terms | Getting Here editorial/contact/map/distances/travel/newsletter configuration; typed policy sections and anchors |
| Copy | Shared public headings, facility/action/navigation labels |
| Standard / Booking | Existing Standard amenities/testimonials data; booking/WhatsApp settings, module flags and footer Admin link |
| Media / Revisions | Real upload/selection/alt/caption/framing/archive/reference checks; publication history and archived entries |

Fixed layout geometry/timing, stable IDs and generic accessibility labels remain code-owned. Existing Standard frontend limits remain; no new testimonials/frontend module or arbitrary page builder is added. Story opener stays pinned, arrays support typed CRUD/order/visibility, room photo grid allows at most nine enabled photos, video stays disabled, Culinary asymmetry and removed booking buttons are preserved. Next-page scene labels follow configured navigation/page titles and destination media follows published page data. Metadata includes saved SEO overrides for title/Open Graph/Twitter.

## Verification and limits

`npm test`, `npm run typecheck`, `npm run build`, `npm run test:local`, `npm run test:standard`, `npm run test:signature`. For a rebuild persistence test use `$env:LOCAL_DEMO_VERIFY_REBUILD='1'; npm run test:local; Remove-Item Env:LOCAL_DEMO_VERIFY_REBUILD` in PowerShell. The integration test creates a separate ignored verification dataset, never edits the owner's store, and records results in `docs/m5-local-demo-checks.json`.

Admin uses local assets/fonts and no CDN scripts; uploaded images and content/auth operations use loopback only. Existing remote photos and configured external booking/map/social/PDF destinations require networking. They are not silently downloaded. Physical network-off browser operation, every form on touch devices and Netlify live credentials remain separate verification limits; local success is not proof of hosted storage. Owner performs final visual review.

### Completed checks (10 October 2026)

- Final production build44889 and TypeScript87774 passed;49 regression tests passed. Final Standard/Signature HTTP suites passed (954813/71532).
- Isolated real API workflow39279 passed login/wrong/logout; upload/readiness/draft privacy; save/reload/private preview/public isolation;409; Story add/disabled/reorder, room photo changes, hidden social link and Culture introduction; publication/metadata/menu/hero/next label; referenced-delete rejection; draft-only restore; restart/exact bytes; stopped backup/restore excluding secrets. Latest machine-readable results: m5-local-demo-checks.json. Earlier workflow5403 separately rebuilt the production app between stopping/restarting the same dataset and verified the same published hero and exact WebP bytes afterward.
- Production browser verified wrong-password error, direct admin/admin Super Admin login withoutOTP, form save/reload, real filesystem image metadata, logout and rendered replacement hero/title/next-page label. Evidence07-local-demo-dashboard.png and08-local-media.png under m5-evidence.
- Final owner review server63827 runs http://localhost:3112/ and /admin/login, bound127.0.0.1. Adopted the prior store copy and browser confirmed draft8/published8 unchanged. Evidence09-preserved-local-dashboard.png. Original store untouched. All content-edit verification used isolated datasets.
- No physical networking shutdown was performed. Local API checks used only loopback; runtime/admin fonts and scripts are local, but configured remote photos/links still require internet. Real Netlify storage/migrations, exhaustive touch/mobile form coverage and owner visual approval are unverified. No M6.
