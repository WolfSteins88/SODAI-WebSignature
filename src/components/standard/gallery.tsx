"use client";
import { useEffect, useId, useRef, useState } from "react";
import type { VillaImage } from "@/lib/schemas/content";
import { Photo } from "./photo";
import { containDialogFocus } from "./dialog-focus";
export function Gallery({ images }: { images: VillaImage[] }) {
  const [filter, setFilter] = useState("All"),
    [active, setActive] = useState(0),
    [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null),
    opener = useRef<HTMLButtonElement | null>(null),
    closeButton = useRef<HTMLButtonElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const id = useId();
  const categories = ["All", ...new Set(images.map((image) => image.category))];
  const shown = images.filter(
    (image) => filter === "All" || image.category === filter,
  );
  const current = shown[active % Math.max(1, shown.length)];
  const move = (delta: number) => {
    if (shown.length > 1)
      setActive((value) => (value + delta + shown.length) % shown.length);
  };
  function close() {
    dialog.current?.close();
    setOpen(false);
    opener.current?.focus();
  }
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);
  if (!images.length) return <p>No photographs have been published yet.</p>;
  return (
    <>
      <div className="std-filters" role="group" aria-label="Gallery categories">
        {categories.map((category) => (
          <button
            key={category}
            aria-pressed={filter === category}
            onClick={() => {
              setFilter(category);
              setActive(0);
            }}
          >
            {category}
          </button>
        ))}
      </div>
      <p className="std-gallery-count" role="status">
        {shown.length} {shown.length === 1 ? "photograph" : "photographs"}
      </p>
      <div className="std-gallery-grid">
        {shown.map((image, index) => (
          <button
            key={image.src + index}
            aria-label={`View ${image.alt}`}
            onClick={(event) => {
              opener.current = event.currentTarget;
              setActive(index);
              dialog.current?.showModal();
              setOpen(true);
              closeButton.current?.focus();
            }}
          >
            <Photo
              image={image}
              sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
            />
            <span>
              {image.alt} <span aria-hidden="true">↗</span>
            </span>
          </button>
        ))}
      </div>
      <dialog
        ref={dialog}
        className="std-lightbox"
        aria-labelledby={`${id}-title`}
        onClose={() => setOpen(false)}
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        onKeyDown={(event) => {
          containDialogFocus(event);
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            move(event.key === "ArrowRight" ? 1 : -1);
          }
        }}
      >
        <h2 id={`${id}-title`} className="std-visually-hidden">
          Villa photographs
        </h2>
        <button
          ref={closeButton}
          className="std-lightbox-close"
          onClick={close}
          aria-label="Close photograph"
        >
          ✕
        </button>
        {current && (
          <>
            <div
              className="std-lightbox-frame"
              onPointerDown={(event) => {
                if (event.button !== 0) return;
                event.currentTarget.setPointerCapture(event.pointerId);
                swipe.current = { x: event.clientX, y: event.clientY };
              }}
              onPointerUp={(event) => {
                const start = swipe.current;
                swipe.current = null;
                if (!start) return;
                const dx = event.clientX - start.x,
                  dy = event.clientY - start.y;
                if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy))
                  move(dx < 0 ? 1 : -1);
              }}
              onPointerCancel={() => {
                swipe.current = null;
              }}
            >
              <Photo key={current.src} image={current} sizes="95vw" />
            </div>
            <div className="std-lightbox-controls">
              <button
                disabled={shown.length < 2}
                onClick={() => move(-1)}
                aria-label="Previous photograph"
              >
                ←
              </button>
              <p aria-live="polite" aria-atomic="true">
                {active + 1} / {shown.length} · {current.alt}
              </p>
              <button
                disabled={shown.length < 2}
                onClick={() => move(1)}
                aria-label="Next photograph"
              >
                →
              </button>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
