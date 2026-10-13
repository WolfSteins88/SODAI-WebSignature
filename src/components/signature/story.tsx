"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { useReducedMotion } from "./motion";
import { registerScrollScene } from "./scroll-frame";
import { entranceProgress, PHOTO_ENTRANCE } from "./photo-progress";
export function SignatureStory({ children }: { children: ReactNode }) {
  const flow = useRef<HTMLDivElement>(null),
    track = useRef<HTMLDivElement>(null),
    reduced = useReducedMotion();
  useEffect(() => {
    const root = flow.current!,
      el = track.current!;
    let desktop = false, travel = 0, top = 0, viewport = 0, height = "auto", geometryChanged = false, writtenTrackPosition = 0;
    let photos: { image: HTMLImageElement; start: number; size: number }[] = [];
    let panels: { start: number; end: number; images: HTMLImageElement[] }[] = [];
    const prepared = new WeakSet<HTMLImageElement>();
    function measure() {
      desktop = innerWidth > 900 && !reduced;
      travel = Math.max(0, el.scrollWidth - el.clientWidth);
      top = root.getBoundingClientRect().top + scrollY;
      viewport = desktop ? el.clientWidth : innerHeight;
      const scene = el.querySelector<HTMLElement>(".sg-next-stage");
      const expansion = (scene?.clientHeight || innerHeight) * 1.35;
      height = desktop ? `${el.clientHeight * 3 + travel + expansion}px` : "auto";
      photos = Array.from(el.querySelectorAll<HTMLElement>(".sg-ref-red-photo")).flatMap((photo) => {
        const image = photo.querySelector<HTMLImageElement>("img");
        if (!image) return [];
        const bounds = photo.getBoundingClientRect();
        return [{ image, start: desktop ? bounds.left + el.scrollLeft : bounds.top + scrollY, size: desktop ? bounds.width : bounds.height }];
      });
      panels = Array.from(el.children).map((panel) => {
        const bounds = panel.getBoundingClientRect();
        const start = desktop ? bounds.left + el.scrollLeft : bounds.top + scrollY;
        return { start, end: start + (desktop ? bounds.width : bounds.height), images: Array.from(panel.querySelectorAll("img")) };
      });
      geometryChanged = true;
    }
    function update() {
      if (geometryChanged) {
        root.style.height = height;
        root.dataset.horizontalDistance = desktop ? String(travel) : "0";
        geometryChanged = false;
      }
      const position = desktop ? Math.min(travel, Math.max(0, scrollY - top)) : scrollY;
      if (desktop) { writtenTrackPosition = position; el.scrollLeft = position; }
      else if (el.scrollLeft) el.scrollLeft = 0;
      photos.forEach(({ image, start: origin, size }) => {
        const start = origin - position;
        if (start > viewport * 2 || start + size < -viewport) return;
        const progress = entranceProgress((viewport - start) / (viewport * PHOTO_ENTRANCE.established));
        image.style.transform = reduced ? "none" : `${desktop ? "translateX" : "translateY"}(${-30 + 60 * progress}%) scale(${desktop ? 1.1929 : 1.1558})`;
      });
      // Decode only the current/nearby panels; browser lazy loading owns the rest.
      panels.forEach((panel) => {
        if (panel.start > position + viewport * 2 || panel.end < position - viewport) return;
        panel.images.forEach((image) => {
          if (prepared.has(image)) return;
          prepared.add(image); image.loading = "eager";
          void image.decode().catch(() => {});
        });
      });
    }
    const driver = registerScrollScene(measure, update);
    // Native horizontal trackpad/touch input maps back to the same document distance.
    // Programmatic updates produce the same value and therefore never feed back.
    const trackScroll = () => {
      if (!desktop) return;
      if (Math.abs(el.scrollLeft - writtenTrackPosition) <= 1) return;
      const target = top + el.scrollLeft;
      if (Math.abs(scrollY - target) > 1) window.scrollTo({ top: target, behavior: "instant" });
    };
    el.addEventListener("scroll", trackScroll, { passive: true });
    const observer = new ResizeObserver(driver.refresh);
    const contentObserver = new MutationObserver(driver.refresh);
    contentObserver.observe(el, { childList: true, subtree: true });
    observer.observe(el);
    Array.from(el.children).forEach((child) => observer.observe(child));
    let mounted = true;
    void document.fonts.ready.then(() => { if (mounted) driver.refresh(); });
    return () => {
      mounted = false;
      driver.dispose();
      el.removeEventListener("scroll", trackScroll);
      observer.disconnect();
      contentObserver.disconnect();
      el.querySelectorAll<HTMLElement>(".sg-ref-red-photo img").forEach((image) => image.style.removeProperty("transform"));
    };
  }, [children, reduced]);
  return (
    <div ref={flow} className="sg-story-flow">
      <div
        ref={track}
        id="signature-story"
        className="sg-story-track"
        data-reduced={reduced}
        role="region"
        aria-label="Villa story panels"
        tabIndex={0}
        onClickCapture={(event) => {
          if (innerWidth <= 900 || reduced) return;
          const anchor = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#story-"],a[href="#signature-story"]');
          if (!anchor) return;
          const panel = anchor.hash === "#signature-story"
            ? track.current!.children[1] as HTMLElement | undefined
            : track.current!.querySelector<HTMLElement>(anchor.hash);
          if (!panel) return;
          event.preventDefault();
          const target = panel.getBoundingClientRect().left - track.current!.getBoundingClientRect().left + track.current!.scrollLeft;
          window.scrollTo({
            top: flow.current!.getBoundingClientRect().top + scrollY + target,
            behavior: "smooth",
          });
        }}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget || innerWidth <= 900 || reduced)
            return;
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key))
            return;
          e.preventDefault();
          const el = track.current!,
            top = flow.current!.getBoundingClientRect().top + scrollY,
            panels = Array.from(el.children) as HTMLElement[],
            offsets = panels.map((panel) => panel.getBoundingClientRect().left - el.getBoundingClientRect().left + el.scrollLeft),
            index = offsets.reduce((nearest, value, i) => Math.abs(value - el.scrollLeft) < Math.abs(offsets[nearest] - el.scrollLeft) ? i : nearest, 0);
          const next =
            e.key === "Home"
              ? 0
              : e.key === "End"
                ? panels.length - 1
                : Math.max(
                    0,
                    Math.min(
                      panels.length - 1,
                      index + (e.key === "ArrowRight" ? 1 : -1),
                    ),
                  );
          window.scrollTo({
            top: top + offsets[next],
            behavior: "smooth",
          });
        }}
      >
        {children}
      </div>
    </div>
  );
}
