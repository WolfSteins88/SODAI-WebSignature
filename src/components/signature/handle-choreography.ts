import {gsap} from 'gsap';

// Measured from Handle Navigation.mp4. All callers use this timeline, not a
// separately timed approximation of its horizontal mask and photograph settle.
export const HANDLE_REVEAL = {
  mask: .95, maskEase: 'power3.inOut', photoAt: .15, photo: 1.1,
  photoEase: 'power3.out', photoX: -18, photoScale: 1.15,
  contentAt: .2, content: 1, labelsAt: .4, labels: .7, stagger: .045,
  rail: .45, handle: .4,
} as const;

type Layers = {
  mask: HTMLElement;
  photo?: Element | null;
  content?: Element | null;
  labels?: Element[];
  rail?: Element | null;
  railFrom?: string;
  railTo?: string;
  handle?: Element | null;
  handleOpen?: boolean;
  callbacks?: gsap.TimelineVars;
};

/** Paused, reversible timeline. Caller owns readiness, route commit and cleanup. */
export function handleRevealTimeline(layers: Layers) {
  const t = HANDLE_REVEAL;
  const timeline = gsap.timeline({paused:true, ...layers.callbacks});
  if (layers.rail && layers.railFrom && layers.railTo)
    timeline.fromTo(layers.rail,{backgroundColor:layers.railFrom},{backgroundColor:layers.railTo,duration:t.rail,ease:'power2.inOut',lazy:false},0);
  timeline.fromTo(layers.mask,{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)',duration:t.mask,ease:t.maskEase,lazy:false},0);
  if (layers.photo) timeline.fromTo(layers.photo,{xPercent:t.photoX,scale:t.photoScale},{xPercent:0,scale:1,duration:t.photo,ease:t.photoEase,lazy:false},t.photoAt);
  if (layers.content) timeline.fromTo(layers.content,{x:85},{x:0,duration:t.content,ease:t.photoEase,lazy:false},t.contentAt);
  if (layers.labels?.length) timeline.fromTo(layers.labels,{y:20,opacity:0},{y:0,opacity:1,duration:t.labels,stagger:t.stagger,ease:'power2.out',lazy:false},t.labelsAt);
  if (layers.handle) timeline.to(layers.handle.querySelectorAll('span'),{
    rotation:(index:number)=>layers.handleOpen===false?0:index===0?45:-45,
    y:(index:number)=>layers.handleOpen===false?0:index===0?3.5:-3.5,
    duration:t.handle,ease:'power2.inOut',
  },0);
  return timeline;
}
