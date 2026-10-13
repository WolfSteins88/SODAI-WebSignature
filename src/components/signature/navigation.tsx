"use client";
import {navigationLinks} from "@/lib/content/visibility";
import {publicPaths} from "@/lib/content/public-routes";
import {culinaryTitle} from "@/lib/content/signature-labels";
import { MotionLink as Link, useReducedMotion } from "./motion";
import { gsap } from "gsap";
import {menuTimeline} from "./menu-timeline";
import {createLogoGesture} from "./logo-gesture";
import {LOGO_SCREEN_NAVIGATION} from "./logo-screen-transition";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { VillaContent } from "@/lib/schemas/content";
import { enabledModules } from "@/lib/content/public-routes";
import { Photo } from "../standard/photo";
import { createMenuController, type MenuPhase } from "./menu-controller";
import { MENU_NAVIGATION, CANCEL_MENU_NAVIGATION } from "./menu-hero-transition";
import { SocialLinks } from "./social-links";
import { SignatureReservation } from "./reservation";
import { bookingLinks } from "@/lib/schemas/content";

// Bencho Dock's cosine falloff, adapted to stationary text links (MIT notice in THIRD_PARTY_NOTICES.md).
function dockItems(group: HTMLElement) {
  return Array.from(group.querySelectorAll<HTMLAnchorElement>(".sg-dock-item"));
}
function resetDock(group: HTMLElement) {
  dockItems(group).forEach((item) => item.style.setProperty("--dock-scale", "1"));
}
function setDock(group: HTMLElement, clientY: number) {
  const items = dockItems(group);
  if (!items.length) return;
  const centers = items.map((item) => { const rect = item.getBoundingClientRect(); return rect.top + rect.height / 2; });
  const nearest = centers.reduce((best, center, index) => Math.abs(center - clientY) < Math.abs(centers[best] - clientY) ? index : best, 0);
  items.forEach((item, index) => {
    const distance = Math.abs(index - nearest), spread = 2;
    const factor = distance > spread ? 0 : (1 + Math.cos(Math.PI * distance / (spread + 1))) / 2;
    item.style.setProperty("--dock-scale", (1 + .14 * factor).toFixed(3));
  });
}

export function SignatureNavigation({
  content,
  prefix,
  room,
}: {
  content: VillaContent;
  prefix: string;
  room?: string;
}) {
  const [phase, setPhase] = useState<MenuPhase>("closed");
  const open = phase === "opening" || phase === "open";
  const reduced = useReducedMotion(), reducedRef = useRef(reduced);
  reducedRef.current = reduced;
  const animation = useRef<gsap.core.Timeline | null>(null);
  const closedRailColor = useRef("");
  const dialog = useRef<HTMLDivElement>(null), shell = useRef<HTMLDivElement>(null),
    trigger = useRef<HTMLButtonElement>(null);
  const controller = useRef<ReturnType<typeof createMenuController> | null>(null);
  const pathname = usePathname(), router = useRouter(), modules = enabledModules(content,"signature");
  const currentRoute = useRef({ pathname, router });
  const logoGesture = useRef<ReturnType<typeof createLogoGesture> | null>(null);
  const pendingNavigation = useRef<string | null>(null);
  const pendingExit = useRef<{href:string;resolve:(proceed:boolean)=>void}|null>(null);
  currentRoute.current = { pathname, router };
  const menu = content.signatureMenu;
  const referenceLabels = menu?.referenceLabels;
  const whatsapp = bookingLinks(content, room).whatsapp;
  const links = navigationLinks(content,[
    [referenceLabels ? "Our Story" : "Our story", "/"],
    ["Rooms", "/rooms"],
    ...(modules.dining ? [[culinaryTitle(content.dining.title), "/dining"]] : []),
    ...(modules.culture ? [[referenceLabels ? "Cultures" : "Culture Bali", "/cultures"]] : []),
    ...(!referenceLabels && modules.experiences ? [["Experiences", "/experiences"]] : []),
    ...(content.signatureGallery?.enabled!==false ? [["Gallery", "/gallery"]] : []),
    ...(modules.packages ? [[referenceLabels ? "Packages & Activities" : "Packages", "/packages"]] : []),
    ...(content.signatureLocation?.enabled!==false ? [[referenceLabels ? "Getting Here" : "Find us", "/location"]] : []),
  ]).filter(([,href])=>publicPaths(content,"signature").includes(href));
  useLayoutEffect(() => {
    const overlay = dialog.current!, host = shell.current!, handle = trigger.current!;
    let unlock: (() => void) | undefined;
    function activate() {
      overlay.hidden = false;
      overlay.inert = false;
      overlay.dataset.active = "";
      host.setAttribute("role", "dialog");
      host.setAttribute("aria-modal", "true");
      host.setAttribute("aria-labelledby", "signature-menu-title");
      host.dataset.signatureMenuActive = "";
      if (unlock) return;
      const x = window.scrollX, y = window.scrollY;
      const styles = [document.documentElement, document.body].map(element => ({ element,
        overflow: element.style.getPropertyValue("overflow"), priority: element.style.getPropertyPriority("overflow"),
        overscroll: element.style.getPropertyValue("overscroll-behavior"), overscrollPriority: element.style.getPropertyPriority("overscroll-behavior") }));
      const siblings = Array.from(host.parentElement!.children).filter((el): el is HTMLElement => el instanceof HTMLElement && el !== host);
      const inert = siblings.map(element => ({element, previous: element.inert}));
      inert.forEach(({element}) => { element.inert = true; });
      styles.forEach(({element}) => { element.style.setProperty("overflow", "hidden"); element.style.setProperty("overscroll-behavior", "none"); });
      unlock = () => {
        inert.forEach(({element, previous}) => { element.inert = previous; });
        styles.forEach(({element, overflow, priority, overscroll, overscrollPriority}) => {
          if (overflow) element.style.setProperty("overflow", overflow, priority); else element.style.removeProperty("overflow");
          if (overscroll) element.style.setProperty("overscroll-behavior", overscroll, overscrollPriority); else element.style.removeProperty("overscroll-behavior");
        });
        if (window.scrollX !== x || window.scrollY !== y) window.scrollTo({left:x, top:y, behavior:"instant"});
      };
      handle.focus({preventScroll:true});
    }
    function deactivate(restoreFocus: boolean) {
      logoGesture.current?.cancel();
      overlay.inert = true;
      overlay.hidden = true;
      delete overlay.dataset.active;
      delete host.dataset.signatureMenuActive;
      host.removeAttribute("role"); host.removeAttribute("aria-modal"); host.removeAttribute("aria-labelledby");
      overlay.querySelectorAll<HTMLElement>(".sg-dock-group").forEach(resetDock);
      const release = unlock; unlock = undefined; release?.();
      if (restoreFocus) handle.focus({preventScroll:true});
    }
    const state = createMenuController({
      phase: next => { overlay.dataset.phase = next; setPhase(next); }, activate, deactivate,
      move: (opening, navigation) => {
        const timeline = animation.current!;
        // Reverse this same timeline; never create a second logo exit. Allow
        // ~220ms for a complete logo exit, less when opening was interrupted.
        timeline.timeScale(navigation !== "default" ? timeline.duration() / .22 : 1);
        if (reducedRef.current) {
          timeline.pause().progress(opening ? 1 : 0, true);
          if (opening) state.opened(); else state.closed();
        } else if (opening) timeline.play();
        else if (timeline.progress() === 0) state.closed();
        else timeline.reverse();
      },
      navigate: (href, navigation) => {
        // Enter a fresh document after releasing the modal lock. Admin must not
        // inherit public hero timelines, intro layers, or ScrollTriggers.
        if (navigation === "admin") { window.location.assign("/admin"); return; }
        if(navigation === "menu" && pendingExit.current?.href===href){const exit=pendingExit.current;pendingExit.current=null;exit.resolve(true);return;}
        if (href === currentRoute.current.pathname) {
          if (navigation !== "default") {
            window.scrollTo({top:0, left:0, behavior:"instant"});
            const main = host.parentElement?.querySelector<HTMLElement>("main");
            if (main) { main.tabIndex = -1; main.focus({preventScroll:true}); }
          } else handle.focus({preventScroll:true});
          return;
        }
        if (pendingNavigation.current === href) return;
        pendingNavigation.current = href;
        if (navigation === "menu") {
          // Leave the menu GSAP callback context before creating the persistent
          // route timeline; unmounting the old menu must not revert that timeline.
          window.dispatchEvent(new CustomEvent("sodai:signature-navigation",{detail:{href,transition:"fade"}}));currentRoute.current.router.push(href);
        } else {
          window.dispatchEvent(new CustomEvent("sodai:signature-navigation", {detail:{href, transition:navigation === "logo" ? "fade" : undefined}}));
          currentRoute.current.router.push(href);
        }
      },
    });
    controller.current = state;
    const context = gsap.context(() => {
      closedRailColor.current = getComputedStyle(host.querySelector(".sg-rail")!).backgroundColor;
      animation.current = menuTimeline(host, closedRailColor.current, !!menu, {onComplete:state.opened, onReverseComplete:state.closed});
    }, host);
    function keydown(event: KeyboardEvent) {
      if(event.key === "Escape") logoGesture.current?.cancel();
      if (event.key === "Escape" && (pendingExit.current || document.querySelector(".sg-menu-route-layer,.sg-handle-route-layer"))) { event.preventDefault(); pendingNavigation.current=null;pendingExit.current?.resolve(false);pendingExit.current=null;window.dispatchEvent(new Event(CANCEL_MENU_NAVIGATION));if(state.phase!=="closed")state.request(false);else handle.focus({preventScroll:true});return; }
      if (state.phase === "closed") return;
      if (event.key === "Escape") { event.preventDefault(); state.request(false); return; }
      if (event.key !== "Tab") return;
      const items = [handle, ...Array.from(overlay.querySelectorAll<HTMLElement>("a[href],button:not(:disabled),[tabindex='0']"))].filter(el => el.getClientRects().length && !el.closest("[inert]"));
      const first = items[0], last = items[items.length-1];
      if (event.shiftKey && (document.activeElement === first || !host.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !host.contains(document.activeElement))) { event.preventDefault(); first?.focus(); }
    }
    function focusin(event: FocusEvent) {
      if (state.phase !== "closed" && !host.contains(event.target as Node)) handle.focus({preventScroll:true});
    }
    function resizeNavigation() {
      if(!pendingExit.current&&!document.querySelector(".sg-menu-route-layer,.sg-handle-route-layer"))return;
      pendingNavigation.current=null;pendingExit.current?.resolve(false);pendingExit.current=null;
      window.dispatchEvent(new Event(CANCEL_MENU_NAVIGATION));
      // A resize cancels the destination intent as well as its picture layer.
      // The same reverse timeline then releases its lock and restores the handle.
      if(state.phase!=="closed")state.request(false);else handle.focus({preventScroll:true});
    }
    document.addEventListener("keydown", keydown, true);
    document.addEventListener("focusin", focusin);
    window.addEventListener("resize",resizeNavigation);
    return () => {
      pendingExit.current?.resolve(false);pendingExit.current=null;animation.current?.pause(); state.reset(); deactivate(false); context.revert(); controller.current = null;
      document.removeEventListener("keydown", keydown, true); document.removeEventListener("focusin", focusin);
      window.removeEventListener("resize",resizeNavigation);
    };
  }, []);
  useEffect(() => { pendingNavigation.current = null; animation.current?.pause().progress(0,true); controller.current?.reset(); }, [pathname]);
  useEffect(() => {
    const state = controller.current;
    if (reduced && state && state.phase !== "closed") state.request(state.phase === "opening" || state.phase === "open");
  }, [reduced]);
  function cancelTransition() { pendingNavigation.current=null;pendingExit.current?.resolve(false);pendingExit.current=null;window.dispatchEvent(new Event(CANCEL_MENU_NAVIGATION)); }
  function select(href: string) {
    cancelTransition();router.prefetch(href);
    if(href===pathname){controller.current?.request(false,href,"menu");return;}
    pendingNavigation.current=href;
    const exit=new Promise<boolean>(resolve=>{pendingExit.current={href,resolve};});
    // Prepare behind the exiting red panel, before its reverse completion.
    queueMicrotask(()=>{if(pendingNavigation.current===href)window.dispatchEvent(new CustomEvent(MENU_NAVIGATION,{detail:{href,exit,commit:()=>{if(pendingNavigation.current===href)currentRoute.current.router.push(href);}}}));});
    controller.current?.request(false,href,"menu");
  }
  function panelLogoNavigate(kind: "home" | "cms") {
    cancelTransition();
    const host = shell.current;
    if (!host || controller.current?.phase === "closed") return;
    window.dispatchEvent(new CustomEvent(LOGO_SCREEN_NAVIGATION, {detail:{kind, href:kind === "cms" ? "/admin" : prefix + "/", host,
      closedRailColor:closedRailColor.current,
      release:() => { animation.current?.pause().progress(0,true);controller.current?.reset(); },
    }}));
  }
  useEffect(() => {
    const gesture = createLogoGesture(() => panelLogoNavigate("home"), () => panelLogoNavigate("cms"));
    logoGesture.current = gesture;
    return () => {gesture.cancel();logoGesture.current = null;};
  }, [prefix, pathname]);
  function selectLogo(href: string) {
    if(controller.current?.phase!=="closed"){select(href);return;}
    if(href===pathname){window.scrollTo({top:0,left:0,behavior:'instant'});return;}
    if(pendingNavigation.current===href||document.querySelector('.sg-handle-route-layer'))return;
    cancelTransition();pendingNavigation.current=href;router.prefetch(href);
    window.dispatchEvent(new CustomEvent(MENU_NAVIGATION,{detail:{href,source:'logo',exit:Promise.resolve(true),commit:()=>currentRoute.current.router.push(href)}}));
  }
  const dockEvents = {
    onPointerMove: (event: React.PointerEvent<HTMLElement>) => {
      if (reduced || event.pointerType !== "mouse" || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      setDock(event.currentTarget, event.clientY);
    },
    onPointerLeave: (event: React.PointerEvent<HTMLElement>) => resetDock(event.currentTarget),
    onFocusCapture: (event: React.FocusEvent<HTMLElement>) => {
      const group = event.currentTarget, item = (event.target as Element).closest<HTMLAnchorElement>(".sg-dock-item");
      resetDock(group);
      if (item && !reduced) item.style.setProperty("--dock-scale", "1.06");
    },
    onBlurCapture: (event: React.FocusEvent<HTMLElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node)) resetDock(event.currentTarget);
    },
  };
  return (
    <div ref={shell} className="sg-navigation-shell">
      <a className="sg-skip" href="#signature-main">
        Skip to content
      </a>
      <header className="sg-rail">
        <Link
          className="sg-mark"
          href={prefix + "/"}
          navigate={selectLogo}
          aria-label={`${content.name} home`}
        >
          {content.signatureStory?.railEmblem ? <Photo image={content.signatureStory.railEmblem} sizes="32px" /> : <svg viewBox="0 0 40 40" aria-hidden="true">
            <circle cx="20" cy="20" r="18" />
            <path d="M20 5v30M5 20h30M9 9l22 22M9 31L31 9" />
            <circle cx="20" cy="20" r="6" />
          </svg>}
        </Link>
        <span className="sg-rail-name">{content.name}</span>
        <button
          ref={trigger}
          className="sg-menu-button"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="signature-menu"
          onClick={() => { cancelTransition(); controller.current?.toggle(); }}
        >
          <span />
          <span />
        </button>
        {content.signatureStory && bookingLinks(content).whatsapp && <a className="sg-rail-whatsapp" href={bookingLinks(content).whatsapp!} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
      </header>
      <SignatureReservation content={content} room={room} menuOpen={phase !== "closed"} />
      <div
        ref={dialog}
        id="signature-menu"
        className={`sg-menu ${menu ? "sg-menu-fidelity" : ""}`}
        hidden
        inert
      >
        {menu && <div className="sg-menu-rail">

          <span className="sg-menu-rail-rule" aria-hidden="true" />
          {whatsapp && <a href={whatsapp} target="_blank" rel="noreferrer">WHATSAPP</a>}
        </div>}
        <div className="sg-menu-image">
          <Photo image={menu?.photo || content.hero} sizes="(max-width:900px) 0px,150vw" />
        </div>
        <div className="sg-menu-content">
          <div className="sg-menu-heading">
            <h2 id="signature-menu-title" className={menu ? "sr-only" : undefined}>{content.name} navigation</h2>
            {menu && <><a className="sg-menu-logo" href={prefix + "/"} aria-label={`${content.name} home`} aria-describedby="signature-logo-shortcut"
              onPointerEnter={() => {router.prefetch(prefix + "/");router.prefetch("/admin");}}
              onFocus={() => {router.prefetch(prefix + "/");router.prefetch("/admin");}}
              onBlur={() => logoGesture.current?.cancel()}
              onClick={event => {
                if(event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {logoGesture.current?.cancel();return;}
                event.preventDefault();
                if(event.detail === 0) {logoGesture.current?.cancel();panelLogoNavigate("home");}
                else logoGesture.current?.click();
              }}
              onKeyDown={event => {if(event.key === "Enter" && event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey){event.preventDefault();logoGesture.current?.cancel();panelLogoNavigate("cms");}}}
            ><Photo image={menu.logo} sizes="6vw" /></a><span id="signature-logo-shortcut" className="sr-only">Activate to go home. Double-click or double-tap, or press Shift+Enter, to open CMS. Authentication is required.</span></>}

          </div>
          <nav aria-label="Signature navigation" className="sg-dock-group" {...dockEvents}>
            {links
              .filter(
                ([, href]) => !["/packages", "/location", "/experiences"].includes(href),
              )
              .map(([label, href]) => (
                <div key={href}>
                  <Link
                    href={prefix + href}
                    navigate={select}
                    className="sg-dock-item"
                    aria-current={
                      pathname === prefix + href ? "page" : undefined
                    }
                  >
                    <span className="sg-dock-text">{label}</span>
                  </Link>
                  {!referenceLabels && href === "/rooms" && (
                    <ul>
                      {content.rooms.map((item) => (
                        <li key={item.slug}>
                          <Link
                            href={`${prefix}/rooms/${item.slug}`}
                            navigate={select}
                          >
                            {item.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
          </nav>
          <div className="sg-menu-secondary sg-dock-group" {...dockEvents}>
            {navigationLinks(content,[...(modules.foundation?[["The Foundation","/foundation"]]:[]),...links.filter(([,href])=>["/packages","/location","/experiences"].includes(href)),...(modules.terms?[["Terms & Conditions","/terms"]]:[])]).filter(([,href])=>publicPaths(content,"signature").includes(href)).map(([label,href])=><Link key={href} href={prefix+href} navigate={select} className="sg-dock-item"><span className="sg-dock-text">{label}</span></Link>)}
          </div>
          <div className="sg-menu-contact">
            <p>{menu?.contactTitle || "Get in Touch"}</p>
            <SocialLinks links={menu?.social || []} email={menu?.email || content.email}/>
          </div>
          {menu && <footer className="sg-menu-legal"><span>{menu.legal}</span>{menu.credit && <span>{menu.credit}</span>}</footer>}
        </div>
      </div>
    </div>
  );
}
