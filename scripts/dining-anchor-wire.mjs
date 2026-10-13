import fs from 'node:fs/promises';const p='src/components/signature/dining-interactive.tsx';let s=await fs.readFile(p,'utf8');s=s.replace(' const root=useRef<HTMLElement>(null);',` const root=useRef<HTMLElement>(null);
 useEffect(()=>{
   // Route transitions intentionally preserve scroll; resolve the incoming document
   // fragment only once the existing transition has released its overlay.
   const id=location.hash.slice(1);if(!categories.some(c=>c.id===id))return;
   const heading=document.getElementById(id);if(!heading)return;
   const observer=new MutationObserver(reveal);
   function reveal(){if(document.documentElement.dataset.signatureNavigating)return;heading!.scrollIntoView({behavior:'instant',block:'start'});heading!.tabIndex=-1;heading!.focus({preventScroll:true});observer.disconnect();}
   observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-signature-navigating']});reveal();return()=>observer.disconnect();
 },[]);`);await fs.writeFile(p,s);
