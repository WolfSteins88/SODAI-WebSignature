"use client";
// Adapted from Bencho Carousel, Copyright (c) 2026 Lorenzo Cabra (MIT).
// Full notice: THIRD_PARTY_NOTICES.md. Ring geometry retained; no autoplay, drift or tilt.
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { VillaImage } from "@/lib/schemas/content";
import { Photo } from "./photo";
export function Carousel({ images }: { images: VillaImage[] }) {
  const [turn, setTurn] = useState(0);
  const [reduced, setReduced] = useState(true);
  const [stillView, setStillView] = useState(false);
  const drag = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  if (!images.length) return null;
  const active = ((turn % images.length) + images.length) % images.length;
  function move(delta: number) {
    if (images.length > 1) setTurn((value) => value + delta);
  }
  return (
    <section
      className="std-carousel"
      aria-label="Gallery showcase"
      aria-roledescription="carousel"
    >
      <div className="std-carousel-toolbar">
        <button
          aria-pressed={reduced || stillView}
          disabled={reduced}
          onClick={() => setStillView((value) => !value)}
        >
          Still view
        </button>
      </div>
      <div
        className="std-carousel-stage"
        data-reduced={reduced || stillView}
        tabIndex={0}
        role="group"
        aria-label="Gallery photographs. Use left and right arrows or swipe."
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            move(event.key === "ArrowRight" ? 1 : -1);
          }
          if (event.key === "Home") {
            event.preventDefault();
            setTurn(0);
          }
          if (event.key === "End") {
            event.preventDefault();
            setTurn(images.length - 1);
          }
        }}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          drag.current = { x: event.clientX, y: event.clientY };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerUp={(event) => {
          const start = drag.current;
          drag.current = null;
          if (!start) return;
          const dx = event.clientX - start.x,
            dy = event.clientY - start.y;
          if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy))
            move(dx < 0 ? 1 : -1);
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
      >
        {images.map((image, index) => {
          // Unbounded turn avoids a 360-degree seam; Bencho uses cos for depth and sin for orbit.
          const angle = (index - turn) * ((Math.PI * 2) / images.length);
          const front = (Math.cos(angle) + 1) / 2;
          const style = {
            "--orbit": Math.sin(angle),
            "--lift": `${-(1 - front) * 38}px`,
            "--scale": 0.5 + 0.5 * front,
            zIndex: Math.round(front * 100),
          } as CSSProperties;
          return (
            <figure
              key={image.src + index}
              className="std-carousel-card"
              data-current={active === index}
              aria-hidden={active !== index}
              style={style}
            >
              <Photo image={image} sizes="(max-width: 650px) 52vw, 320px" />
            </figure>
          );
        })}
      </div>
      <div className="std-carousel-controls">
        <button
          disabled={images.length < 2}
          onClick={() => move(-1)}
          aria-label="Previous showcase photograph"
        >
          ←
        </button>
        <p aria-live="polite" aria-atomic="true">
          {active + 1} / {images.length} · {images[active].alt}
        </p>
        <button
          disabled={images.length < 2}
          onClick={() => move(1)}
          aria-label="Next showcase photograph"
        >
          →
        </button>
      </div>
    </section>
  );
}
