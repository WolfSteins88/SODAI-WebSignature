'use client';
import {useEffect,useRef,useState} from 'react';
type Entry={id:string;title:string};
/** Heading geometry is refreshed on size/content changes, not on scroll. */
export function TermsIndex({sections}:{sections:Entry[]}){
 const [active,setActive]=useState(sections[0]?.id||'');
 const navigate=useRef<(id:string,push:boolean)=>void>(()=>{});
 useEffect(()=>{
  let geometry:{id:string;top:number;node:HTMLElement}[]=[],offset=18,locked='',timer:ReturnType<typeof setTimeout>|undefined,observer:IntersectionObserver|undefined,disposed=false;
  const choose=()=>{if(locked)return;const reading=window.scrollY+offset+2;let id=geometry[0]?.id||'';for(const s of geometry){if(s.top<=reading)id=s.id;else break;}setActive(prev=>prev===id?prev:id);};
  const finish=()=>{locked='';clearTimeout(timer);choose();};
  const measure=()=>{
   if(disposed)return;offset=matchMedia('(max-width:900px)').matches?100:18;
   geometry=sections.flatMap(s=>{const node=document.getElementById(s.id);return node?[{id:s.id,top:node.getBoundingClientRect().top+window.scrollY,node}]:[];});
   observer?.disconnect();observer=new IntersectionObserver(choose,{rootMargin:`-${offset}px 0px -${Math.max(0,innerHeight-offset-2)}px 0px`,threshold:0});
   document.querySelectorAll('[data-terms-section]').forEach(node=>observer!.observe(node));choose();
  };
  const go=(id:string,push:boolean)=>{
   const target=geometry.find(s=>s.id===id);if(!target)return;
   const top=Math.max(0,target.top-offset);clearTimeout(timer);locked=id;setActive(id);
   if(push&&location.hash!==`#${id}`){history.replaceState({...history.state,__sodaiScrollY:scrollY},'');history.pushState({...history.state,__sodaiScrollY:top},'',`#${id}`);}
   const immediate=matchMedia('(prefers-reduced-motion:reduce)').matches||!push;
   target.node.focus({preventScroll:true});window.scrollTo({top,behavior:immediate?'instant':'smooth'});
   if(immediate)finish();else timer=setTimeout(finish,1400);
  };
  navigate.current=go;
  const hash=(event?:Event)=>{const id=location.hash.slice(1);if(id)go(id,false);else {if(event?.type==='popstate'&&typeof history.state?.__sodaiScrollY==='number')window.scrollTo({top:history.state.__sodaiScrollY,behavior:'instant'});finish();}};
  const resize=new ResizeObserver(measure);const article=document.querySelector('.st-reading');if(article)resize.observe(article);
  measure();document.fonts.ready.then(()=>{if(!disposed){measure();hash();}});
  window.addEventListener('resize',measure);window.addEventListener('hashchange',hash);window.addEventListener('popstate',hash);window.addEventListener('scrollend',finish);
  window.addEventListener('wheel',finish,{passive:true});window.addEventListener('touchstart',finish,{passive:true});
  return()=>{disposed=true;clearTimeout(timer);resize.disconnect();observer?.disconnect();navigate.current=()=>{};window.removeEventListener('resize',measure);window.removeEventListener('hashchange',hash);window.removeEventListener('popstate',hash);window.removeEventListener('scrollend',finish);window.removeEventListener('wheel',finish);window.removeEventListener('touchstart',finish);};
 },[sections]);
 return <aside className="st-index"><nav aria-label="Terms sections">{sections.map(s=><a key={s.id} href={`#${s.id}`} aria-current={active===s.id?'location':undefined} onClick={e=>{if(e.button===0&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey){e.preventDefault();navigate.current(s.id,true);}}}>{s.title}</a>)}</nav><label className="st-mobile-index">On this page<select value={active} onChange={e=>navigate.current(e.target.value,true)}>{sections.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select></label></aside>;
}
