# M1 verification — 5 October 2026

M0 reference specifications and frames are preserved. Previous editor/role checks are superseded.

## Completed local checks

- Next.js production build and TypeScript check pass.
- 13 tests pass, including persistent PostgreSQL/Auth.js integrations: idempotent seed, both fixed roles, stale write rejection, input validation, draft/public isolation, foreign scope/media rejection and preview namespace separation.
- Real Auth.js requests verify login/logout for both roles, wrong-password and CSRF rejection, Secure/HttpOnly/SameSite JWT cookies, and session revocation after version/environment/hash changes.
- Atomic rate limiting admits exactly ten of twelve concurrent attempts; counters and published content survive closing and reopening PostgreSQL. Expired windows reset, and independent scopes do not share quotas.
- Active database contains only five content/limiter tables, no accounts or sessions; the Drizzle migrator runs twice without duplicate changes.
- Production HTTP fixture passes login rendering, protected dashboard/preview redirects, unauthorized GET/POST rejection, no-store responses, one Credentials provider, foreign Origin rejection and absent account/editor routes.

Integration tests use PGlite PostgreSQL locally, not Netlify Database. Production-app HTTP checks cover actual routing and unauthorized requests, not live-database browser sign-in.

## Live blocker

Netlify CLI reports **Not logged in**. There is no authenticated linked project, selected Netlify Database connection or Blobs runtime context available. No services or deployments have been provisioned by this task.

Once access exists, verify both deployments: reviewed migration/seed on the correct branch/scope; browser login/logout for Owner and Super Admin; function-instance persistent throttling and redeployment session revocation; missing/foreign/stale-session API rejection; draft/public isolation and persistence after restart/redeploy; Netlify Database branching and scoped Blobs read/write/delete.

Full editor, completed public layouts, complex motion and public media delivery are deferred to later phases. No hosted integration is claimed verified.
