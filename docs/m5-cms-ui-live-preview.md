# M5 CMS UI and live preview

## Owner workflow
Open http://localhost:3112/admin/login (offline runner account: `admin` / `admin`). Choose a section, select an item, and edit. The right pane renders unsaved content; **Save Draft** persists privately; **Publish** explicitly publishes the saved snapshot. Existing owner content is preserved. Startup: `npm run demo:local`. Stop before running another production build. No deployment or M6 work is included.

Grouped navigation replaces the flat button list. Collections show compact title/status/thumbnail rows and one selected form. IDs/geometry are optional protected details; order uses drag plus keyboard Move Up/Down. Local removal has Undo; Save Draft derives archives from the locked prior snapshot in the same transaction. Reload, logout, browser exit, restore and publish retain confirmation/conflict behavior. Dashboard has no Save Draft. Standard-only controls are hidden on Signature and vice versa.

Desktop uses an adjustable 32–55% preview, collapsible without unmounting. Narrow screens use Editor/Preview tabs; input and preview state remain mounted. Preview Desktop/Mobile settings use actual1280×900/390×780 iframe CSS viewports scaled to fit. Open Preview opens a larger authenticated window linked to current unsaved values. Saved draft remains a separate link.

## Rendering and boundaries
`/preview/live` authenticates the existing session. The editor sends a strict, bounded structured envelope with exact-origin/source checks, an ephemeral UUID channel, scope, session version and monotonic sequence. An encrypted bound server action rechecks authentication, principal/site/version/channel/origin, validates the snapshot and checks scoped ready images on every render. The action returns the actual Standard/Signature React component tree through Next's RSC transport. The browser updates the existing tree rather than reloading the iframe. Text is debounced300ms, only one request runs per surface, and queued older updates are coalesced. No override is saved, cached publicly, published or authorized as public media.

Incomplete fields use explicitly announced saved-value fallbacks where schema repair is possible; otherwise preview is marked paused/stale with Retry. Form state stays usable. Uploaded replacements use real validation/storage results and private image delivery only after readiness. Routes disabled in unsaved values show Page unavailable. Route changes reset preview intentionally; same-route updates retain scroll and coalesce existing geometry refresh through resize. Signature intro is disabled by the existing preview flag. The full site snapshot is validated server-side per update, trading network/server work for rendering parity and strong boundaries; slow hosted requests can increase preview latency. No60fps claim.

The preview action is limited to768KiB below Next's1MiB request default. Public `/` remains on the site-scoped published accessor. No preview authentication secret/token appears in URLs; the channel UUID alone grants no access. Existing private/no-store/noindex headers apply. Authentication, normal TOTP, Netlify providers and the explicit loopback local exception are preserved.

## Components and dependencies
Owner-supplied `discrete-tabs.txt` and `smooth-dropdown.txt` were inspected. Tabs reference React/Motion/cn; dropdown references React/Motion/Hugeicons/react-use-measure. Adaptation reuses pinned Motion14, local SVG, independent LayoutGroups and native semantic keyboard/focus controls. It avoids extra icon/measurement packages and shared animation properties with public GSAP. Reduced motion disables springs/stagger. Supplied files have no license header: provenance is recorded without inventing a grant. Existing Bencho MIT notices remain. Label Input, Reorder, upload dropzone, framing, confirmations and factual notifications retain real RHF/Zod/server bindings.

## Changed source
- Admin studio shell, collection selection, grouping, undo, dropdown, tabs, slot upload, responsive styles and logout guard.
- New authenticated live preview page/action/surface/pane and pure envelope/fallback validation.
- Repository archive-on-save derivation and focused validation/archive integration tests.
- Documentation, notices and persistent checkpoint.

## Verification record
See `implementation-progress.md` for final run IDs and `m5-cms-ui-validation.md` for browser conditions/results. Early production browser checks verified real login, unsaved identity rendering, section retention and Navigation draft-only save. Unit/integration suite52 tests passed before the supplied visual adaptation. Initial archive test assertion was corrected to match the unrestored-only accessor. UseLayouts website Code tabs required login; supplied source subsequently replaced that blocker.

Hosted Netlify Database/Blobs verification remains blocked by absent provider credentials/context. Physical touch devices, exhaustive assistive technology and universal frame-rate behavior are not inferred from local browser checks. Owner performs visual acceptance.
