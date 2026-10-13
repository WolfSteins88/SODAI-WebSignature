"use client";
import { useEffect, useRef, useState } from "react";
import type { VillaContent } from "@/lib/schemas/content";
import {publicCopy} from "@/lib/content/public-copy";
import { bookingLinks } from "@/lib/schemas/content";
import { Booking } from "../public/booking";
export function SignatureReservation({
  content,
  room,
  menuOpen,
}: {
  content: VillaContent;
  room?: string;
  menuOpen: boolean;
}) {
  const [visible, setVisible] = useState(true),
    [focused, setFocused] = useState(false),
    [desktop, setDesktop] = useState(true),
    ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const query = window.matchMedia("(min-width:901px)");
    const update = () => setDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const site = ref.current?.closest(".sg-site");
    if (!site) return;
    const active = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.05) active.add(entry.target);
          else active.delete(entry.target);
        }
        setVisible(active.size > 0);
      },
      { threshold: 0.05, rootMargin: desktop ? "0px" : `-${site.querySelector(".sg-rail")?.getBoundingClientRect().height || 79}px 0px 0px` },
    );
    site
        .querySelectorAll(".sg-hero,.sg-ref-opener,.sg-other,.sg-next")
      .forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [desktop]);
  const links = bookingLinks(content, room);
  if (!links.whatsapp) return null;
  const shown = !menuOpen && (desktop || visible || focused);
  return (
    <div
      ref={ref}
      className="sg-reservation"
      data-visible={shown}
      aria-hidden={!shown}
      inert={!shown}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      {content.signatureStory ? <div className="booking-links compact">
        {links.whatsapp && <a className="button secondary" href={links.whatsapp} target="_blank" rel="noopener noreferrer">{publicCopy(content,"whatsappLabel")}</a>}
      </div> : <Booking content={content} room={room} compact />}
    </div>
  );
}
