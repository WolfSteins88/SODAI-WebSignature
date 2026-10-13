# Reference inventory · 5 October 2026

Source: supplied desktop recording (1280 × 720, 310.03 s), mobile recording (512 × 1112, 88.40 s). Contact sheets in `docs/reference` cover consecutive frames at 5 s desktop / 2 s mobile. These are observation intervals, not exact interaction event times. Recording pixels include browser/phone UI and do not establish CSS viewport dimensions.

| Desktop interval | Observed behavior |
|---|---|
| 0–25 s | Large story hero; fixed taupe left rail (~50 recording px); cream story panels move horizontally, with alternating tall images, short captions and serif paragraphs. Two cream reservation buttons at top right. |
| 25–35 s | Taupe next-page field, centered image/title; image grows toward a room overview opener. |
| 35–45 s | Cream room listing with introductory text and staggered two-column cards; next-page field leads to dining. |
| 45–80 s | Dining and culture openers lead to cream staggered lists. Gallery next-page image expands. |
| 80–95 s | Red menu overlay: vertical image occupies roughly a third, links/contact occupy remainder. Return to rooms through a cream fade; loading blankness visible in reference. |
| 95–120 s | Room listing → room hero → vertical editorial detail, facilities, and full-width media. |
| 120–155 s | Taupe other-room strip; grayscale portrait thumbnails slide horizontally with centered active title. Selected room expands into hero; other details remain vertical. |
| 160–190 s | Menu → dining → vertically scrolling dining menus. |
| 190–245 s | Culture index and detail views; large openers and image/text compositions, repeated next-page pattern. |
| 245–275 s | Packages index and detail; facilities list and other-package strip. |
| 280–310 s | Menu → location/map → gallery/menu → story hero. |

| Mobile interval | Observed behavior |
|---|---|
| 0–14 s | Taupe top header with small circular mark/menu; hero then single-column vertical story. Booking bar visible on hero, absent through parts of story. |
| 14–24 s | Next-page opener → rooms overview and single-column cards. |
| 24–30 s | Room hero → cream details → large room image. |
| 30–44 s | Taupe other-room area: horizontal touch strip, grayscale crops and active room titles; booking bar reappears. |
| 44–54 s | Return through facilities to room overview; transition into dining. |
| 54–70 s | Dining/culture openers, single-column content, then gallery. |
| 70–80 s | Full red menu; long room sublinks and secondary menu scroll vertically; close control at top right. |
| 80–88 s | Packages opener and vertical cards, then gallery next-page card. |

## Implementation interpretation / unknowns

Cream #eeeadd, taupe #91836d, red #9c1922 are approximate visual interpretations, not sampled original CSS values. Use original Sodai wordmark, Georgia serif and system sans initially; original reference font licensing not established. Desktop story wheel-to-horizontal mapping inferred from panel progression; footage does not show wheel delta, so exact mapping is unverified. Mobile header approximately 64 recording px excluding status bar, side padding approximately 48 px in the recording. Implement at 64 / 28 CSS px respectively as responsive defaults, compare before fidelity claims.

Exact transition duration, browser Back/Forward, gallery lightbox behavior, focus and reduced-motion reference behavior remain unverified. Implement accessible defaults. Use shorter ~0.6 s menu reveal and preserve current page while routing as documented speed/accessibility adjustments. Booking visibility follows hero/other-room/next-page visibility instead of assuming always sticky. Do not reproduce phone status bars or Safari UI.
