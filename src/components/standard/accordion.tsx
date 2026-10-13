"use client";
// Adapted from Bencho Image Accordion, Copyright (c) 2026 Lorenzo Cabra (MIT).
// Full notice: THIRD_PARTY_NOTICES.md. Responsive sizing and accessible controls by Sodai.
import Link from "next/link";
import { useId, useRef, useState } from "react";
import type { VillaImage } from "@/lib/schemas/content";
import { Photo } from "./photo";
export type PreviewItem = { title: string; image: VillaImage; href: string };
export function ImageAccordion({
  items,
  label,
}: {
  items: PreviewItem[];
  label: string;
}) {
  const [active, setActive] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  if (!items.length) return null;
  return (
    <div className="std-accordion" role="group" aria-label={label}>
      {items.map((item, index) => {
        // Bencho's flex-grow/gaussian falloff keeps total width stable as panels negotiate space.
        const grow =
          1 + 2.8 * Math.exp(-((Math.abs(index - active) / 0.665) ** 2));
        return (
          <article
            key={item.href + index}
            className="std-accordion-cell"
            data-active={index === active}
            style={{ flexGrow: grow }}
          >
            <Photo image={item.image} sizes="(max-width: 700px) 100vw, 60vw" />
            <button
              ref={(el) => {
                buttons.current[index] = el;
              }}
              id={`${id}-button-${index}`}
              aria-pressed={index === active}
              aria-controls={`${id}-caption-${index}`}
              aria-label={`Preview ${item.title}`}
              onClick={() => setActive(index)}
              onFocus={() => setActive(index)}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") setActive(index);
              }}
              onKeyDown={(event) => {
                let next = index;
                if (event.key === "ArrowRight" || event.key === "ArrowDown")
                  next = (index + 1) % items.length;
                else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
                  next = (index - 1 + items.length) % items.length;
                else if (event.key === "Home") next = 0;
                else if (event.key === "End") next = items.length - 1;
                else return;
                event.preventDefault();
                setActive(next);
                buttons.current[next]?.focus();
              }}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span className="std-visually-hidden">{item.title}</span>
            </button>
            <div
              className="std-accordion-caption"
              id={`${id}-caption-${index}`}
            >
              <h3>{item.title}</h3>
              <Link href={item.href}>
                Discover <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
