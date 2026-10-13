"use client";
import {useLayoutEffect, useRef, type ReactNode} from "react";
import {usePathname, useRouter} from "next/navigation";
import {gsap} from "gsap";
import {menuTimeline} from "./menu-timeline";
import "./logo-screen-transition.css";

export const LOGO_SCREEN_NAVIGATION = "sodai:signature-logo-screen";
type Intent = {kind:"home"|"cms";href:string;host:HTMLElement;closedRailColor:string;release:()=>void};

// This boundary survives public -> admin layout replacement. Only the outgoing
// menu is copied; the incoming screen is the actual authenticated route tree.
export function LogoScreenTransition({children}:{children:ReactNode}) {
  const root = useRef<HTMLDivElement>(null), router = useRouter(), pathname = usePathname();
  const route = useRef(pathname);route.current = pathname;
  const ready = useRef<()=>void>(()=>{});
  useLayoutEffect(() => {
    const incoming = root.current!;
    let active: {intent:Intent;layer:HTMLElement;screen:HTMLElement;finish:(focus?:boolean)=>void;started:boolean}|undefined;
    let timeline:gsap.core.Timeline|undefined, observer:MutationObserver|undefined, timeout:ReturnType<typeof setTimeout>|undefined;
    const attempt = () => {
      const task = active;
      if(!task || task.started) return;
      const isCms = task.intent.kind === "cms";
      const arrived = isCms ? route.current.startsWith("/admin") && incoming.querySelector(".cms,.login-page") : route.current === task.intent.href && incoming.querySelector(".sg-site");
      if(!arrived) return;
      task.started = true;observer?.disconnect();
      if(timeout) clearTimeout(timeout);
      window.scrollTo({top:0,left:0,behavior:"instant"});
      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      performance.mark("signature-logo:ready");
      if(reduced) {
        timeline = gsap.timeline({onComplete:()=>task.finish(true)}).to(task.layer,{opacity:0,duration:.14});
      } else if(isCms) {
        // Settings -> Photos, supplied reference 3.7-4.2s: right-to-left screen
        // exchange, a restrained recession, and a dark gap between screens.
        gsap.set(incoming,{position:"relative",zIndex:20002,transformOrigin:"50% 50vh",willChange:"transform,opacity",transformPerspective:1400});
        timeline = gsap.timeline({defaults:{duration:.75,ease:"power3.out"},onComplete:()=>task.finish(true)})
          .fromTo(incoming,{x:innerWidth,scale:.91,rotationY:-5,opacity:.65},{x:0,scale:1,rotationY:0,opacity:1},0)
          .to(task.screen,{x:-innerWidth*.4,scale:.9,rotationY:6,opacity:.3,transformOrigin:"50% 50%"},0);
      } else {
        // The handle's exact timeline, reversed at its normal speed. No public
        // hero morph or generic route fade is dispatched by this gesture.
        task.layer.style.background = "transparent";
        timeline = menuTimeline(task.screen.querySelector<HTMLElement>(".sg-navigation-shell")!,task.intent.closedRailColor,!!task.screen.querySelector(".sg-menu-fidelity"),{onReverseComplete:()=>task.finish(true)});
        timeline.progress(1,true).reverse();
      }
    };
    ready.current = attempt;
    const start = (event:Event) => {
      if(active) return; // One commit even when more clicks arrive during flight.
      const intent = (event as CustomEvent<Intent>).detail;
      if(!intent?.host?.isConnected || (intent.href !== "/admin" && !intent.href.startsWith("/"))) return;
      const layer = document.createElement("div");layer.className="sg-logo-screen-layer";layer.inert=true;layer.setAttribute("aria-hidden","true");
      const site = intent.host.closest<HTMLElement>(".sg-site");
      const screen = (site?.cloneNode(false) || document.createElement("div")) as HTMLElement;
      screen.classList.add("sg-logo-outgoing");screen.append(intent.host.cloneNode(true));
      screen.querySelectorAll("[id]").forEach(node=>node.removeAttribute("id"));
      screen.querySelectorAll("[aria-modal],[role='dialog']").forEach(node=>{node.removeAttribute("aria-modal");node.removeAttribute("role");});
      layer.append(screen);document.body.append(layer);
      intent.release();
      const savedStyle = incoming.getAttribute("style"), savedInert = incoming.inert;
      const htmlOverflow = document.documentElement.style.overflow, bodyOverflow = document.body.style.overflow;
      incoming.inert=true;document.documentElement.style.overflow="hidden";document.body.style.overflow="hidden";
      const finish = (focus=false) => {
        if(!active || active.layer !== layer) return;
        timeline?.kill();timeline=undefined;observer?.disconnect();if(timeout)clearTimeout(timeout);
        active=undefined;layer.remove();incoming.inert=savedInert;
        if(savedStyle === null)incoming.removeAttribute("style");else incoming.setAttribute("style",savedStyle);
        document.documentElement.style.overflow=htmlOverflow;document.body.style.overflow=bodyOverflow;
        performance.mark("signature-logo:finished");
        if(focus){const target=incoming.querySelector<HTMLElement>("main h1,main,.cms h1,.cms");if(target){if(!target.hasAttribute("tabindex"))target.tabIndex=-1;target.focus({preventScroll:true});}}
      };
      active={intent,layer,screen,finish,started:false};
      performance.mark("signature-logo:start");
      observer=new MutationObserver(attempt);observer.observe(incoming,{subtree:true,childList:true});
      // Keep the complete red menu visible during slow authentication/RSC reads.
      // A failed navigation must never strand a pointer/focus/scroll lock.
      timeout=setTimeout(()=>finish(true),8000);
      if(intent.href !== route.current)router.push(intent.href,{scroll:true});
      else attempt();
    };
    const cancel = () => active?.finish(true);
    const escape = (event:KeyboardEvent) => {if(event.key === "Escape")cancel();};
    window.addEventListener(LOGO_SCREEN_NAVIGATION,start);
    window.addEventListener("resize",cancel);window.addEventListener("popstate",cancel);document.addEventListener("keydown",escape,true);
    return () => {active?.finish();ready.current=()=>{};window.removeEventListener(LOGO_SCREEN_NAVIGATION,start);window.removeEventListener("resize",cancel);window.removeEventListener("popstate",cancel);document.removeEventListener("keydown",escape,true);};
  },[router]);
  useLayoutEffect(()=>{ready.current();},[pathname]);
  return <div ref={root} className="sg-logo-route-root">{children}</div>;
}
