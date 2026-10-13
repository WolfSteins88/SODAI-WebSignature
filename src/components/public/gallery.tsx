"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import type { VillaImage } from "@/lib/schemas/content";
export function Gallery({ images }: { images: VillaImage[] }) {
  const [filter, setFilter] = useState("All");
  const [active, setActive] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const shown = images.filter((i) => filter === "All" || i.category === filter);
  function close() {
    dialog.current?.close();
    document.body.style.overflow = "";
    opener.current?.focus();
  }
  useEffect(
    () => () => {
      document.body.style.overflow = "";
    },
    [],
  );
  function move(n: number) {
    setActive((a) => (a + n + shown.length) % shown.length);
  }
  return (
    <>
      <div className="gallery-filters" aria-label="Gallery categories">
        {["All", "Spaces", "Living", "Nature"].map((c) => (
          <button
            key={c}
            aria-pressed={filter === c}
            onClick={() => setFilter(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="gallery-grid">
        {shown.map((im, i) => (
          <button
            key={im.src}
            aria-label={`View ${im.alt}`}
            onClick={(e) => {
              opener.current = e.currentTarget;
              setActive(i);
              dialog.current?.showModal();
              document.body.style.overflow = "hidden";
            }}
          >
            <Image
              src={im.src}
              alt={im.alt}
              fill
              unoptimized={im.src.startsWith("/api/media/")}
              sizes="(max-width: 650px) 100vw, 50vw"
            />
            <span>View photograph ↗</span>
          </button>
        ))}
      </div>
      <dialog
        className="lightbox"
        ref={dialog}
        onCancel={close}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") move(1);
          if (e.key === "ArrowLeft") move(-1);
        }}
      >
        <button
          className="icon-button lightbox-close"
          onClick={close}
          aria-label="Close photograph"
        >
          ✕
        </button>
        {shown[active] ? (
          <>
            <div className="lightbox-image">
              <Image
                src={shown[active].src}
                alt={shown[active].alt}
                fill
                unoptimized={shown[active].src.startsWith("/api/media/")}
                sizes="95vw"
              />
            </div>
            <div className="lightbox-controls">
              <button
                className="icon-button"
                onClick={() => move(-1)}
                aria-label="Previous photograph"
              >
                ←
              </button>
              <p aria-live="polite">
                {active + 1} / {shown.length} · {shown[active].alt}
              </p>
              <button
                className="icon-button"
                onClick={() => move(1)}
                aria-label="Next photograph"
              >
                →
              </button>
            </div>
          </>
        ) : null}
      </dialog>
    </>
  );
}
