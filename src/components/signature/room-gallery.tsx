"use client";
import {useEffect,useId,useRef,useState,type CSSProperties} from 'react';
import {AnimatePresence,LayoutGroup,motion,useReducedMotion} from 'motion/react';
import type {RoomGridPhoto} from '@/lib/content/room-photo-grid';
import {Photo} from '../standard/photo';
import {containDialogFocus} from '../standard/dialog-focus';
import {MENU_NAVIGATION} from './menu-hero-transition';

// Adapted from the owner-supplied useLayouts DynamicGridGallery and ExpandableGallery.
// CSS owns grid tracks/hover; Motion exclusively owns shared photo layout. GSAP owns neither.
const spring={type:'spring',stiffness:160,damping:18,mass:1} as const;
type Selection={photo:RoomGridPhoto;width:number;height:number};
export function RoomGallery({images,title,roomId}:{images:RoomGridPhoto[];title:string;roomId:string}){
 const group=useId(),reduced=useReducedMotion();
 const grid=useRef<HTMLDivElement>(null),dialog=useRef<HTMLDialogElement>(null),closeButton=useRef<HTMLButtonElement>(null);
 const origin=useRef<HTMLButtonElement|null>(null),request=useRef(0),locked=useRef(false),saved=useRef({x:0,y:0,overflow:''}),closing=useRef(false);
 const activeIndex=useRef<number|null>(null);
 const [active,setActive]=useState<number|null>(null),[columns,setColumns]=useState(3),[frozen,setFrozen]=useState<CSSProperties|null>(null);
 const [selection,setSelection]=useState<Selection|null>(null),[pending,setPending]=useState<string|null>(null),[status,setStatus]=useState('');
 const finishRef=useRef<(focus?:boolean)=>void>(()=>{});
 const transition=reduced?{duration:0}:spring;
 function activate(index:number|null){if(activeIndex.current!==index){activeIndex.current=index;setActive(index);}}
 function release(focus=true){
  if(!locked.current)return;
  locked.current=false;if(dialog.current){dialog.current.dataset.roomGalleryPhase='closed';dialog.current.close();}
  document.body.style.overflow=saved.current.overflow;
  window.scrollTo({left:saved.current.x,top:saved.current.y,behavior:'instant'});
  if(focus&&origin.current?.isConnected)origin.current.focus({preventScroll:true});
 }
 function finish(focus=true){request.current++;closing.current=false;release(focus);setSelection(null);setPending(null);setFrozen(null);setStatus('');}
 finishRef.current=finish;
 useEffect(()=>{
  const resize=()=>{finishRef.current();activate(null);setColumns(innerWidth<=600?1:innerWidth<=900?2:3);};
  const interrupt=()=>finishRef.current();
  const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'&&!dialog.current?.open)finishRef.current();};
  resize();window.addEventListener('resize',resize);window.addEventListener('keydown',escape);
  for(const event of ['popstate','sodai:signature-navigation',MENU_NAVIGATION])window.addEventListener(event,interrupt);
  return()=>{request.current++;release(false);window.removeEventListener('resize',resize);window.removeEventListener('keydown',escape);for(const event of ['popstate','sodai:signature-navigation',MENU_NAVIGATION])window.removeEventListener(event,interrupt);};
 },[]);
 function close(){
  request.current++;setPending(null);
  if(!selection||reduced||!origin.current?.isConnected){finish();return;}
  // Keep measured CSS tracks frozen until Motion returns to the still-present button.
  closing.current=true;dialog.current!.dataset.roomGalleryPhase='closing';performance.mark('room-gallery-close-start');setSelection(null);
 }
 async function open(photo:RoomGridPhoto,button:HTMLButtonElement){
  if(locked.current||pending)return;
  const token=++request.current;origin.current=button;closing.current=false;
  const style=getComputedStyle(grid.current!);
  setFrozen({gridTemplateColumns:style.gridTemplateColumns,gridTemplateRows:style.gridTemplateRows,transition:'none'});
  setPending(photo.id);setStatus('Loading photograph…');
  try{
   const image=new Image();image.decoding='async';image.src=photo.image.src;await image.decode();
   if(token!==request.current)return;
   const pad=innerWidth<=600?20:60,scale=Math.min((innerWidth-pad*2)/image.naturalWidth,Math.max(80,innerHeight-160)/image.naturalHeight);
   saved.current={x:scrollX,y:scrollY,overflow:document.body.style.overflow};locked.current=true;document.body.style.overflow='hidden';
   dialog.current!.dataset.roomGalleryPhase='opening';performance.mark('room-gallery-open-start');dialog.current!.showModal();setSelection({photo,width:image.naturalWidth*scale,height:image.naturalHeight*scale});setPending(null);setStatus(photo.caption||photo.image.alt);
   closeButton.current?.focus({preventScroll:true});
  }catch{if(token===request.current){setPending(null);setFrozen(null);setStatus('Photograph unavailable. Please try another room photograph.');}}
 }
 if(!images.length)return null;
 const cols=Math.min(columns,images.length),rows=Math.ceil(images.length/cols),interactive=!reduced&&columns===3;
 const tracks=(length:number,index:number)=>Array.from({length},(_,i)=>interactive&&active!==null?(i===index?'1.95fr':'0.9fr'):'1fr').join(' ');
 const styles={gridTemplateColumns:tracks(cols,(active??0)%cols),gridTemplateRows:tracks(rows,Math.floor((active??0)/cols)), '--room-grid-rows':rows,...frozen} as CSSProperties;
 return <section className="sg-room-grid-section" aria-label={`${title} gallery`}>
  <LayoutGroup id={`${group}-${roomId}`}>
   <div ref={grid} className="sg-room-dynamic-grid" data-count={images.length} data-frozen={!!frozen} style={styles}
    onPointerMove={event=>{if(frozen||event.pointerType!=='mouse'||!matchMedia('(hover:hover) and (pointer:fine)').matches)return;const item=(event.target as HTMLElement).closest<HTMLElement>('[data-grid-index]');if(item){const index=Number(item.dataset.gridIndex);activate(index);}}}
    onPointerLeave={()=>{if(!frozen)activate(null);}}
    onBlur={event=>{if(!frozen&&!event.currentTarget.contains(event.relatedTarget as Node))activate(null);}}>
    {images.map((photo,index)=><figure key={photo.id} data-room-grid-id={photo.id} data-grid-index={index} data-active={active===index}>
     <button type="button" aria-busy={pending===photo.id} aria-label={`Expand ${photo.image.alt}`} onFocus={event=>{if(!frozen&&event.currentTarget.matches(':focus-visible'))activate(index);}} onClick={event=>void open(photo,event.currentTarget)}>
      {selection?.photo.id!==photo.id&&<motion.div layoutId={`card-${photo.id}`} layout transition={transition} className="sg-room-shared-card">
       <motion.div layoutId={`image-${photo.id}`} layout="position" transition={transition} className="sg-room-shared-image"><div className="sg-room-hover-image"><Photo image={photo.image} sizes="(max-width:600px) 88vw,(max-width:900px) 44vw,40vw"/></div></motion.div>
      </motion.div>}
      <span className="sg-room-grid-vignette" aria-hidden="true"/>
     </button>
     {photo.caption&&<figcaption tabIndex={0}>{photo.caption}</figcaption>}
    </figure>)}
   </div>
   <dialog ref={dialog} className="sg-room-lightbox" aria-label={`${title} photograph`} onCancel={event=>{event.preventDefault();close();}} onKeyDown={containDialogFocus}>
    <motion.div layoutRoot className="sg-room-shared-root">
     <AnimatePresence onExitComplete={()=>{if(closing.current){performance.mark('room-gallery-close-complete');finish();}}}>
      {selection&&<motion.div key={selection.photo.id} layoutId={`card-${selection.photo.id}`} layout transition={transition} className="sg-room-viewer-photo" onLayoutAnimationComplete={()=>{if(dialog.current?.dataset.roomGalleryPhase==='opening'){dialog.current.dataset.roomGalleryPhase='open';performance.mark('room-gallery-open-complete');}}} style={{width:selection.width,height:selection.height}}>
       <motion.div layoutId={`image-${selection.photo.id}`} layout="position" transition={transition} className="sg-room-shared-image"><img src={selection.photo.image.src} alt={selection.photo.image.alt} decoding="async" draggable={false}/></motion.div>
      </motion.div>}
     </AnimatePresence>
    </motion.div>
    <button ref={closeButton} className="sg-room-lightbox-close" type="button" onClick={close} aria-label="Close room photograph">Close <span aria-hidden="true">×</span></button>
    <p className="sg-room-lightbox-status" role="status">{status}</p>
   </dialog>
  </LayoutGroup>
  {!selection&&!closing.current&&status&&<p className="sg-room-grid-status" role="status">{status}</p>}
 </section>;
}
