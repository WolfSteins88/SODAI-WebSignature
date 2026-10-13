"use client";
import { useEffect } from "react";

/** Opt-in local review instrumentation; no network transport or public controls. */
export function PerformanceReview() {
  useEffect(() => {
    let frame = 0, active = false, start = 0;
    let frames: { time: number; scroll: number; heroPhase:string|null; hidden:boolean; galleryPhase:string|null; hero:unknown; intro:unknown }[] = [];
    let entries: unknown[] = [];
    let observers: PerformanceObserver[] = [];
    function tick(time: number) {
      const layer=document.querySelector<HTMLElement>(".sg-menu-route-layer"),plane=layer?.querySelector<HTMLElement>(".sg-menu-hero-frame");
      // Inline paint values only; opt-in evidence must not introduce layout reads.
      const hero=layer?{frame:plane?.style.cssText,background:layer.querySelector<HTMLElement>(".sg-menu-route-background")?.style.opacity||"1",copy:layer.querySelector<HTMLElement>(":scope > .sg-site")?.style.opacity??null,fallback:layer.dataset.fallback||null,images:Array.from(plane?.querySelectorAll<HTMLImageElement>("img")||[]).map(image=>({src:image.src,opacity:image.style.opacity||"1",transform:image.style.transform})),route:document.querySelector<HTMLElement>(".sg-site")?.dataset.signatureRoute}:null;
      const introLayer=document.querySelector<HTMLElement>('[data-home-intro]');
      const intro=introLayer?{phase:introLayer.dataset.phase,overlay:introLayer.style.opacity,brand:introLayer.querySelector<HTMLElement>('.sg-home-intro-brand')?.style.opacity,emblem:introLayer.querySelector<HTMLElement>('.sg-intro-emblem')?.style.transform,wordmark:introLayer.querySelector<HTMLElement>('.sg-intro-wordmark')?.style.transform||'',title:document.querySelector<HTMLElement>('.sg-ref-opener h1')?.style.opacity,rail:document.querySelector<HTMLElement>('.sg-rail')?.style.opacity}:null;
      frames.push({ intro, time, scroll: scrollY, heroPhase:layer?.dataset.phase||null, hidden:document.hidden,galleryPhase:document.querySelector<HTMLElement>("dialog.sg-room-lightbox")?.dataset.roomGalleryPhase||null,hero });
      frame = requestAnimationFrame(tick);
    }
    function stop() {
      if (!active) return;
      active = false;
      cancelAnimationFrame(frame);
      observers.forEach((observer) => { entries.push(...observer.takeRecords().map((entry) => entry.toJSON())); observer.disconnect(); });
      const report = document.createElement("script");
      report.id = "signature-performance-report";
      report.type = "application/json";
      document.getElementById(report.id)?.remove();
      report.textContent = JSON.stringify({ start, end: performance.now(), userAgent: navigator.userAgent, viewport: [innerWidth, innerHeight], dpr: devicePixelRatio, supported: PerformanceObserver.supportedEntryTypes, intro:performance.getEntriesByName('signature-intro').map(entry=>entry.toJSON()), frames, entries });
      document.body.append(report);
      document.documentElement.dataset.performanceReview = "complete";
    }
    function begin() {
      stop();
      active = true; start = performance.now(); frames = []; entries = []; observers = [];
      ["longtask", "long-animation-frame", "resource", "event", "mark", "measure"].forEach((type) => {
        if (!PerformanceObserver.supportedEntryTypes.includes(type)) return;
        const observer = new PerformanceObserver((list) => entries.push(...list.getEntries().map((entry) => entry.toJSON())));
        observer.observe({ type }); observers.push(observer);
      });
      document.documentElement.dataset.performanceReview = "recording";
      frame = requestAnimationFrame(tick);
    }
    function key(event:KeyboardEvent){
      if(!event.ctrlKey||!event.shiftKey)return;
      if(event.code==='KeyS'){event.preventDefault();stop();}
      if(event.code==='KeyP'){event.preventDefault();begin();}
    }
    // Local opt-in instrumentation starts before the first intro animation frame.
    const autoIntro=document.documentElement.dataset.signatureIntro==='pending';
    if(autoIntro)begin();
    const introDone=()=>{if(autoIntro)stop();};
    window.addEventListener('sodai:signature-intro-finished',introDone);
    window.addEventListener("keydown", key);
    return () => { stop(); window.removeEventListener('sodai:signature-intro-finished',introDone); window.removeEventListener("keydown", key); };
  }, []);
  return null;
}
