"use client";
import {useEffect,useRef,type ReactNode} from 'react';
export function FoundationStrip({children}:{children:ReactNode}){
 const root=useRef<HTMLDivElement>(null);
 useEffect(()=>{const track=root.current!.querySelector<HTMLOListElement>('ol')!,marker=root.current!.querySelector<HTMLElement>('.sf-progress>span')!;let maximum=0,startX=0,startY=0,left=0,drag=false;
 const measure=()=>{maximum=Math.max(0,track.scrollWidth-track.clientWidth);marker.style.width=`${Math.min(100,track.clientWidth/Math.max(1,track.scrollWidth)*100)}%`;};
 const progress=()=>{marker.style.transform=`translateX(${maximum ? track.scrollLeft/Math.max(1,track.clientWidth)*100 : 0}%)`;};
 const down=(e:PointerEvent)=>{if(e.pointerType!=='mouse'||e.button!==0)return;drag=true;startX=e.clientX;startY=e.clientY;left=track.scrollLeft;};
 const move=(e:PointerEvent)=>{if(!drag)return;const dx=e.clientX-startX,dy=e.clientY-startY;if(Math.abs(dx)>5&&Math.abs(dx)>Math.abs(dy)){track.scrollLeft=left-dx;e.preventDefault();}};
 const up=()=>{drag=false;};const key=(e:KeyboardEvent)=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const target=e.key==='Home'?0:e.key==='End'?maximum:track.scrollLeft+(e.key==='ArrowRight'?1:-1)*track.clientWidth*.35;track.scrollTo({left:target,behavior:'instant'});};
 const resize=new ResizeObserver(()=>{measure();progress();});resize.observe(track);measure();progress();track.addEventListener('scroll',progress,{passive:true});track.addEventListener('pointerdown',down);track.addEventListener('keydown',key);window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);window.addEventListener('pointercancel',up);
 return()=>{resize.disconnect();track.removeEventListener('scroll',progress);track.removeEventListener('pointerdown',down);track.removeEventListener('keydown',key);window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',up);};},[children]);
 return <div ref={root} className="sf-strip">{children}<div className="sf-progress" aria-hidden="true"><span/></div></div>;
}
