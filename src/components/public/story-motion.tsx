"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
export function StoryMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add(
      "(min-width: 1000px) and (prefers-reduced-motion: no-preference)",
      () => {
        const el = root.current;
        const track = el?.querySelector<HTMLElement>(".story-track");
        if (!el || !track) return;
        gsap.to(track, {
          x: () => -(track.scrollWidth - el.clientWidth),
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: () => "+=" + (track.scrollWidth - el.clientWidth),
            scrub: 0.7,
            pin: true,
            invalidateOnRefresh: true,
          },
        });
      },
    );
    return () => mm.revert();
  }, []);
  return (
    <div ref={root} className="story-scroll">
      <div className="story-track">{children}</div>
    </div>
  );
}
