"use client";
import { useEffect, useState } from "react";
import type { VillaContent } from "@/lib/schemas/content";
import {bookingLinks} from "@/lib/schemas/content";
import { Booking } from "./booking";
export function MobileReserve({
  content,
  room,
}: {
  content: VillaContent;
  room?: string;
}) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const nodes = document.querySelectorAll(".hero,.other-rooms,.next-page");
    const active = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) active.add(e.target);
          else active.delete(e.target);
        }
        setVisible(active.size > 0);
      },
      { threshold: 0.05 },
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);
  if(!bookingLinks(content,room).whatsapp)return null;
  return (
    <div
      className={`mobile-reserve ${visible ? "visible" : ""}`}
      aria-hidden={!visible}
      inert={!visible}
    >
      <Booking content={content} room={room} compact />
    </div>
  );
}
