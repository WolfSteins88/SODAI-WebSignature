"use client";
import {useEffect,useRef,type ReactNode} from 'react';
export function DiningInteractions({children}:{children:ReactNode}) {
 const root=useRef<HTMLDivElement>(null);
 useEffect(()=>{const track=root.current!.querySelector<HTMLOListElement>('ol')!;let start=0,left=0,drag=false,moved=false;
 const down=(e:PointerEvent)=>{if(e.pointerType!=='mouse'||e.button!==0||(e.target as Element).closest('a'))return;start=e.clientX;left=track.scrollLeft;drag=true;moved=false;};
 const move=(e:PointerEvent)=>{if(!drag)return;const d=e.clientX-start;if(Math.abs(d)>5)moved=true;if(moved){track.scrollLeft=left-d;e.preventDefault();}};
 const marker=root.current!.querySelector<HTMLElement>('.sg-dining-progress>span')!;let maximum=1;const measure=()=>{maximum=Math.max(1,track.scrollWidth-track.clientWidth);marker.style.width=(100/Math.max(1,track.children.length))+'%';};const progress=()=>{marker.style.transform='translateX('+(track.scrollLeft/maximum*100*Math.max(0,track.children.length-1))+'%)';};const observer=new ResizeObserver(()=>{measure();progress();});observer.observe(track);measure();progress();track.addEventListener('scroll',progress,{passive:true});
 const up=()=>{drag=false;};const click=(e:MouseEvent)=>{if(moved){e.preventDefault();moved=false;}};
 track.addEventListener('pointerdown',down);window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);window.addEventListener('pointercancel',up);track.addEventListener('click',click,true);
 return()=>{observer.disconnect();track.removeEventListener('scroll',progress);track.removeEventListener('pointerdown',down);window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',up);track.removeEventListener('click',click,true);};},[]);
 return <div ref={root}>{children}<div className="sg-dining-progress" aria-hidden="true"><span/></div></div>;
}
export function MenuNavigation({categories,prefix,pageTitle}:{pageTitle:string;categories:{id:string;title:string;downloadUrl:string}[];prefix:string}) {
 const root=useRef<HTMLElement>(null);
 useEffect(()=>{
   // Route transitions intentionally preserve scroll; resolve the incoming document
   // fragment only once the existing transition has released its overlay.
   const id=location.hash.slice(1);if(!categories.some(c=>c.id===id))return;
   const heading=document.getElementById(id);if(!heading)return;
   const observer=new MutationObserver(reveal);
   function reveal(){if(document.documentElement.dataset.signatureNavigating)return;heading!.scrollIntoView({behavior:'instant',block:'start'});heading!.tabIndex=-1;heading!.focus({preventScroll:true});observer.disconnect();}
   observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-signature-navigating']});reveal();return()=>observer.disconnect();
 },[]);
 useEffect(()=>{const nav=root.current!;const headings=categories.map(c=>document.getElementById(c.id)).filter((x):x is HTMLElement=>!!x);const observer=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);const current=visible[0]?.target.id;if(current)nav.querySelectorAll('[data-menu-nav]').forEach(a=>{if(a.getAttribute('data-menu-nav')===current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});},{rootMargin:'0px 0px -60% 0px'});headings.forEach(e=>observer.observe(e));return()=>observer.disconnect();},[categories]);
 return <nav ref={root} className="sg-menu-categories" aria-label="Restaurant menu categories"><div>{categories.map((c,i)=><div key={c.id}><a data-menu-nav={c.id} href={`#${c.id}`} aria-current={i===0?'location':undefined}>{c.title}</a>{c.downloadUrl&&<a className="sg-menu-download" href={c.downloadUrl} download>Download {c.title} Menu</a>}</div>)}</div><a className="sg-menu-back" href={`${prefix}/dining`}>Back to {pageTitle}</a></nav>;
}
