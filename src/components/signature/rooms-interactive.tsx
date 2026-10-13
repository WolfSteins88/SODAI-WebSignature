"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { VillaContent, VillaImage } from "@/lib/schemas/content";
import { Photo } from "../standard/photo";
import { MotionLink, useReducedMotion } from "./motion";
import { registerScrollScene } from "./scroll-frame";

/** Native scroll-snap slider; state changes only for explicit selection, never per frame. */
export function RoomPhotographs({ images, title }: { images: { id: string; image: VillaImage }[]; title: string }) {
  const track = useRef<HTMLDivElement>(null), reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const index = Math.min(active, Math.max(0, images.length - 1));
  function select(next: number) {
    const target = (next + images.length) % images.length;
    setActive(target);
    activeRef.current = target;
    track.current?.scrollTo({ left: target * track.current.clientWidth, behavior: reduced ? "instant" : "smooth" });
  }
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const resize = new ResizeObserver(() => el.scrollTo({ left: activeRef.current * el.clientWidth, behavior: "instant" }));
    resize.observe(el);
    return () => resize.disconnect();
  }, [images]);
  if (!images.length) return null;
  return <section className="sg-room-photographs" aria-label={`${title} photographs`}>
    <div ref={track} className="sg-room-photograph-track" tabIndex={0} onScrollEnd={event => {
      const el = event.currentTarget, next = Math.round(el.scrollLeft / el.clientWidth);
      if (activeRef.current !== next) { activeRef.current = next; setActive(next); }
    }} onKeyDown={event => {
      if (event.target !== event.currentTarget || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault(); select(index + (event.key === "ArrowRight" ? 1 : -1));
    }}>
      {images.map(item => <div key={item.id} className="sg-room-gallery-photo" data-photograph-id={item.id}><Photo mainPhoto image={item.image} sizes="100vw" /></div>)}
    </div>
    {images.length > 1 && <div className="sg-room-photo-controls"><button aria-label="Previous room photograph" onClick={() => select(index - 1)}>←</button><button aria-label="Next room photograph" onClick={() => select(index + 1)}>→</button></div>}
    <span className="sr-only" aria-live="polite">Photograph {index + 1} of {images.length}</span>
  </section>;
}

/** Reference vertical scroll selects a related photograph inside a sticky taupe scene. */
export function OtherBungalows({ items, prefix,heading="Other Bungalows" }: { heading?:string;items: VillaContent["rooms"]; prefix: string }) {
  const section = useRef<HTMLElement>(null), track = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0), geometry = useRef({ start: 0, height: 1 });
  const [active, setActive] = useState(0), reduced = useReducedMotion();
  useEffect(() => {
    const root = section.current, el = track.current;
    if (!root || !el || reduced || !items.length) return;
    let width = 0, step = 0, oldShift = Infinity, mounted = true;
    function measure() {
      geometry.current = { start: root!.getBoundingClientRect().top + scrollY, height: root!.querySelector<HTMLElement>(".sg-related-stage")!.clientHeight };
      const cards = el!.querySelectorAll<HTMLElement>("a");
      width = cards[0].offsetWidth;
      step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : 0;
      oldShift = Infinity;
    }
    function update() {
      const p = Math.max(0, Math.min(items.length - 1, (scrollY - geometry.current.start) / geometry.current.height));
      const shift = width / 2 + step * p;
      if (shift !== oldShift) { oldShift = shift; el!.style.transform = `translate3d(${-shift}px,-50%,0)`; }
      const next = Math.round(p);
      if (activeRef.current !== next) { activeRef.current = next; setActive(next); }
    }
    const driver = registerScrollScene(measure, update), resize = new ResizeObserver(driver.refresh);
    resize.observe(root); resize.observe(el);
    const site = root.closest(".sg-site"); if (site) resize.observe(site);
    void document.fonts.ready.then(() => { if (mounted) driver.refresh(); });
    return () => { mounted = false; driver.dispose(); resize.disconnect(); el.style.transform = ""; };
  }, [items, reduced]);
  if (!items.length) return null;
  const index = Math.min(active, items.length - 1);
  return <section ref={section} className={`sg-related-bungalows ${reduced ? "sg-related-reduced" : ""}`} style={{ "--sg-related-count": items.length } as CSSProperties}>
    <div className="sg-related-stage" role="region" aria-label="Other Bungalows" tabIndex={0} onKeyDown={event => {
      if (event.target !== event.currentTarget || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key) || reduced) return;
      event.preventDefault();
      const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : Math.max(0, Math.min(items.length - 1, index + (event.key === "ArrowRight" ? 1 : -1)));
      window.scrollTo({ top: geometry.current.start + next * geometry.current.height, behavior: "smooth" });
    }}>
      <h2>{heading}</h2>
      <div ref={track} className="sg-related-track">{items.map((item, itemIndex) => <MotionLink key={item.slug} href={`${prefix}/rooms/${item.slug}`} aria-label={`Discover ${item.title}`} onFocus={event => {
        if (!reduced && event.currentTarget.matches(":focus-visible")) window.scrollTo({ top: geometry.current.start + itemIndex * geometry.current.height, behavior: "smooth" });
      }}><Photo image={item.image} sizes="(max-width: 900px) 55vw, 18vw" /><span className="sr-only">{item.title}</span></MotionLink>)}</div>
      <h3 className="sg-related-title" aria-live="polite">{items[index].title}</h3>
    </div>
  </section>;
}
