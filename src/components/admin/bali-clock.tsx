"use client";
import {useEffect,useLayoutEffect,useRef,useState} from "react";
import {animate,motion,useMotionValue,useReducedMotion,useTransform} from "motion/react";
import {baliClock} from "./login-interactions";

// Adapted from the supplied Dynamic Island: one spring drives all shape
// dimensions; compact/expanded content crossfades instead of stretching.
export function BaliClock(){
 const [now,setNow]=useState<ReturnType<typeof baliClock>|null>(null),[open,setOpen]=useState(false);
 const reduced=useReducedMotion(),progress=useMotionValue(0),timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 const width=useTransform(progress,[0,1],[176,304]),height=useTransform(progress,[0,1],[44,104]),radius=useTransform(progress,[0,1],[22,28]);
 const compact=useTransform(progress,[0,.35,1],[1,0,0]),expanded=useTransform(progress,[0,.45,1],[0,0,1]);
 useEffect(()=>{const update=()=>setNow(baliClock(new Date()));update();const interval=setInterval(update,1000);return ()=>{clearInterval(interval);clearTimeout(timer.current);};},[]);
 useLayoutEffect(()=>{const animation=animate(progress,open?1:0,reduced?{duration:0}:{type:"spring",stiffness:380,damping:34,mass:.9});return ()=>animation.stop();},[open,reduced,progress]);
 const toggle=()=>{clearTimeout(timer.current);const next=!open;setOpen(next);if(next)timer.current=setTimeout(()=>setOpen(false),6000);};
 return <div className="login-clock">
  <motion.button type="button" className="login-island" aria-expanded={open} aria-label={open?"Bali time. Hide full date and time":"Bali time. Show full date and time"} onClick={toggle} onKeyDown={event=>{if(event.key==="Escape"){clearTimeout(timer.current);setOpen(false);}}} style={{width,height,borderRadius:radius}}>
   <motion.span className="login-clock-compact" aria-hidden={open} style={{opacity:compact}}><span className="login-clock-dot"/><time>{now?.time||"--:--"}</time><span>WITA</span></motion.span>
   <motion.span className="login-clock-expanded" aria-hidden={!open} style={{opacity:expanded}}><span>Bali time · WITA</span><time>{now?.seconds||"--:--:--"}</time><span>{now?.date||"Loading local time"}</span></motion.span>
  </motion.button>
  <span className="login-clock-caption">Bali time</span>
 </div>;
}
