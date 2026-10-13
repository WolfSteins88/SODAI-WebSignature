# Windows offline demo launcher

Updated 13 October 2026. Double-click root **Start-Villa-Demo.bat**. Logs remain visible; the default browser opens only after database, website and private project identity handshake are ready.

## First-time setup (online)

1. Install Node.js **24 LTS**, including npm. Tested on Windows with Node **24.19.0**. Keep the complete project including public assets, drizzle migrations, scripts and lockfile.
2. Open PowerShell in the project folder and run:

   ```powershell
   npm ci
   npm run build
   ```

   Include development dependencies: the runner uses pinned tsx/PGlite packages. Do not use `--omit=dev` for the offline demo.
3. Double-click **Start-Villa-Demo.bat**. Site: **http://localhost:3112/**. CMS: **http://localhost:3112/admin/login**. Existing local-only login: **admin / admin**.

No separate PostgreSQL installation/service, Docker or Netlify credentials are required. The existing runner starts embedded PostgreSQL and its loopback socket. Hosted authentication is unchanged.

## Normal use and stopping

Normal launch performs no install, build or remote download. Keep the console open. **Press Enter or Ctrl+C to stop safely**, then wait for it to exit. Window X, Task Manager or power loss can bypass asynchronous cleanup; use Enter for the verified flushed shutdown.

Repeated launches reuse only a live runner matching this project, dataset, port, PID and random-token loopback handshake. A generic HTTP200 is insufficient. Conflicts fail without opening another app or killing processes. Live/ambiguous PID locks fail closed. Only a provably dead PID lock is recovered; database/media content stays intact.

Optional PowerShell commands:

```powershell
.\Start-Villa-Demo.bat --stop       # safely stop this verified project/dataset
.\Start-Villa-Demo.bat --no-browser # logs/server without browser opening
$env:LOCAL_DEMO_PORT='3118'         # optional; default3112
.\Start-Villa-Demo.bat
```

Use matching port/dataset settings for reuse and `--stop`. Leave `LOCAL_DEMO_DATASET` unset for your existing owner store. It is available for isolated verification. `npm run demo:local` remains supported and exposes the same handshake for BAT reuse.

The BAT resolves its own project folder, including spaces. Node and Windows PowerShell must be on PATH for browser opening. If browser opening fails, the ready URL is printed and server remains available. Missing build/dependencies, invalid configuration, hosted markers and port conflicts report actionable errors; BAT pauses on failure.

## Persistence and offline boundaries

- Existing content, drafts, publications, uploads and auth hashes remain under `local-data/signature`. No reset/reseed action is added; existing migrations and empty-site-only seeding remain idempotent.
- `running.lock` stores the PID; `running.json` contains ephemeral loopback identity/token. Both are removed on safe stop. Do not share the latter while running. Existing stopped-store backup command remains `npm run demo:data -- backup backup-name`.
- Bundled images, fonts, scripts, database, authentication and filesystem uploads are local. Owner-configured external photos/documents require local replacements for offline use. External booking/maps/social destinations still need internet when followed.
- Normal launch has no hosted Netlify dependency. This does not verify Netlify integration or perform M6/deployment work.

## Verification

Actual Windows BAT checks from the project path containing spaces: custom3117 startup, duplicate reuse, conflicting dataset rejection, dead-PID recovery, Enter exit0 and lock/control-file removal. Isolated real API tests passed login/logout, anonymous rejection, draft privacy, save/publish, upload/readback, restart with exact media bytes and backup/restore.

The same suite passed with Node outbound connections blocked and only loopback allowed:

```powershell
$env:NODE_OPTIONS='--require "D:/Dio Files/Files/Apps/Sodai Web Villa/scripts/verify-offline-network.cjs"'
npm run test:local
Remove-Item Env:NODE_OPTIONS
```

This guard is test tooling and is never enabled by normal startup. It does not change Windows adapters. Physical adapter-off use of the default browser remains an owner check; Node blocking/local asset audits do not establish that entire browser condition. Results are in `docs/windows-offline-launcher-checks.json`.
