"use client";
import {useEffect,type RefObject} from "react";
import {gsap} from "gsap";
import {HERO_MORPH,HEROLESS_MOTION,transitionBranch,type TransitionPageKind,intermediateHero,coverHero,type HeroBounds} from "./hero-morph-geometry";
import {PHOTO_RELEASE} from "./photo-ownership";
import {beginHandleNavigation} from './handle-navigation';
import {capturePublicPage} from './handle-reveal';
import './handle-reveal.css';

export const MENU_NAVIGATION="sodai:signature-menu-navigation";
export const CANCEL_MENU_NAVIGATION="sodai:signature-menu-navigation-cancel";
const HERO=".sg-hero .std-photo,.sg-ref-opener .std-photo,.sp-hero .std-photo,.sl-hero .std-photo,.sg-foundation-hero .std-photo";
type Intent={href:string;commit:()=>void;exit:Promise<boolean>;source?:'logo'};
type Picture={node:HTMLImageElement;width:number;height:number;focal:{x:number;y:number}};
function picture(image:HTMLImageElement):Picture {
 const node=document.createElement("img");node.src=image.currentSrc||image.src;node.alt="";node.decoding="async";
 const position=getComputedStyle(image).objectPosition.split(" ").map(v=>parseFloat(v)/100);
 Object.assign(node.style,{width:`${image.naturalWidth}px`,height:`${image.naturalHeight}px`});
 return {node,width:image.naturalWidth,height:image.naturalHeight,focal:{x:Number.isFinite(position[0])?position[0]:.5,y:Number.isFinite(position[1])?position[1]:.5}};
}
// Retain the real hero's shade and typography, which were missing from the old handoff.
function decorations(target:HTMLElement,host:HTMLElement) {
 const hero=target.closest("section");if(!hero)return [];
 const nodes:HTMLElement[]=[];
 for(const original of Array.from(hero.children)) {
  if(!(original instanceof HTMLElement)||original===target||original.contains(target))continue;
  if(!original.matches("h1,.sg-hero-shade,.sg-ref-hero-shade,.sp-hero-shade,.sl-shade,.sf-hero-shade"))continue;
  const box=original.getBoundingClientRect(),style=getComputedStyle(original),node=original.cloneNode(true) as HTMLElement;
  node.removeAttribute("id");node.className="sg-menu-hero-decoration";
  node.dataset.heroOpacity=style.opacity;
  for(const property of ["font-family","font-size","font-weight","font-style","font-feature-settings","line-height","letter-spacing","text-align","text-transform","color","text-shadow","background","border-radius","padding"])node.style.setProperty(property,style.getPropertyValue(property));
  Object.assign(node.style,{left:`${box.left}px`,top:`${box.top}px`,width:`${box.width}px`,height:`${box.height}px`,margin:"0",boxSizing:"border-box",opacity:"0"});
  host.append(node);nodes.push(node);
 }
 return nodes;
}

export function useMenuHeroTransition(root:RefObject<HTMLDivElement|null>,reduced:boolean,cancelOther:()=>void) {
 useEffect(()=>{
  let cancel=()=>{};
  function start(event:Event) {
   cancel();cancelOther();
   const {href,commit,exit,source:origin}=(event as CustomEvent<Intent>).detail;
   window.dispatchEvent(new Event("sodai:signature-dismiss-viewer"));
   const site=root.current?.querySelector<HTMLElement>(".sg-site");if(!site)return;
   if(origin==='logo'){cancel=beginHandleNavigation({root:root.current!,site,href,commit,exit,reduced});return;}
   const sourceKind:TransitionPageKind=site.dataset.signatureTransition==="hero"?"hero":"none";
   const source=sourceKind==="hero"?site.querySelector<HTMLElement>(HERO):null,sourceImage=source?.querySelector<HTMLImageElement>("img");
   const host=document.createElement("div"),background=document.createElement("div"),copy=capturePublicPage(site);
   host.className="sg-menu-route-layer";host.setAttribute("aria-hidden","true");host.dataset.phase="prepare";host.dataset.destination=href;
   background.className="sg-menu-route-background";background.style.backgroundColor=site.dataset.signatureBackground||getComputedStyle(site).backgroundColor;host.append(background,copy);document.body.append(host);
   copy.querySelectorAll<HTMLElement>(".sg-story-track,.sg-room-strip").forEach((node,i)=>{const original=site.querySelectorAll<HTMLElement>(".sg-story-track,.sg-room-strip")[i];node.scrollLeft=original.scrollLeft;node.scrollTop=original.scrollTop;});
   document.documentElement.dataset.signatureNavigating="true";
   const blockScroll=(event:Event)=>event.preventDefault();
   const blockScrollKey=(event:KeyboardEvent)=>{if(!root.current?.querySelector("[data-signature-menu-active]")&&["ArrowDown","ArrowUp","PageDown","PageUp","Home","End"," "].includes(event.key))event.preventDefault();};
   host.addEventListener("wheel",blockScroll,{passive:false});host.addEventListener("touchmove",blockScroll,{passive:false});
   window.addEventListener("keydown",blockScrollKey);
   let active=true,committed=false,owned:HTMLElement|undefined;
   // Resynchronize a sleeping/background ticker before placing a new timeline.
   // Otherwise its first update can consume the shrink before route readiness starts.
   gsap.ticker.wake();
   const abort=new AbortController(),timeline=gsap.timeline({paused:true}),removers:(()=>void)[]=[],inert=new Map<HTMLElement,boolean>();
   // One shared GSAP ticker, with local wall time: its global lag smoothing must
   // not turn a stalled callback into seconds of extra small-frame animation.
   let driving=false,clockStart=0;
   const tick=()=>{if(active)timeline.totalTime((performance.now()-clockStart)/1000,false);};
   function drive(reset=false){timeline.pause();if(reset){clockStart=performance.now();timeline.totalTime(0,true);}if(!driving){driving=true;clockStart=performance.now()-timeline.totalTime()*1000;gsap.ticker.add(tick);}}
   const mark=(name:string)=>{if(document.documentElement.dataset.performanceReview==="recording")performance.mark(`hero-morph:${name}`);};
   mark("intent");
   const isolate=()=>{if(root.current?.querySelector("[data-signature-menu-active]"))return;const main=root.current?.querySelector<HTMLElement>(".sg-site main");if(main&&!inert.has(main)){inert.set(main,main.inert);main.inert=true;}};
   const observer=new MutationObserver(isolate);observer.observe(root.current!,{childList:true,subtree:true});isolate();
   function release() {if(owned){const photo=owned;owned=undefined;delete photo.dataset.signaturePhotoOwner;window.dispatchEvent(new CustomEvent(PHOTO_RELEASE,{detail:{photo}}));}}
   function cleanup(focus=false) {
    if(!active)return;active=false;abort.abort();gsap.ticker.remove(tick);timeline.kill();observer.disconnect();window.removeEventListener("keydown",blockScrollKey);removers.forEach(remove=>remove());release();inert.forEach((value,node)=>{node.inert=value;});host.remove();delete document.documentElement.dataset.signatureNavigating;
    if(focus){const main=root.current?.querySelector<HTMLElement>(".sg-site main");if(main){main.tabIndex=-1;main.focus({preventScroll:true});}}mark("cleanup");
   }
   cancel=()=>cleanup(false);
   function bounded<T>(promise:Promise<T>,ms:number,fallback:T):Promise<T>{return new Promise(resolve=>{let done=false;const settle=(v:T)=>{if(done)return;done=true;clearTimeout(timer);resolve(v);};const timer=setTimeout(()=>settle(fallback),ms);removers.push(()=>settle(fallback));promise.then(settle,()=>settle(fallback));});}
   const nextPath=new URL(href,location.origin).pathname;
   // Page producers declare hero ownership; thumbnails/illustrations are never candidates.
   const canMorph=!reduced&&sourceKind==="hero"&&!!sourceImage?.complete&&sourceImage.naturalWidth>0;
   let destinationKind:TransitionPageKind="none";
   let fallbackCause=reduced?"reduced-motion":sourceKind==="hero"&&!canMorph?"source-image-unavailable":"";
   function failure(cause:string){fallbackCause=cause;host.dataset.fallback=cause;mark(`fallback:${cause}`);}
   let frame:HTMLDivElement|undefined,outgoing:Picture|undefined,incoming:Picture|undefined;
   const rail=site.querySelector<HTMLElement>(".sg-rail")?.getBoundingClientRect();
   const view:HeroBounds={left:rail&&rail.width<innerWidth*.3?rail.right:0,top:rail&&rail.width>=innerWidth*.3?rail.bottom:0,width:innerWidth-(rail&&rail.width<innerWidth*.3?rail.right:0),height:innerHeight-(rail&&rail.width>=innerWidth*.3?rail.bottom:0)};
   const small=intermediateHero(view,innerWidth<=900);
   const rect=source?.getBoundingClientRect();
   const sourceGray=source?parseFloat(getComputedStyle(source).getPropertyValue("--sg-photo-gray")):0;
   const geometry={left:rect&&rect.right>0&&rect.left<innerWidth?rect.left:0,top:rect&&rect.bottom>0&&rect.top<innerHeight?rect.top:0,width:rect?.width||innerWidth,height:rect?.height||innerHeight,gray:Number.isFinite(sourceGray)?sourceGray:0};
   const baseWidth=Math.max(innerWidth,geometry.width),baseHeight=Math.max(innerHeight,geometry.height);
   // Only cached arithmetic and paint/compositor writes during frames; no DOM reads.
   function paint() {
    if(!frame)return;
    frame.style.transform=`translate3d(${geometry.left}px,${geometry.top}px,0)`;
    frame.style.clipPath=`inset(0px ${Math.max(0,baseWidth-geometry.width)}px ${Math.max(0,baseHeight-geometry.height)}px 0px)`;
    frame.style.filter=`grayscale(${geometry.gray})`;
    for(const image of [outgoing,incoming])if(image){const cover=coverHero(geometry,image.width,image.height,image.focal);image.node.style.transform=`translate3d(${cover.x}px,${cover.y}px,0) scale(${cover.scale})`;}
   }
   function makeFrame(){frame=document.createElement("div");frame.className="sg-menu-hero-frame";Object.assign(frame.style,{width:`${baseWidth}px`,height:`${baseHeight}px`});host.append(frame);}
   if(canMorph){makeFrame();outgoing=picture(sourceImage!);frame!.append(outgoing.node);paint();}
   // Begin HTML/media readiness at selection, concurrently with the existing menu exit.
   const preloaded=!reduced?bounded((async()=>{try{const response=await fetch(href,{signal:abort.signal,headers:{Accept:"text/html"}});if(!response.ok)return false;const doc=new DOMParser().parseFromString(await response.text(),"text/html"),image=doc.querySelector('.sg-site[data-signature-transition="hero"]')?.querySelector(HERO)?.querySelector("img");if(!image)return false;const photo=new Image();photo.srcset=image.getAttribute("srcset")||"";photo.sizes=image.getAttribute("sizes")||"100vw";photo.src=new URL(image.getAttribute("src")!,location.origin).href;await photo.decode();mark("preloaded");return true;}catch{return false;}})(),HERO_MORPH.ready,false):Promise.resolve(false);
   let destination:{target:HTMLElement;image:HTMLImageElement;box:HeroBounds}|undefined;
   const routeReady=(async()=>{
    if(!await exit||!active)return;
    isolate();window.history.replaceState({...window.history.state,__sodaiScrollY:scrollY},"");committed=true;mark("commit");commit();
    const page=await bounded(new Promise<HTMLElement|null>(resolve=>{const check=()=>{const current=root.current?.querySelector<HTMLElement>(".sg-site");if(current?.dataset.signatureRoute===nextPath){ready.disconnect();resolve(current);}};const ready=new MutationObserver(check);ready.observe(root.current!,{childList:true,subtree:true,attributes:true,attributeFilter:["data-signature-route"]});removers.push(()=>{ready.disconnect();resolve(null);});check();}),HERO_MORPH.ready,null);
    if(!active)return;
    if(!page){failure("route-timeout");return;}
    destinationKind=page.dataset.signatureTransition==="hero"?"hero":"none";
    host.dataset.branch=transitionBranch(sourceKind,destinationKind);
    background.style.backgroundColor=page.dataset.signatureBackground||getComputedStyle(page.querySelector("main")||page).backgroundColor;
    mark("route-ready");
    // Hero-less readiness is usable server-rendered layout, independent of image events.
    if(destinationKind==="none"){
     const main=page.querySelector("main");
     if(!main||!main.getBoundingClientRect().height)failure("destination-layout-unavailable");
     return;
    }
    const target=page.querySelector<HTMLElement>(HERO),image=target?.querySelector<HTMLImageElement>("img");
    if(!target||!image){failure("destination-hero-missing");return;}
    mark("decode-start");if(!await bounded(image.decode().then(()=>true),HERO_MORPH.ready,false)){if(active)failure("destination-image-unavailable");return;}if(!active)return;
    // Decode the actual transition child too, before it can replace the source.
    incoming=picture(image);if(!await bounded(incoming.node.decode().then(()=>true),HERO_MORPH.ready,false)){if(active)failure("transition-image-unavailable");return;}if(!active)return;
    const box=target.getBoundingClientRect();if(!box.width||!box.height||box.bottom<=0){failure("destination-bounds-unavailable");return;}
    owned=target;target.dataset.signaturePhotoOwner="menu";mark("decoded-measured");destination={target,image,box:{left:box.left,top:box.top,width:box.width,height:box.height}};
   })();
   function fade() {
    if(!active)return;
    if(fallbackCause==="route-timeout"){
     // Do not uncover the old live source while an RSC navigation is unresolved.
     // Replace the pending history entry with a direct request, keeping this mask
     // until the new document takes ownership. This is exceptional, never cached routing.
     mark("document-fallback");window.location.replace(href);return;
    }
    if(fallbackCause)failure(fallbackCause);
    host.dataset.phase="fade";
    if(reduced){cleanup(committed);return;}
    timeline.eventCallback("onComplete",null).clear().to(host,{opacity:0,duration:HERO_MORPH.fade,ease:"power1.out",onComplete:()=>cleanup(committed)});drive(true);
   }
   function expand() {
    if(!active)return;
    if(fallbackCause||reduced){fade();return;}
    if(destinationKind==="none"){
     timeline.eventCallback("onComplete",null).clear();host.dataset.phase="dissolve";mark("dissolve");
     if(frame)timeline.to(frame,{opacity:0,duration:HEROLESS_MOTION.dissolve,ease:"power1.out"});
     else timeline.to(copy,{opacity:0,duration:HEROLESS_MOTION.settle,ease:"power1.out",onComplete:()=>copy.remove()},0);
     timeline.to(host,{opacity:0,duration:sourceKind==="hero"?HEROLESS_MOTION.reveal:HEROLESS_MOTION.contentReveal,ease:"power1.inOut",onStart:()=>{host.dataset.phase="content-reveal";mark("content-reveal");},onComplete:()=>cleanup(true)},frame?HEROLESS_MOTION.dissolve:0);drive(true);return;
    }
    if(!destination||!incoming){fade();return;}
    if(!frame){makeFrame();Object.assign(geometry,small,{gray:1});}
    
    const {target,box}=destination;incoming.node.style.opacity="0";frame!.append(incoming.node);paint();
    // Reuse the one timeline, but begin this ready stage at zero. A stalled
    // shrink tick must not consume the blend/expansion before they even render.
    const labels=decorations(target,host);timeline.eventCallback("onComplete",null).clear();const at=0;
    if(!outgoing)timeline.to(copy,{opacity:0,duration:HEROLESS_MOTION.settle,ease:"power1.out",onComplete:()=>copy.remove()},0);
    const swap=outgoing?HERO_MORPH.swap:HEROLESS_MOTION.appear;
    timeline.to(incoming.node,{opacity:1,duration:swap,ease:"none",onStart:()=>{host.dataset.phase="blend";mark("blend");}},at)
     .to(geometry,{...box,gray:0,duration:HERO_MORPH.expand,ease:HERO_MORPH.ease,onUpdate:paint,onStart:()=>{host.dataset.phase="expand";mark("expand");}},at+swap-(outgoing?HERO_MORPH.overlap:0))
     .to(labels,{opacity:(_index:number,node:HTMLElement)=>Number(node.dataset.heroOpacity),duration:HERO_MORPH.reveal,ease:"power1.out"},at+swap-(outgoing?HERO_MORPH.overlap:0)+HERO_MORPH.expand-HERO_MORPH.reveal);
    if(outgoing)timeline.set(outgoing.node,{opacity:0},at+swap);
    // The opaque background stays until the image/decoration match the live hero.
    timeline.eventCallback("onComplete",()=>{paint();release();mark("aligned");cleanup(true);});drive(true);
   }
   function shrunk(){
    timeline.eventCallback("onComplete",null);gsap.ticker.remove(tick);driving=false;
    if(outgoing)copy.remove();host.dataset.phase="await-ready";mark("shrink-end");
    // Hero waits retain only the small frame. Hero-less waits retain faint content
    // until usable incoming content is ready; neither branch restores a hero copy.
    void routeReady.then(()=>{if(active)expand();});
   }
   if(frame){timeline.to(copy,{opacity:0,duration:.18,ease:"power1.out"},0).to(geometry,{...small,gray:1,duration:HERO_MORPH.shrink,ease:HERO_MORPH.ease,onUpdate:paint,onStart:()=>{host.dataset.phase="shrink";mark("shrink");}},0).eventCallback("onComplete",shrunk);drive();}
   else if(reduced)void routeReady.then(()=>{if(active)fade();});
   else {timeline.to(copy,{opacity:HEROLESS_MOTION.holdOpacity,duration:HEROLESS_MOTION.out,ease:"power1.out",onStart:()=>{host.dataset.phase="content-out";mark("content-out");}}).eventCallback("onComplete",shrunk);drive();}
   // Preload is independent of route readiness; it warms the exact responsive media.
   void preloaded;void routeReady.catch(()=>{if(active)fade();});
  }
  const stop=()=>cancel();window.addEventListener(MENU_NAVIGATION,start);window.addEventListener(CANCEL_MENU_NAVIGATION,stop);window.addEventListener("popstate",stop);window.addEventListener("resize",stop);
  return()=>{cancel();window.removeEventListener(MENU_NAVIGATION,start);window.removeEventListener(CANCEL_MENU_NAVIGATION,stop);window.removeEventListener("popstate",stop);window.removeEventListener("resize",stop);};
 },[root,reduced,cancelOther]);
}
