import {handleRevealTimeline} from './handle-choreography';
import {PHOTO_RELEASE} from './photo-ownership';
import type {gsap} from 'gsap';

export const PUBLIC_HERO = '.sg-hero .std-photo,.sg-ref-opener .std-photo,.sg-story-opener .std-photo,.sp-hero .std-photo,.sl-hero .std-photo,.sg-foundation-hero .std-photo';

export function capturePublicPage(site:HTMLElement) {
  const copy=site.cloneNode(true) as HTMLElement;copy.inert=true;copy.setAttribute('aria-hidden','true');copy.style.transform=`translateY(${-scrollY}px)`;
  const originals=site.querySelectorAll<HTMLElement>('.sg-story-track,.sg-room-strip'),copies=copy.querySelectorAll<HTMLElement>('.sg-story-track,.sg-room-strip');
  originals.forEach((node,i)=>{const box=node.getBoundingClientRect();Object.assign(copies[i].style,{position:'absolute',left:`${box.left}px`,top:`${box.top+scrollY}px`,width:`${box.width}px`,height:`${box.height}px`});copies[i].scrollLeft=node.scrollLeft;copies[i].scrollTop=node.scrollTop;});
  copy.querySelectorAll('dialog').forEach(n=>n.remove());
  copy.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));copy.querySelector('.sg-navigation-shell')?.remove();
  return copy;
}

export function readyImage(image:HTMLImageElement|null, signal:AbortSignal, timeout=6000):Promise<boolean> {
  if (!image || signal.aborted) return Promise.resolve(false);
  return new Promise(resolve=>{
    let settled=false;
    const finish=(ready:boolean)=>{if(settled)return;settled=true;clearTimeout(timer);image.removeEventListener('load',decode);image.removeEventListener('error',failed);signal.removeEventListener('abort',failed);resolve(ready);};
    const failed=()=>finish(false);
    const decode=()=>{void image.decode().then(()=>finish(image.naturalWidth>0),failed);};
    const timer=setTimeout(failed,timeout);
    signal.addEventListener('abort',failed,{once:true});
    if(image.complete){if(image.naturalWidth)decode();else failed();}
    else {image.addEventListener('load',decode,{once:true});image.addEventListener('error',failed,{once:true});}
  });
}

/** A decoded image with the live hero's final bounds, focal point and type.
 * Measure once; GSAP then changes only the common mask, transform and opacity. */
export async function prepareHeroReveal(site:HTMLElement, signal:AbortSignal) {
  const target=site.querySelector<HTMLElement>(PUBLIC_HERO), image=target?.querySelector<HTMLImageElement>('img');
  if(!target || !image || !await readyImage(image,signal) || signal.aborted)return null;
  const copy=new Image();copy.src=image.currentSrc||image.src;copy.alt='';copy.decoding='async';
  if(!await readyImage(copy,signal)||signal.aborted)return null;
  const box=target.getBoundingClientRect();
  if(!box.width||!box.height||box.bottom<=0)return null;
  const mask=document.createElement('div'),photo=document.createElement('div'),labels:HTMLElement[]=[];
  mask.className='sg-handle-reveal';mask.setAttribute('aria-hidden','true');mask.inert=true;
  mask.style.background=site.dataset.signatureBackground||getComputedStyle(site).backgroundColor;
  photo.className='sg-handle-reveal-photo';
  Object.assign(photo.style,{left:`${box.left}px`,top:`${box.top}px`,width:`${box.width}px`,height:`${box.height}px`});
  Object.assign(copy.style,{objectFit:getComputedStyle(image).objectFit,objectPosition:getComputedStyle(image).objectPosition});
  photo.append(copy);mask.append(photo);
  const hero=target.closest('section');
  for(const original of Array.from(hero?.children||[])){
    if(!(original instanceof HTMLElement)||!original.matches('h1,.sg-hero-shade,.sg-ref-hero-shade,.sp-hero-shade,.sl-shade,.sf-hero-shade'))continue;
    const node=original.cloneNode(true) as HTMLElement,rect=original.getBoundingClientRect(),style=getComputedStyle(original);
    node.removeAttribute('id');node.className='sg-handle-reveal-decoration';
    for(const property of ['font-family','font-size','font-weight','font-style','line-height','letter-spacing','text-align','text-transform','color','text-shadow','background','padding','font-feature-settings'])node.style.setProperty(property,style.getPropertyValue(property));
    Object.assign(node.style,{left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,height:`${rect.height}px`,margin:'0',boxSizing:'border-box'});
    mask.append(node);if(original.matches('h1'))labels.push(node);
  }
  // Target is never recolored by a competing scroll effect during the reveal.
  target.dataset.signaturePhotoOwner='menu';
  return {mask,photo,labels, release(){delete target.dataset.signaturePhotoOwner;window.dispatchEvent(new CustomEvent(PHOTO_RELEASE,{detail:{photo:target}}));mask.remove();}};
}

export function revealPreparedHero(prepared:NonNullable<Awaited<ReturnType<typeof prepareHeroReveal>>>, callbacks:gsap.TimelineVars={}) {
  return handleRevealTimeline({...prepared,callbacks});
}
