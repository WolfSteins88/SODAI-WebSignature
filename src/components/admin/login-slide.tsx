"use client";
import {useLayoutEffect,useRef} from "react";
import {animate,motion,useMotionValue,useReducedMotion,useTransform,type AnimationPlaybackControls} from "motion/react";
import {createSlideGesture} from "./login-interactions";
export type LoginPhase="idle"|"pending"|"success";

// Supplied SlideConfirm adaptation: the grip grows leftward from a pinned
// right edge. Real request state replaces the showcase's timed reset.
export function LoginSlide({phase,validate,onConfirm}:{phase:LoginPhase;validate:()=>boolean;onConfirm:()=>void}){
 const track=useRef<HTMLDivElement>(null),grip=useRef<HTMLButtonElement>(null),gesture=useRef(createSlideGesture());
 const x=useMotionValue(0),anchor=useMotionValue(0),travel=useMotionValue(0),reduced=useReducedMotion();
 const busy=useRef(phase!=="idle");busy.current=phase!=="idle";
 const reducedRef=useRef(!!reduced);reducedRef.current=!!reduced;
 const cleanup=useRef<()=>void>(()=>{}),animation=useRef<AnimationPlaybackControls|null>(null);
 const seen=useTransform(()=>Math.max(0,Math.min(travel.get(),x.get())));
 const width=useTransform(()=>48+Math.max(0,anchor.get()-seen.get()));
 const wash=useTransform(()=>seen.get()+48);
 const labelOpacity=useTransform(()=>1-Math.min(1,seen.get()/Math.max(1,travel.get()*.55)));
 function stopDrag(){gesture.current.cancel();cleanup.current();}
 function home(){
  animation.current?.stop();
  const spring=reducedRef.current?{duration:0}:{type:"spring" as const,stiffness:580,damping:46,mass:.9};
  if(anchor.get()>0){x.set(0);animation.current=animate(anchor,0,spring);}
  else animation.current=animate(x,0,spring);
 }
 useLayoutEffect(()=>{
  const node=track.current!;
  const measure=()=>{stopDrag();animation.current?.stop();travel.set(Math.max(0,node.clientWidth-54));x.set(0);anchor.set(busy.current?travel.get():0);};
  measure();const observer=new ResizeObserver(measure);observer.observe(node);
  const cancel=()=>{if(!busy.current){stopDrag();home();}};
  window.addEventListener("blur",cancel);
  return ()=>{stopDrag();animation.current?.stop();observer.disconnect();window.removeEventListener("blur",cancel);};
 },[]);
 useLayoutEffect(()=>{
  stopDrag();animation.current?.stop();
  if(phase==="idle"){home();return;}
  if(phase==="pending"){
   x.set(travel.get());anchor.set(travel.get());
   animation.current=animate(x,0,reduced?{duration:0}:{type:"spring",stiffness:580,damping:46,mass:.9});
  }
 },[phase,reduced]);
 function down(event:React.PointerEvent<HTMLButtonElement>){
  if(busy.current || event.button!==0)return;
  event.preventDefault();if(!validate())return;
  event.currentTarget.focus();stopDrag();animation.current?.stop();
  const rect=track.current!.getBoundingClientRect();
  gesture.current.start(event.pointerId,event.clientX,seen.get(),travel.get(),rect.width/track.current!.clientWidth);
  const target=event.currentTarget,id=event.pointerId;
  target.dataset.held="true";
  try{target.setPointerCapture(id);}catch{/* Window listeners do not depend on capture. */}
  const move=(e:PointerEvent)=>{const position=gesture.current.move(e.pointerId,e.clientX);if(position!==null)x.set(position);};
  const up=(e:PointerEvent)=>{
   if(e.type!=="pointercancel")move(e);
   const result=gesture.current.finish(e.pointerId,e.type==="pointercancel");if(!result.matched)return;
   cleanup.current();if(result.commit)onConfirm();else home();
  };
  const escape=(e:KeyboardEvent)=>{if(e.key==="Escape"){stopDrag();home();}};
  window.addEventListener("pointermove",move);window.addEventListener("pointerup",up);window.addEventListener("pointercancel",up);window.addEventListener("keydown",escape);
  cleanup.current=()=>{
   window.removeEventListener("pointermove",move);window.removeEventListener("pointerup",up);window.removeEventListener("pointercancel",up);window.removeEventListener("keydown",escape);
   delete target.dataset.held;try{target.releasePointerCapture(id);}catch{/* Capture may already be released. */}
   cleanup.current=()=>{};
  };
 }
 return <div className="login-slide" ref={track} data-phase={phase}>
  <motion.i className="login-slide-wash" aria-hidden="true" style={{width:wash}}/>
  <motion.span className="login-slide-label" aria-hidden="true" style={{opacity:phase==="idle"?labelOpacity:0}}>Slide to sign in</motion.span>
  <motion.button ref={grip} type="button" className="login-slide-grip" disabled={phase!=="idle"} aria-label={phase==="pending"?"Signing in":phase==="success"?"Sign-in confirmed":"Slide to sign in"} aria-describedby="login-slide-help" style={{x:seen,width}}
   onPointerDown={down} onKeyDown={event=>{if((event.key==="Enter"||event.key===" ")&&!busy.current){event.preventDefault();stopDrag();if(validate())onConfirm();}}}>
   <span className="login-slide-arrow" aria-hidden="true" hidden={phase!=="idle"}>↗</span>
   <span className="login-slide-answer" aria-hidden="true" hidden={phase==="idle"}>{phase==="success"?<><span>✓</span> Confirmed</>:"Signing in…"}</span>
  </motion.button>
  <span id="login-slide-help" className="sr-only">Drag the handle to the end and release, or press Enter or Space to sign in.</span>
 </div>;
}
