"use client";
import {useLayoutEffect,useRef,useState} from "react";
import {gsap} from "gsap";
import type {VillaContent,VillaImage} from "@/lib/schemas/content";
import {HOMEPAGE_INTRO as timing} from './home-intro-timing';
import {PHOTO_RELEASE} from './photo-ownership';
import {prepareHeroReveal,readyImage,revealPreparedHero} from './handle-reveal';
import {HANDLE_REVEAL} from './handle-choreography';
import "./home-intro.css";
import './handle-reveal.css';
type Brand=NonNullable<VillaContent['signatureMenu']>['introBrand'];

/** One document-only lifecycle; content stays server rendered under the cream. */
export function HomepageIntro({logo,brand,emblem,name}:{logo?:VillaImage;brand?:Brand;emblem?:VillaImage;name:string}) {
 const root=useRef<HTMLDivElement>(null),[failed,setFailed]=useState(false);
 useLayoutEffect(()=>{
  const layer=root.current!,html=document.documentElement;
  if(Array.from(layer.querySelectorAll('img')).some(i=>i.complete&&!i.naturalWidth))setFailed(true);
  if(html.dataset.signatureIntro!=="pending")return;
  const site=layer.nextElementSibling as HTMLElement|null;
  if(!site?.matches('.sg-site')){html.dataset.signatureIntro='done';return;}
  const previousInert=site.inert,focused=document.activeElement as HTMLElement|null;
  const locks=[html,document.body].map(node=>({node,value:node.style.getPropertyValue('overflow'),priority:node.style.getPropertyPriority('overflow')}));
  const title=site.querySelector<HTMLElement>('.sg-ref-opener h1,.sg-story-opener h1'),rail=site.querySelector<HTMLElement>('.sg-rail');
  const decorations=[title,rail].filter((n):n is HTMLElement=>!!n).map(node=>({node,value:node.style.getPropertyValue('opacity'),priority:node.style.getPropertyPriority('opacity')}));
  const reduce=matchMedia('(prefers-reduced-motion: reduce)'),abort=new AbortController();
  let ended=false,rotation:gsap.core.Tween|undefined,timeline:gsap.core.Timeline|undefined,prepared:Awaited<ReturnType<typeof prepareHeroReveal>>=null;
  const started=performance.now();
  site.inert=true;locks.forEach(({node})=>node.style.setProperty('overflow','hidden'));
  layer.dataset.phase='presenting';performance.mark('signature-intro:start');
  function finish(){
   if(ended)return;ended=true;clearTimeout(deadline);rotation?.kill();timeline?.kill();abort.abort();
   html.dataset.signatureIntro='done';layer.dataset.phase='complete';layer.style.display='none';site!.inert=previousInert;prepared?.release();
   locks.forEach(({node,value,priority})=>{if(value)node.style.setProperty('overflow',value,priority);else node.style.removeProperty('overflow');});
   decorations.forEach(({node,value,priority})=>{if(value)node.style.setProperty('opacity',value,priority);else node.style.removeProperty('opacity');});
   if(focused&&focused!==document.body&&focused.isConnected&&!site!.inert)focused.focus({preventScroll:true});
   performance.mark('signature-intro:end');performance.measure('signature-intro','signature-intro:start','signature-intro:end');
   window.dispatchEvent(new Event('sodai:signature-intro-finished'));
  }
  const deadline=setTimeout(finish,timing.failSafeMs);
  const events=['popstate','resize','sodai:signature-navigation','sodai:signature-menu-navigation','sodai:signature-intro-expired','pagehide'];
  events.forEach(event=>window.addEventListener(event,finish));reduce.addEventListener('change',finish);
  if(reduce.matches)finish();
  else {
   gsap.set(decorations.map(d=>d.node),{opacity:0});
   const coral=layer.querySelector('.sg-intro-emblem');
   if(coral)rotation=gsap.to(coral,{rotation:360*timing.direction,duration:timing.revolution,repeat:-1,ease:'none',transformOrigin:'50% 50%'});
   timeline=gsap.timeline().fromTo(layer.querySelector('.sg-home-intro-brand'),{opacity:.15},{opacity:1,duration:.2,ease:'power1.out'});
   const visiblePhoto=site.querySelector<HTMLElement>('.sg-ref-opener .std-photo,.sg-story-opener .std-photo');
   const readiness=[...Array.from(layer.querySelectorAll('img')).map(image=>readyImage(image,abort.signal)),document.fonts.load('16px "TS Caslon"'),document.fonts.load('16px "TS Helvetica"')];
   void Promise.allSettled(readiness).then(async()=>{
    if(ended)return;
    prepared=await prepareHeroReveal(site,abort.signal);
    if(ended){prepared?.release();return;}
    // Decode while the welcome mark is still visible. The ready image is never
    // unveiled through an opacity fade of the full cream screen.
    if(!prepared){finish();return;}
    const handoff=revealPreparedHero(prepared,{onStart:()=>{layer.dataset.phase='hero-reveal';layer.style.zIndex='44';performance.mark('signature-intro:hero-reveal');}});
    layer.append(prepared.mask);
    if(ended)return;
    const elapsed=(performance.now()-started)/1000,reveal=Math.max(timing.presentation,elapsed);
    timeline!.call(()=>{
     layer.dataset.phase='exiting';performance.mark('signature-intro:reveal');
     if(visiblePhoto)window.dispatchEvent(new CustomEvent(PHOTO_RELEASE,{detail:{photo:visiblePhoto}}));
    },[],reveal)
     .to(layer.querySelector('.sg-home-intro-brand'),{opacity:0,duration:timing.logoExit,ease:'power1.inOut'},reveal)
     .add(handoff.play(),reveal+timing.logoExit);
    if(rail)timeline!.to(rail,{opacity:1,duration:HANDLE_REVEAL.labels,ease:'power2.out'},reveal+timing.logoExit+HANDLE_REVEAL.labelsAt);
    timeline!.call(finish,[],reveal+timing.logoExit+handoff.duration()).play(elapsed);
   });
  }
  return()=>{finish();events.forEach(event=>window.removeEventListener(event,finish));reduce.removeEventListener('change',finish);};
 },[]);
 const bounds=brand?.emblemBounds;
 return <div ref={root} className="sg-home-intro" data-home-intro role="status" aria-live="polite" aria-label={`Loading ${name}`}>
  <div className={`sg-home-intro-brand ${brand&&!failed?'sg-intro-split':'sg-intro-fallback'}`} aria-hidden="true" style={brand&&!failed?{aspectRatio:brand.aspectRatio}:undefined}>
   {failed?<span>{name}</span>:brand?<>
    <img className="sg-intro-wordmark" src={brand.wordmark.src} alt="" width={112} height={111} loading="eager" onError={()=>setFailed(true)}/>
    <img className="sg-intro-emblem" src={brand.emblem.src} alt="" width={75} height={75} loading="eager" onError={()=>setFailed(true)} style={{left:`${bounds!.x}%`,top:`${bounds!.y}%`,width:`${bounds!.width}%`,height:`${bounds!.height}%`}}/>
   </>:emblem?<><span>{name}</span><img className="sg-intro-emblem" src={emblem.src} alt="" width={72} height={72} loading="eager" onError={()=>setFailed(true)}/></>:logo?<img src={logo.src} alt="" width={112} height={100} loading="eager" onError={()=>setFailed(true)} data-combined-brand/>:<span>{name}</span>}
  </div>
 </div>;
}
