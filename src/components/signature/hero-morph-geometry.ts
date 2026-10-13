export type HeroBounds = {left:number;top:number;width:number;height:number};
export const HERO_MORPH = {desktopWidth:.28,mobileWidth:.64,aspect:1.6,shrink:.6,swap:.2,expand:.9,overlap:.025,ready:1800,fade:.16,ease:"power2.inOut",reveal:.2} as const;
export function intermediateHero(view:HeroBounds,mobile:boolean):HeroBounds {
  const width=Math.min(view.width*(mobile?HERO_MORPH.mobileWidth:HERO_MORPH.desktopWidth),mobile?340:Infinity);
  const height=Math.min(width/HERO_MORPH.aspect,view.height*.42);
  return {left:view.left+(view.width-width)/2,top:view.top+(view.height-height)/2,width,height};
}
// Uniform cover scaling: both images are clipped by the same moving plane.
export function coverHero(box:HeroBounds,width:number,height:number,focal:{x:number;y:number}) {
  const scale=Math.max(box.width/width,box.height/height);
  return {scale,x:(box.width-width*scale)*focal.x,y:(box.height-height*scale)*focal.y};
}

// Branch durations exclude exceptional route/media readiness waits.
export const HEROLESS_MOTION={out:.25,holdOpacity:.15,settle:.12,dissolve:.22,reveal:.3,appear:.15,expand:.9,contentReveal:.35} as const;
export type TransitionPageKind="hero"|"none";
export function transitionBranch(source:TransitionPageKind,destination:TransitionPageKind){return `${source}-to-${destination}` as const;}
