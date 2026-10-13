# M5 CMS visual redesign — field and action map

Design contract: reproduce supplied three CMS references with a grey outer frame, white app/sidebar/cards, coral actions and selection, dark sans-serif text. Desktop has collection / selected editor / actual preview; mobile uses the existing accessible Edit/Preview tabs and a drawer. Overview has no iframe. Use actual content/status; preserve all schemas/endpoints and saved owner data.

| Existing area | New location |
| --- | --- |
| Section navigation / dirty guard / role restriction | Icon sidebar, collapse/drawer, real section search and account menu |
| Save / Publish / validation / reload / cache retry / saved preview | Persistent editor toolbar and More actions; overview review opens same guarded publish confirmation |
| Story stable IDs / layout / enabled | Selected section header, protected layout indicator, visibility field |
| Story title, date, eyebrow, headings, caption, body, note, alignment, timeline entries | Content tab; timeline entries retain nested image/content controls and all collection operations |
| Story image/logo/lead/final/inset/detail/decoration/poster metadata | Image tab (video poster in Video); existing image picker/upload/alt/focal controls |
| Story disabled video, source, poster | Video tab only where supported; disabled playback restriction retained |
| Room name/title, slug, description, body, capacity, area, image, signature hero/heading/body, related rooms | Content tab, labelled additional Signature wording/related controls |
| Room signature showcase/photoGrid/gallery and other galleries | Photos tab, same limits/metadata/media operations |
| Room facilities / inclusions | Amenities tab |
| Collection add/preset/select/order/duplicate/archive/undo | Thumbnail collection and selected actions, existing safeguards retained |
| All other content / social / media / history / diagnostics | Existing schema-driven fields and operations under shared visual tokens |
| Actual draft/published snapshots, timestamps, validation | Dashboard status/revision/date/changes/health cards; structural diff, never revision subtraction |
| Current published/private renderer preview and messaging | Existing PreviewPane, no fabricated website layout or intro remount on edit |

Implementation checkpoint is maintained in implementation-progress.md. No owner content reset, deployment or M6.

## Revised brief: compact structure across all menus

| Menu | Compact presentation / preserved access |
| --- | --- |
| Identity | Content-area category selector; one brand/name/logo/contact category at a time; dedicated existing Social Links editor retained |
| Navigation | Searchable registered destination list and selected label/destination/visibility fields; legacy preference remains separately discoverable; social settings in Identity |
| Pages & SEO | Searchable route/title list, selected Content and SEO tabs; registered route safeguards retained |
| Culinary | Selected Signature category/offer collection, Content / Media / Options; desktop/mobile menu image collections in Media |
| Culture / Foundation / Packages | Ordered thumbnail master-detail collections; Content / Media / Options, nested detail compositions reachable through contextual category navigation |
| Gallery | Items selected by default; selected image Media / Options, categories and shared settings in category selector |
| Getting Here | One existing contact/map/directions/location category at a time; collections retain selected entry editing |
| Terms | Selected section, expandable/selected body entries; one text entry open by default |
| Media | Search/filter thumbnail grid and selected asset metadata/framing/actions; no public iframe |
| Booking & modules | Existing settings category selector; no irrelevant public iframe |
| Revisions / Diagnostics | Compact list and selected details, restore/archive safeguards; no public iframe |

Room Content prioritizes name, slug, description, capacity/area and hero slots. Additional Signature wording and related rooms remain in a clearly named expandable group. Unmounted fields retain React Hook Form values; structural edits use the existing full snapshot generation/reset mechanism. Body arrays show one expanded row initially. No content schema, endpoint, authentication or public layout change.

Preview positioning is deferred until the actual server-rendered node commits and its Story measurement refresh has run; editing a field preserves position and selecting a new panel moves to it. The public renderer remains in its own authenticated document with the existing message validation and site/session scope.

## Verification and evidence (12 October 2026)

- Full suite:66 passing tests, including actual Auth.js credential/login/logout/revocation, both fixed roles, scoped PostgreSQL persistence, draft/media/environment isolation, TOTP, archive/restore/conflicts and new structural difference/search/grouping checks.
- Existing Standard and Signature HTTP suites pass: public deep links/404, publication changes, draft/site isolation, booking, disabled modules, SEO/sitemap/robots and empty/single galleries. Final production build includes TypeScript validation.
- Real production browser inspected every CMS menu. Representative isolated workflow: room text retained across Content/Photos/Amenities; saved draft survives restart; publish confirmation produces matching snapshots/zero pending changes; direct search selects Two-Storey; duplicate creates new slug; reorder, hidden configuration, validation rejection/recovery, archiveconfirmation and Undo; actual immutable upload/metadata/search and hero replacement saved privately. The browser chooser was unusually delayed; upload outcome was checked before any retry.
- Story selection positions the actual public Architecture panel after commit. Rooms selection routes preview to the chosen detail. Preview updates preserve the iframe/channel; no fabricated mock website. Mobile360/390 Edit/Preview, actual mobile viewport, drawer opening/Escape/focus return and no document horizontal overflow checked. Shared header/sidebar remain outside local scroll panes.
- All writes used isolated local-data/cms-visual-check (Draft5/Live2 after the final enabled-toggle check); original local-data/signature remains Draft9/Live9, zero pending changes. Test uploads and room copies are absent from the original dataset.

Evidence files in docs/evidence/m5-studio: Dashboard, Architecture and Village Bungalow at1586×992 CSS pixels; mobile Rooms360×800 and preview390×844. Original inline reference images used for comparison; filenames with “(1)” specified by revised brief were not present in Downloads. No exact pixel-equivalence claim: extra content/category selectors and action safeguards are retained, real public preview uses1280×900/390×780, and content, timestamps, long descriptions and image crops follow actual saved data. Arial/Helvetica is the current CMS stack; a reference font binary was not supplied. Visual acceptance belongs to the owner.

Remaining device/runtime gaps: physical touch, OS-level reduced-motion preference and new hosted OTP UI were not browser-tested this task; reduced-motion CSS and existing authentication checks are retained. Netlify hosted integrations/deployment were not tested. No M6 work.

Local review: http://localhost:3112/admin/dashboard (or /admin/login when signed out), /admin/story, /admin/rooms. Start from project directory with npm run demo:local. This uses saved PostgreSQL/filesystem data; do not reseed or delete local-data. Verify the PID in running.lock before restarting a stopped runner.

Final production12098 and standalone TypeScript24881 passed. Final browser confirms optional room enabled flag renders as Visible without changing saved content, toggles correctly and saves only on isolated dataset. Culinary menu images are in Media; keyboard tabs retain the same iframe channel; collapsed sidebar retains accessible names. Owner runner43200 is active on3112; original9/9 unchanged. Matched desktop evidence was recaptured with an explicit override on ownertab5, then the override was reset.
