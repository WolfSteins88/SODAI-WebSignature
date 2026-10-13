# Bencho adaptations

`src/components/standard/carousel.tsx`, `accordion.tsx`, and their styles adapt the rotating-card geometry and flex-grow/image-crop patterns inspected in the TSX/CSS Code panes at:

- https://bencho.dev/blocks/carousel
- https://bencho.dev/blocks/image-accordion
- https://bencho.dev/?c=dock (cosine proximity falloff adapted to Signature text menu)

Inspected 5 October 2026. Licence source: https://bencho.dev/licence (updated 10 September 2026). Bencho photography, branding, fonts and surrounding application are not included. Responsive sizing, published data, controls and accessibility have been adapted for this project. React/CSS only; no extra animation runtime.

Dock Preview and Code inspected 6 October 2026. Its stationary hit areas, nearest-item cosine magnification, and smooth return inform `src/components/signature/navigation.tsx`. The adaptation uses text links, a restrained 1.14 maximum scale, a 1.06 keyboard focus scale, and no proximity effect on touch or reduced motion.

## MIT License

Copyright (c) 2026 Lorenzo Cabra

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Social platform SVGs: Simple Icons (https://github.com/simple-icons/simple-icons), CC0 1.0 Universal. Original notice: public/social-icons/LICENSE.md. Platform marks remain their respective owners’ trademarks. No configured accounts are supplied by the icon package.

## Motion14.0.0 — room photo shared layouts

Source: https://motion.dev/ ; installed official motion npm package.

The MIT License (MIT)

Copyright (c) 2024 [Motion](https://motion.dev) B.V.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


Room DynamicGridGallery/ExpandableGallery mechanics are adapted from the owner-supplied `dynamic-grid-gallery and expandable-gallery.txt` (useLayouts). That supplied text has no license header; its provenance is recorded here without inventing an MIT grant. The existing Bencho notices remain unchanged.

M5 admin interactions adapt Bencho Label Input, One-time Code, Upload Dropzone, Reorder List, Aspect Ratio, Inline Confirm and Notify (Lorenzo Cabra, https://bencho.dev/blocks/label-input, /one-time-code, /upload-dropzone, /liq-arrange, /aspect, /confirm, /toasts; Preview/Code inspected 9 October 2026). The Bencho MIT notice above applies to adapted portions. Real server verification/persistence replaces showcase answers, timers, fake upload progress and simulated undo. Framing previews do not alter fixed public layouts. Admin CSS/React behavior is isolated from public GSAP/Motion.

M5 UI revision: useLayouts Discrete Tabs and Smooth Dropdown adapted from owner-supplied discrete-tabs.txt and smooth-dropdown.txt (11 October2026). Source dependencies inspected: React, Motion, cn utility; dropdown additionally Hugeicons and react-use-measure. Reused pinned Motion14 only, replaced icons with local SVG and avoided measurement dependency. Kept semantic keyboard tabs/menu, independent LayoutGroup IDs, reduced-motion handling and cleanup. Supplied files contain no license notice; no MIT grant inferred. Bencho MIT notice above is retained. Source URLs: https://uselayouts.com/docs/components/discrete-tabs and https://uselayouts.com/docs/components/smooth-dropdown. Public GSAP untouched.

M5 login: SlideConfirm and Dynamic Island mechanics adapted from owner-supplied slide to confirm.txt and Dynamic Island.txt (12 October 2026). Reused pinned Motion14 (motion/react) instead of adding framer-motion/lucide. No demo timers/activities/assets or credentials copied. Slide geometry's pinned-right-edge morph and one-shape island spring retained; request state replaces simulated confirmation and real WITA clock replaces demo activities. Supplied text has no license header; no additional license grant inferred. Existing applicable Bencho MIT notice above retained.
