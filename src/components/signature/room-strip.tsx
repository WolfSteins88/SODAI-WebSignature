"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import type { VillaContent } from "@/lib/schemas/content";
import { Photo } from "../standard/photo";
import { MotionLink, useReducedMotion } from "./motion";
export function RoomStrip({
  items,
  kind,
  prefix,
}: {
  items: VillaContent["experiences"];
  kind: string;
  prefix: string;
}) {
  const track = useRef<HTMLDivElement>(null),
    [active, setActive] = useState(0),
    reduced = useReducedMotion();
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null),
    suppress = useRef(false);
  function center(index: number) {
    const el = track.current,
      card = el?.querySelectorAll<HTMLElement>("a")[index];
    if (!el || !card) return;
    const target =
      el.scrollLeft +
      card.getBoundingClientRect().left -
      el.getBoundingClientRect().left -
      (el.clientWidth - card.clientWidth) / 2;
    gsap.killTweensOf(el);
    if (reduced) el.scrollLeft = target;
    else
      gsap.to(el, {
        scrollLeft: target,
        duration: 0.45,
        ease: "power2.out",
        overwrite: true,
      });
  }
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const middle = el.getBoundingClientRect().left + el.clientWidth / 2;
        let best = 0,
          distance = Infinity;
        el.querySelectorAll("a").forEach((card, index) => {
          const box = card.getBoundingClientRect(),
            delta = Math.abs(box.left + box.width / 2 - middle);
          if (delta < distance) {
            distance = delta;
            best = index;
          }
        });
        setActive(best);
      });
    };
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      cancelAnimationFrame(frame);
      gsap.killTweensOf(el);
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [reduced, items.length]);
  if (!items.length) return null;
  const current = Math.min(active, items.length - 1);
  return (
    <section className="sg-other">
      <h2>{kind === "rooms" ? "Other villas" : "Keep exploring"}</h2>
      <div
        ref={track}
        className="sg-room-strip"
        role="region"
        aria-label={kind === "rooms" ? "Other villas" : "Related pages"}
        tabIndex={0}
        onDragStart={(event) => event.preventDefault()}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          const key = event.key;
          if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(key)) {
            event.preventDefault();
            center(
              key === "Home"
                ? 0
                : key === "End"
                  ? items.length - 1
                  : Math.max(
                      0,
                      Math.min(
                        items.length - 1,
                        current + (key === "ArrowRight" ? 1 : -1),
                      ),
                    ),
            );
          }
        }}
        onPointerDown={(event) => {
          if (event.pointerType !== "mouse" || event.button !== 0) return;
          suppress.current = false;
          drag.current = {
            x: event.clientX,
            left: event.currentTarget.scrollLeft,
            moved: false,
          };
        }}
        onPointerMove={(event) => {
          const start = drag.current;
          if (!start) return;
          const delta = event.clientX - start.x;
          if (Math.abs(delta) > 6) {
            start.moved = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            gsap.killTweensOf(event.currentTarget);
            event.currentTarget.scrollLeft = start.left - delta;
          }
        }}
        onPointerUp={() => {
          suppress.current = Boolean(drag.current?.moved);
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onClickCapture={(event) => {
          if (suppress.current) {
            event.preventDefault();
            event.stopPropagation();
            suppress.current = false;
          }
        }}
      >
        {items.map((item, index) => (
          <MotionLink
            key={item.slug}
            href={`${prefix}/${kind}/${item.slug}`}
            className={index === current ? "sg-strip-active" : ""}
          >
            <Photo image={item.image} sizes="(max-width: 900px) 65vw, 24vw" />
            <h3>{item.title}</h3>
            <span className="sg-label">Discover more ↗</span>
          </MotionLink>
        ))}
      </div>
      <div className="sg-strip-controls">
        <button
          aria-label="Previous villa"
          disabled={current === 0}
          onClick={() => center(current - 1)}
        >
          ←
        </button>
        <p aria-live="polite">
          {current + 1} / {items.length} · {items[current].title}
        </p>
        <button
          aria-label="Next villa"
          disabled={current === items.length - 1}
          onClick={() => center(current + 1)}
        >
          →
        </button>
      </div>
    </section>
  );
}
