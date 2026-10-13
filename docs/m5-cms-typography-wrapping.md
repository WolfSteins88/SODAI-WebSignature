# M5 CMS typography and wrapping repair — 12 October 2026

The Rooms → Photos → Gallery row split “Gallery 1” inside a word because a nested 130px card left only about 36px for its label and inherited `overflow-wrap: anywhere`. Nested cards now reserve 220px, including a stable thumbnail and controls, leaving 126px for the title at the unchanged 13px font size. The label renders on one line. Gallery collections remain horizontally scrollable inside their panel.

Shared UI labels use natural word wrapping without automatic hyphenation. Short collection labels stay on one line. Longer list titles use up to three natural lines with an ellipsis; the row retains its full accessible name and title, and the selected editor shows the full text. Emergency wrapping remains scoped to technical data such as filenames, URLs, validation messages and diagnostics. Toolbar actions, tabs, form labels and confirmation dialogs adapt to narrow screens without page-level horizontal overflow.

Changed `src/components/admin/editor.css`, `src/components/admin/studio.css`, and `src/components/admin/editor.tsx`. No content schema, account, public site, or image Update/Delete changes were made.

## Verification

- Final `npm run build` passed, including Next.js TypeScript validation. `npm test`: 66 passed, 0 failed.
- Production browser: all 16 CMS menu sections visually inspected, including nested Gallery, Story, Rooms, Media, Settings, and operational panels.
- Checked 1586×992, 1269×794, 1024×768, 793×496, and 360×800 CSS viewports. At 360px, keyboard Enter selected Gallery 2 and document width remained 360px. A 390px confirmation dialog stayed within the viewport.
- Long room and page names were tested without saving. The final long room list row stayed at three 19.5px lines; its full name remained available in the selected editor and accessible label.
- The owner's original Draft 9 / Live 9 and six rooms were verified after discarding the unsaved trial. No owner content was saved or published.

Native browser zoom shortcuts had no effect in the available in-app browser; 125% and 200% zoom were **not verified**. The 1269px and 793px captures demonstrate comparable CSS reflow only. Physical touch was not tested. The named `Screenshot 2026-10-12 202510(2).png` was unavailable, so the exact reported defect was reproduced and measured in the running app.

Evidence: [before](evidence/m5-wrapping/gallery-before-1586.png), [final owner Gallery](evidence/m5-wrapping/gallery-final-owner-1586.png), [long title](evidence/m5-wrapping/long-title-final-1586.png), [360px Gallery](evidence/m5-wrapping/gallery-mobile-360.png), [390px dialog](evidence/m5-wrapping/dialog-mobile-390.png).

Local review: `http://localhost:3112/admin/rooms` → Photos → Gallery. The server is running. To restart it later, run `npm run demo:local` from the project root.
