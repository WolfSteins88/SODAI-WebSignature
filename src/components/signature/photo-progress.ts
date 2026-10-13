"use client";
import { useLayoutEffect, type RefObject } from "react";
import { gsap } from "gsap";
import { registerScrollScene } from "./scroll-frame";
import { PHOTO_RELEASE } from "./photo-ownership";

// One linear mapping, shared by every marked main photograph and the handoff.
export const PHOTO_ENTRANCE = { established: 0.75 } as const;
export const entranceProgress = (value: number) => Math.max(0, Math.min(1, value));

type PhotoScene = {
  photo: HTMLElement; timeline: gsap.core.Timeline; start: number; distance: number;
  track: HTMLElement | null; horizontal: boolean; flowTop: number; previous: number;
  strip: HTMLElement | null; stripStart: number; stripDistance: number;
  tone: { gray: number };
};
/** Only deliberate main-photo markers participate. No React rendering during scroll. */
export function usePhotoProgress(root: RefObject<HTMLDivElement | null>, route: string, reduced: boolean) {
  useLayoutEffect(() => {
    const host = root.current;
    if (!host) return;
    let scenes: PhotoScene[] = [], mounted = true;
    const collect = () => {
      scenes.forEach(s => s.timeline.revert());
      scenes = Array.from(host.querySelectorAll<HTMLElement>('.sg-site:not([inert]) [data-signature-main-photo]')).map(photo => {
        const tone = { gray: 1 };
        return {
        photo, tone, timeline: gsap.timeline({ paused: true }).to(tone,
          { gray: 0, duration: 1, ease: 'none', lazy: false }),
        start: 0, distance: 1, track: null, horizontal: false, flowTop: 0, previous: -1,
        strip: null, stripStart: 0, stripDistance: 1,
      }; });
    };
    function measure() {
      scenes.forEach(s => {
        const box = s.photo.getBoundingClientRect();
        s.track = s.photo.closest<HTMLElement>('.sg-story-track');
        s.horizontal = !!s.track && innerWidth > 900 && !reduced;
        s.flowTop = s.track?.closest('.sg-story-flow')?.getBoundingClientRect().top! + scrollY || 0;
        if (s.horizontal) {
          s.start = s.flowTop + box.left + s.track!.scrollLeft - s.track!.getBoundingClientRect().left - s.track!.clientWidth;
          s.distance = s.track!.clientWidth * PHOTO_ENTRANCE.established;
        } else {
          s.start = box.top + scrollY - innerHeight;
          s.distance = innerHeight * PHOTO_ENTRANCE.established;
        }
        // A direct/restored first hero is already established in the viewport.
        // Its entrance starts one viewport before top, matching a full-color handoff.
        s.strip = s.photo.closest<HTMLElement>('.sg-dining-offer-track,.sf-strip ol,.sg-room-photograph-track');
        if (s.strip) {
          s.stripStart = box.left + s.strip.scrollLeft - s.strip.getBoundingClientRect().left - s.strip.clientWidth;
          s.stripDistance = s.strip.clientWidth * PHOTO_ENTRANCE.established;
        }
        s.previous = -1;
      });
    }
    function update() {
      scenes.forEach(s => {
        if(s.photo.dataset.signaturePhotoOwner === "menu") return;
        const vertical = entranceProgress((scrollY - s.start) / Math.max(1, s.distance));
        const horizontal = s.strip ? entranceProgress((s.strip.scrollLeft - s.stripStart) / Math.max(1, s.stripDistance)) : 1;
        const p = reduced ? 1 : Math.min(vertical, horizontal);
        if (p === s.previous) return;
        s.previous = p; s.timeline.progress(p);
        s.photo.style.setProperty('--sg-photo-gray', String(s.tone.gray));
        s.photo.dataset.photoProgress = String(p);
      });
    }
    function released(event:Event) {
      const photo=(event as CustomEvent<{photo:HTMLElement}>).detail.photo;
      const scene=scenes.find(s=>s.photo===photo);
      if(scene){scene.timeline.progress(1);scene.previous=1;scene.tone.gray=0;}
      photo.style.setProperty('--sg-photo-gray','0');photo.dataset.photoProgress='1';
    }
    window.addEventListener(PHOTO_RELEASE,released);
    collect(); measure(); update();
    const driver = registerScrollScene(measure, update);
    const resize = new ResizeObserver(driver.refresh);
    resize.observe(host);
    const observe = () => scenes.forEach(s => resize.observe(s.photo));
    observe();
    const mutation = new MutationObserver(() => { resize.disconnect(); collect(); observe(); resize.observe(host); driver.refresh(); });
    mutation.observe(host, { childList: true, subtree: true });
    const introFinished=()=>{resize.disconnect();collect();measure();update();observe();resize.observe(host);driver.refresh();};
    window.addEventListener('sodai:signature-intro-finished',introFinished);
    const load = () => driver.refresh();
    host.addEventListener('load', load, true);
    host.addEventListener('scroll', update, true);
    void document.fonts.ready.then(() => { if (mounted) driver.refresh(); });
    return () => {
      window.removeEventListener(PHOTO_RELEASE,released);
      window.removeEventListener('sodai:signature-intro-finished',introFinished);
      mounted = false; driver.dispose(); resize.disconnect(); mutation.disconnect();
      host.removeEventListener('load', load, true);
      host.removeEventListener('scroll', update, true);
      scenes.forEach(s => { s.timeline.kill(); s.photo.style.removeProperty('--sg-photo-gray'); delete s.photo.dataset.photoProgress; });
    };
  }, [root, route, reduced]);
}
