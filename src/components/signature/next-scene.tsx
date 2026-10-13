"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { PHOTO_ENTRANCE } from "./photo-progress";
import type { VillaImage } from "@/lib/schemas/content";
import { Photo } from "../standard/photo";
import { MotionLink, useReducedMotion } from "./motion";
import { registerScrollScene } from "./scroll-frame";

/** Native scroll distance owns the expansion; routing happens only after that distance. */
export function NextScene({
  title,
  href,
  image,
  monochrome = false,
  horizontal = false,
  preview = false,
  culture = false,
}: {
  title: string;
  href: string;
  image: VillaImage;
  monochrome?: boolean;
  horizontal?: boolean;
  preview?: boolean;
  culture?: boolean;
}) {
  const ref = useRef<HTMLElement>(null),
    router = useRouter(),
    reduced = useReducedMotion();
  useEffect(() => {
    const section = ref.current!,
      stage = section.querySelector<HTMLElement>(".sg-next-stage")!,
      photograph = section.querySelector<HTMLElement>(".sg-next-photo")!,
      img = photograph.querySelector<HTMLImageElement>("img"),
      titleNode = section.querySelector<HTMLElement>("h2")!,
      label = section.querySelector<HTMLElement>(".sg-label")!;
    let media = photograph.querySelector<HTMLElement>("img,.std-photo-fallback");
    let committed = false,
      warmed = false,
      quietTimer: ReturnType<typeof setTimeout>,
      hardTimer: ReturnType<typeof setTimeout>;
    const desktop = () => innerWidth > 900 && !reduced;
    const reference = !!section.closest(".sg-reference-site");
    let height = 0, start = 0, distance = 1, width = 0, initialScale = .46, initialWidth = 0, previous = -1;
    let choreography: gsap.core.Timeline | undefined;
    function warm() {
      if (warmed || preview) return;
      warmed = true;
      router.prefetch(href);
      if (img) {
        img.loading = "eager";
        void img.decode().catch(() => {});
      }
    }
    function measure() {
      media = photograph.querySelector<HTMLElement>("img,.std-photo-fallback");
      const flow =
        horizontal && desktop()
          ? section.closest<HTMLElement>(".sg-story-flow")
          : null;
      height = stage.clientHeight;
      start = flow
          ? flow.getBoundingClientRect().top + scrollY +
            (section.getBoundingClientRect().left - flow.querySelector(".sg-story-track")!.getBoundingClientRect().left + flow.querySelector<HTMLElement>(".sg-story-track")!.scrollLeft)
          : section.getBoundingClientRect().top +
            scrollY -
            (innerWidth > 900 || reference ? 0 : 64);
      distance = height * 1.35;
      width = stage.clientWidth;
      initialScale = reference && desktop() ? 292 / 699 : 0.46;
      initialWidth = innerWidth > 900 ? Math.min(width * (reference ? 217 / 1223 : .19), 260) : width * .47;
      if (culture && desktop()) {
        initialScale = Math.min(.8, innerWidth * 344 / 1440 / height);
        initialWidth = innerWidth * 256 / 1440;
      }
      previous = -1;
      choreography?.revert();
      const insetX = (width - initialWidth) / 2;
      const insetY = height * (1 - initialScale) / 2;
      choreography = gsap.timeline({ paused: true, defaults: { lazy: false } });
      if (!reduced) {
        choreography.fromTo(photograph, { clipPath: `inset(${insetY}px ${insetX}px)` },
          { clipPath: "inset(0px 0px)", duration: 1, ease: "none" }, 0);
        if (media) choreography.fromTo(media, { scale: initialScale }, { scale: 1, duration: 1, ease: "none" }, 0);
        choreography.fromTo(photograph, { "--sg-photo-gray": 1 },
          { "--sg-photo-gray": 0, duration: PHOTO_ENTRANCE.established, ease: "none" }, 0);
      } else {
        gsap.set(photograph, { clipPath: "none", "--sg-photo-gray": 0 });
        if (media) gsap.set(media, { transform: "none" });
      }
      choreography.fromTo(titleNode, { y: reference || reduced ? 0 : -height * 0.08 },
        { y: 0, duration: 1, ease: "none" }, 0);
      choreography.fromTo(label, { opacity: 1 }, { opacity: 0, duration: 1, ease: "none" }, 0);
    }
    function update() {
      if (committed) return;
      const raw = (scrollY - start) / distance;
      if (raw > -3) warm();
      const p = Math.max(0, Math.min(1, raw));
      if (p !== previous) {
        previous = p;
        choreography?.progress(p);
        section.dataset.progress = p.toFixed(3);
      }
      if (
        raw >= 1 &&
        !document.documentElement.dataset.signatureHistory &&
        !document.activeElement?.closest(".sg-footer") &&
        !preview &&
        !document.querySelector("dialog[open],[data-signature-menu-active]") &&
        !document.documentElement.dataset.signatureNavigating
      ) {
        committed = true;
        function release() {
          window.removeEventListener("wheel", consume, true);
          window.removeEventListener("touchmove", consume, true);
          clearTimeout(quietTimer);
          clearTimeout(hardTimer);
        }
        function consume(event: Event) {
          event.preventDefault();
          clearTimeout(quietTimer);
          quietTimer = setTimeout(() => {
            if (!document.documentElement.dataset.signatureNavigating)
              release();
          }, 300);
        }
        window.addEventListener("wheel", consume, {
          capture: true,
          passive: false,
        });
        window.addEventListener("touchmove", consume, {
          capture: true,
          passive: false,
        });
        hardTimer = setTimeout(release, 4500);
        section.dataset.committed = "true";
        window.dispatchEvent(
          new CustomEvent("sodai:signature-navigation", {
            detail: { href, automatic: true },
          }),
        );
        router.push(href, { scroll: false });
        // Guard survives segment unmount; input quiet period releases it, with a hard safety bound.
        quietTimer = setTimeout(() => {
          if (!document.documentElement.dataset.signatureNavigating) release();
        }, 700);
      }
    }
    const driver = registerScrollScene(measure, update),
      resizeObserver = new ResizeObserver(driver.refresh),
      contentObserver = new MutationObserver(driver.refresh),
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) warm();
        },
        { rootMargin: "100%" },
      );
    observer.observe(section);
    contentObserver.observe(section, { childList: true, subtree: true });
    resizeObserver.observe(section);
    resizeObserver.observe(stage);
    const site = section.closest(".sg-site");
    if (site) resizeObserver.observe(site);
    let mounted = true;
    void document.fonts.ready.then(() => { if (mounted) driver.refresh(); });
    const track = section.closest(".sg-story-track");
    if (track) Array.from(track.children).forEach((panel) => resizeObserver.observe(panel));
    return () => {
      mounted = false;
      driver.dispose();
      choreography?.revert();
      observer.disconnect();
      resizeObserver.disconnect();
      contentObserver.disconnect();
    };
  }, [href, horizontal, preview, reduced, router, culture]);
  return (
    <section
      ref={ref}
      className={`sg-next sg-next-scene ${horizontal ? "sg-next-horizontal" : ""}`}
      data-next-href={href}
    >
      <div className="sg-next-stage">
        <p className="sg-label">Next page</p>
        <MotionLink href={href} className="sg-next-link">
          <Photo
            image={image}
            sizes="(max-width:900px) 180vh, 100vw"
            className={`sg-next-photo ${monochrome ? "sg-next-monochrome" : ""}`}
          />
          <h2>{title}</h2>
          <span className="sg-keep-scroll">Keep scroll</span>
        </MotionLink>
      </div>
    </section>
  );
}
