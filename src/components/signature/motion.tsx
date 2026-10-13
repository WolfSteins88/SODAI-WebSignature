"use client";
import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  useState,
  useEffect,
  useRef,
  type ReactNode,
  type FocusEventHandler,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { usePhotoProgress } from "./photo-progress";
import "./scroll-polish.css";
import "./menu-hero-transition.css";
import {useMenuHeroTransition, CANCEL_MENU_NAVIGATION} from "./menu-hero-transition";
import {LogoScreenTransition} from "./logo-screen-transition";

const Preference = createContext(false);
const subscribe = (callback: () => void) => {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
};
export function useReducedMotion() {
  const manual = useContext(Preference);
  const system = useSyncExternalStore(
    subscribe,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
  return system || manual;
}
const NAVIGATION = "sodai:signature-navigation";

export function MotionLink({
  href,
  children,
  className,
  navigate,
  ...props
}: {
  href: string;
  children: ReactNode;
  className?: string;
  navigate?: (href: string) => void;
  "aria-label"?: string;
  onClick?: () => void;
  onFocus?: FocusEventHandler<HTMLAnchorElement>;
  "aria-current"?: "page";
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  return (
    <Link
      {...props}
      ref={ref}
      href={href}
      className={className}
      onNavigate={(event) => {
        if (navigate) {
          event.preventDefault();
          navigate(href);
          return;
        }
        const target = new URL(href, location.origin).pathname;
        if (target !== location.pathname && !target.startsWith("/admin"))
          window.dispatchEvent(
            new CustomEvent(NAVIGATION, {
              detail: { href, source: ref.current },
            }),
          );
      }}
    >
      {children}
    </Link>
  );
}

export function SignatureMotionBoundary({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <Preference.Provider value={false}>
      <LogoScreenTransition><MotionFrame pathname={pathname}>{children}</MotionFrame></LogoScreenTransition>
    </Preference.Provider>
  );
}
function MotionFrame({
  children,
  pathname,
}: {
  children: ReactNode;
  pathname: string;
}) {
  const reduced = useReducedMotion(),
    root = useRef<HTMLDivElement>(null),
    overlay = useRef<HTMLDivElement>(null);
  usePhotoProgress(root, pathname, reduced);
  const [pending, setPending] = useState(false);
  const cancel = useRef<() => void>(() => {});
  const cancelOther = useCallback(()=>cancel.current(),[]);
  useMenuHeroTransition(root,reduced,cancelOther);
  useEffect(() => {
    const host = overlay.current;
    if (!host) return;
    const navigation = performance.getEntriesByType("navigation")[0] as
      PerformanceNavigationTiming | undefined;
    if (navigation?.type === "reload" || navigation?.type === "back_forward")
      document.documentElement.dataset.signatureHistory = "true";
    function start(event: Event) {
      window.dispatchEvent(new Event(CANCEL_MENU_NAVIGATION));
      const detail = (
        event as CustomEvent<{
          href: string;
          source?: HTMLAnchorElement;
          automatic?: boolean;
          restoreScroll?: number;
          transition?: "fade";
        }>
      ).detail;
      const site = root.current?.querySelector<HTMLElement>(".sg-site");
      if (!site) return;
      if (detail?.restoreScroll === undefined)
        window.history.replaceState({ ...window.history.state, __sodaiScrollY: window.scrollY }, "");
      cancel.current();
      // Automatic handoff only needs its retained scene; do not clone/decode the
      // complete Story and then discard it, or measure every offscreen element.
      const clone = site.cloneNode(!detail?.automatic) as HTMLElement;
      const scroll = window.scrollY;
      if (detail?.automatic) {
        const reference = site.classList.contains("sg-reference-site");
        const stage = site.querySelector<HTMLElement>(".sg-next-stage")!;
        const frame = stage.cloneNode(true) as HTMLElement;
        clone.replaceChildren(
          frame,
          ...Array.from(
            site.querySelectorAll(".sg-rail,.sg-reservation"),
            (node) => node.cloneNode(true),
          ),
        );
        Object.assign(clone.style, {
          transform: "none",
          marginLeft: reference ? "0" : innerWidth > 900 ? "50px" : "0",
          paddingTop: reference || innerWidth > 900 ? "0" : "64px",
        });
        Object.assign(frame.style, { position: "relative", top: "0" });
      } else {
        clone.style.transform = `translateY(${-scroll}px)`;
        const left = site.getBoundingClientRect().left;
        const originalNodes = site.querySelectorAll<HTMLElement>("*"),
          clonedNodes = clone.querySelectorAll<HTMLElement>("*");
        originalNodes.forEach((node, index) => {
          if (getComputedStyle(node).position !== "fixed") return;
          const box = node.getBoundingClientRect();
          Object.assign(clonedNodes[index].style, {
            position: "absolute", margin: "0", left: `${box.left - left}px`,
            top: `${box.top + scroll}px`, width: `${box.width}px`, height: `${box.height}px`,
          });
        });
      }
      clone.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
      clone.removeAttribute("id"); clone.inert = true; clone.setAttribute("aria-hidden", "true");
      host!.replaceChildren(clone);
      if (!detail?.automatic) {
        const originals = site.querySelectorAll<HTMLElement>(".sg-story-track,.sg-room-strip,.sg-story-panel>div"),
          copies = clone.querySelectorAll<HTMLElement>(".sg-story-track,.sg-room-strip,.sg-story-panel>div");
        copies.forEach((node, index) => { node.scrollLeft = originals[index].scrollLeft; node.scrollTop = originals[index].scrollTop; });
      }
      host!.hidden = false;
      host!.style.opacity = "1";
      host!.style.clipPath = "none";
      setPending(true);
      document.documentElement.dataset.signatureNavigating = "true";
      const sourcePhoto =
        detail?.source?.querySelector<HTMLElement>(".std-photo");
      let expanded: HTMLElement | null = null,
        tween: gsap.core.Tween | null = null;
      if (!reduced && sourcePhoto && !detail?.automatic && detail?.transition !== "fade" && !detail?.source?.closest(".sg-mark,.sg-menu-logo")) {
        const box = sourcePhoto.getBoundingClientRect();
        const reference = site.classList.contains("sg-reference-site");
        const left = !reference && window.innerWidth > 900 ? 50 : 0,
          top = reference || window.innerWidth > 900 ? 0 : 64;
        const width = window.innerWidth - left,
          height = window.innerHeight - top;
        expanded = sourcePhoto.cloneNode(true) as HTMLElement;
        expanded.classList.add("sg-transition-photo");
        Object.assign(expanded.style, {
          position: "fixed",
          left: `${left}px`,
          top: `${top}px`,
          width: `${width}px`,
          height: `${height}px`,
          transformOrigin: "0 0",
          zIndex: "2",
        });
        host!.append(expanded);
        tween = gsap.fromTo(
          expanded,
          {
            x: box.left - left,
            y: box.top - top,
            scaleX: box.width / width,
            scaleY: box.height / height,
          },
          {
            x: 0,
            y: 0,
            scaleX: 1,
            scaleY: 1,
            duration: 0.55,
            ease: "power2.inOut",
          },
        );
      }
      const target = detail?.href
        ? new URL(detail.href, location.origin).pathname
        : location.pathname;
      let timer: ReturnType<typeof setTimeout>,
        done = false,
        scheduled = false;
      const listeners: (() => void)[] = [];
      function finish() {
        if (done) return;
        if (tween?.isActive()) {
          tween.eventCallback("onComplete", () => {
            tween = null;
            finish();
          });
          return;
        }
        done = true;
        observer.disconnect();
        clearTimeout(timer);
        listeners.forEach((remove) => remove());
        tween?.kill();
        // The new page remains visible beneath the photograph; never fade to an empty color.
        if (detail?.automatic && location.pathname === target)
          window.scrollTo({ top: 0, behavior: "instant" });
        else if (typeof detail?.restoreScroll === "number" && location.pathname === target) {
          const position = Math.max(0, detail.restoreScroll);
          window.scrollTo({ top: position, behavior: "instant" });
          requestAnimationFrame(() => window.scrollTo({ top: position, behavior: "instant" }));
        }
        if (detail?.restoreScroll === undefined && location.pathname === target)
          window.history.replaceState({ ...window.history.state, __sodaiScrollY: window.scrollY }, "");
        const focusDestination = () => {
          const heading = root.current?.querySelector<HTMLElement>(
            ".sg-site .sg-hero h1,.sg-site main h1,.sg-site main",
          );
          if (heading) {
            heading.tabIndex = -1;
            heading.focus({ preventScroll: true });
          }
        };
        if (reduced || detail?.automatic) {
          host!.hidden = true;
          host!.replaceChildren();
          setPending(false);
          delete document.documentElement.dataset.signatureNavigating;
          focusDestination();
        } else {
          tween = gsap.to(host, {
            ...(detail?.transition === "fade" ? {opacity:0} : {clipPath:"inset(0 0 0 100%)"}),
            duration: detail?.transition === "fade" ? .18 : .65,
            onComplete: () => {
              host!.hidden = true;
              host!.replaceChildren();
              setPending(false);
              delete document.documentElement.dataset.signatureNavigating;
              focusDestination();
            },
          });
        }
      }
      function ready() {
        const destination =
          root.current?.querySelector<HTMLElement>(".sg-site");
        if (destination?.dataset.signatureRoute !== target) return;
        const image =
          destination.querySelector<HTMLImageElement>(".sg-hero img");
        if (image && !image.complete) {
          if (scheduled) return;
          scheduled = true;
          image.addEventListener("load", finish, { once: true });
          image.addEventListener("error", finish, { once: true });
          listeners.push(() => {
            image.removeEventListener("load", finish);
            image.removeEventListener("error", finish);
          });
        } else if (image && !scheduled) {
          scheduled = true;
          void image.decode().then(finish, finish);
        } else if (!image) finish();
      }
      const observer = new MutationObserver(ready);
      observer.observe(root.current!, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["data-signature-route"],
      });
      timer = setTimeout(finish, 3500); // Bounded visual enhancement; errors/navigation never wait indefinitely.
      cancel.current = () => {
        done = true;
        observer.disconnect();
        clearTimeout(timer);
        listeners.forEach((remove) => remove());
        tween?.kill();
        host!.hidden = true;
        host!.replaceChildren();
        setPending(false);
        delete document.documentElement.dataset.signatureNavigating;
      };
      ready();
    }
    const history = (event: PopStateEvent) => {
      // Terms hash history is an article scroll, not a page transition. Its
      // index restores the reading position; cloning here creates stale text.
      const site = root.current?.querySelector<HTMLElement>(".sg-site");
      if (location.pathname.endsWith("/terms") && site?.dataset.signatureRoute === location.pathname) return;
      document.documentElement.dataset.signatureHistory = "true";
      start(
        new CustomEvent(NAVIGATION, { detail: { href: location.pathname, restoreScroll: event.state?.__sodaiScrollY } }),
      );
    };
    const freshInput = () => {
      delete document.documentElement.dataset.signatureHistory;
    };
    window.addEventListener("wheel", freshInput, {
      capture: true,
      passive: true,
    });
    window.addEventListener("touchstart", freshInput, {
      capture: true,
      passive: true,
    });
    window.addEventListener("keydown", freshInput, true);
    window.addEventListener(NAVIGATION, start);
    window.addEventListener("popstate", history);
    const resize = () => cancel.current();
    window.addEventListener("resize", resize);
    return () => {
      cancel.current();
      window.removeEventListener(NAVIGATION, start);
      window.removeEventListener("popstate", history);
      window.removeEventListener("resize", resize);
      window.removeEventListener("wheel", freshInput, true);
      window.removeEventListener("touchstart", freshInput, true);
      window.removeEventListener("keydown", freshInput, true);
    };
  }, [reduced]);
  useEffect(() => {
    if (!pending) return;
    const timer = setTimeout(() => cancel.current(), 4000);
    return () => clearTimeout(timer);
  }, [pathname, pending]);
  return (
    <div ref={root} className="sg-motion-boundary" data-reduced={reduced}>
      {children}
      <div
        ref={overlay}
        className="sg-route-overlay"
        hidden
        aria-hidden="true"
        inert
      />
      <span className="sg-route-status" role="status" aria-live="polite">
        {pending ? "Opening the next page…" : ""}
      </span>
    </div>
  );
}
