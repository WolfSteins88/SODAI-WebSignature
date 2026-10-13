"use client";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { getImageProps } from "next/image";
import { gsap } from "gsap";
import type { VillaContent, VillaImage } from "@/lib/schemas/content";
import { Photo } from "../standard/photo";
import { containDialogFocus } from "../standard/dialog-focus";
type Item = NonNullable<VillaContent["signatureGallery"]>["items"][number];
type Category = NonNullable<
  VillaContent["signatureGallery"]
>["categories"][number];
const counts = [2, 3, 4, 5] as const;
/** Container units reserve every natural ratio on the server, without scroll/resize measurements. */
function masonry(items: Item[]) {
  const styles = items.map(() => ({}) as Record<string, string | number>),
    heights = {} as Record<string, string>;
  for (const n of counts) {
    const sums = Array(n).fill(0),
      rows = Array(n).fill(0);
    items.forEach((item, i) => {
      const col = i % n;
      styles[i][`--x${n}`] = col;
      styles[i][`--y${n}`] =
        `calc(${sums[col]} * var(--cell) + ${rows[col]} * var(--gap))`;
      sums[col] += item.height / item.width;
      rows[col]++;
    });
    heights[`--height${n}`] =
      `max(${sums.map((sum, col) => `calc(${sum} * var(--cell) + ${Math.max(0, rows[col] - 1)} * var(--gap))`).join(",")})`;
  }
  return { styles, heights };
}
function imageProps(item: Item) {
  return getImageProps({
    src: item.image.src,
    alt: item.image.alt,
    width: item.width,
    height: item.height,
    sizes: "(max-width:900px) 90vw, 70vw",
    unoptimized: item.image.src.startsWith("/api/media/"),
  }).props;
}
export function SignatureGallery({
  items,
  categories,
  actions,
  emblem,
}: {
  items: Item[];
  categories: Category[];
  actions: { label: string; href: string }[];
  emblem?: VillaImage;
}) {
  const [filter, setFilter] = useState("all"),
    [requested, setRequested] = useState<string | null>(null),
    [display, setDisplay] = useState<{
      item: Item;
      failed: boolean;
      old?: Item;
      direction: number;
    } | null>(null),
    [busy, setBusy] = useState(false);
  const shown = useMemo(
    () =>
      items.filter((i) => filter === "all" || i.categories.includes(filter)),
    [items, filter],
  );
  const viewerItems = useMemo(
    () =>
      shown
        .slice()
        .sort(
          (a, b) =>
            (a.viewerOrder ?? items.indexOf(a)) -
            (b.viewerOrder ?? items.indexOf(b)),
        ),
    [shown, items],
  );
  const layout = useMemo(() => masonry(shown), [shown]);
  const dialog = useRef<HTMLDialogElement>(null),
    opener = useRef<HTMLButtonElement | null>(null),
    firstFilter = useRef<HTMLButtonElement>(null),
    filterSentinel = useRef<HTMLSpanElement>(null),
    filterBar = useRef<HTMLDivElement>(null),
    closeControl = useRef<HTMLButtonElement>(null),
    frame = useRef<HTMLElement>(null),
    outgoing = useRef<HTMLElement>(null),
    animation = useRef<gsap.core.Timeline | null>(null),
    slideAnimation = useRef<gsap.core.Timeline | null>(null),
    requestToken = useRef(0),
    desired = useRef<string | null>(null),
    previousOverflow = useRef(""),
    savedScroll = useRef(0),
    locked = useRef(false),
    closing = useRef(false),
    menuRequested = useRef(false),
    swipe = useRef<{ x: number; y: number } | null>(null),
    prepared = useRef(new Map<string, Promise<void>>());
  const reduced = () => matchMedia("(prefers-reduced-motion:reduce)").matches;
  useEffect(() => {
    const mobile = matchMedia("(max-width:900px)");
    let observer: IntersectionObserver;
    const connect = () => {
      observer?.disconnect();
      observer = new IntersectionObserver(
        ([entry]) => {
          filterBar.current?.classList.toggle(
            "sgl-pinned",
            !entry.isIntersecting,
          );
        },
        { rootMargin: mobile.matches ? "-79px 0px 0px" : "0px" },
      );
      if (filterSentinel.current) observer.observe(filterSentinel.current);
    };
    connect();
    mobile.addEventListener("change", connect);
    return () => {
      observer.disconnect();
      mobile.removeEventListener("change", connect);
    };
  }, []);
  function unlock() {
    if (!locked.current) return;
    document.body.style.overflow = previousOverflow.current;
    locked.current = false;
    window.scrollTo({ top: savedScroll.current, behavior: "instant" });
  }
  function finishClose() {
    requestToken.current++;
    desired.current = null;
    animation.current?.kill();
    slideAnimation.current?.kill();
    dialog.current?.close();
    unlock();
    closing.current = false;
    setRequested(null);
    setDisplay(null);
    setBusy(false);
    const target = opener.current?.isConnected
      ? opener.current
      : firstFilter.current;
    target?.focus({ preventScroll: true });
    if (menuRequested.current) {
      menuRequested.current = false;
      document.querySelector<HTMLButtonElement>(".sg-menu-button")?.click();
    }
  }
  function close(immediate = false) {
    if (!dialog.current?.open || closing.current) return;
    closing.current = true;
    if (immediate || reduced()) {
      finishClose();
      return;
    }
    animation.current?.kill();
    animation.current = gsap
      .timeline({ onComplete: finishClose })
      .to(dialog.current, {
        yPercent: 100,
        duration: 0.95,
        ease: "power3.inOut",
      });
  }
  function prepare(item: Item) {
    let pending = prepared.current.get(item.id);
    if (pending) return pending;
    const props = imageProps(item),
      img = new window.Image();
    img.decoding = "async";
    if (props.sizes) img.sizes = props.sizes;
    if (props.srcSet) img.srcset = props.srcSet;
    img.src = props.src;
    pending = img.decode();
    prepared.current.set(item.id, pending);
    if (prepared.current.size > 6) {
      const oldest = prepared.current.keys().next().value;
      if (oldest && oldest !== item.id) prepared.current.delete(oldest);
    }
    pending.catch(() => prepared.current.delete(item.id));
    return pending;
  }
  function select(item: Item, direction = 0) {
    const token = ++requestToken.current;
    desired.current = item.id;
    setRequested(item.id);
    setBusy(true);
    prepare(item).then(
      () => {
        if (token !== requestToken.current || closing.current) return;
        setDisplay((previous) => ({
          item,
          failed: false,
          old:
            direction &&
            previous &&
            !previous.failed &&
            previous.item.id !== item.id
              ? previous.item
              : undefined,
          direction,
        }));
        setBusy(false);
      },
      () => {
        if (token !== requestToken.current || closing.current) return;
        setDisplay({ item, failed: true, direction: 0 });
        setBusy(false);
      },
    );
  }
  function open(item: Item, button: HTMLButtonElement) {
    animation.current?.kill();
    closing.current = false;
    opener.current = button;
    savedScroll.current = scrollY;
    previousOverflow.current = document.body.style.overflow;
    locked.current = true;
    document.body.style.overflow = "hidden";
    setDisplay({ item, failed: false, direction: 0 });
    dialog.current?.showModal();
    closeControl.current?.focus({ preventScroll: true });
    if (reduced()) gsap.set(dialog.current, { yPercent: 0 });
    else
      animation.current = gsap
        .timeline()
        .fromTo(
          dialog.current,
          { yPercent: 100 },
          { yPercent: 0, duration: 1.2, ease: "power3.inOut" },
        );
    select(item);
  }
  function move(delta: number) {
    const i = viewerItems.findIndex((item) => item.id === desired.current),
      next = viewerItems[i + delta];
    if (next) select(next, delta);
  }
  useLayoutEffect(() => {
    slideAnimation.current?.kill();
    if (!display?.old || !frame.current) return;
    const direction = display.direction || 1;
    if (reduced()) {
      setDisplay((v) => (v ? { ...v, old: undefined } : v));
      return;
    }
    slideAnimation.current = gsap
      .timeline({
        onComplete: () =>
          setDisplay((v) =>
            v?.item.id === display.item.id ? { ...v, old: undefined } : v,
          ),
      })
      .fromTo(
        frame.current,
        { x: direction * innerWidth },
        { x: 0, duration: 0.65, ease: "power3.inOut" },
        0,
      )
      .to(
        outgoing.current,
        { x: -direction * innerWidth, duration: 0.65, ease: "power3.inOut" },
        0,
      );
    return () => {
      slideAnimation.current?.kill();
    };
  }, [display?.item.id, display?.old?.id]);
  useEffect(() => {
    if (!display || display.failed || !dialog.current?.open) return;
    const index = viewerItems.findIndex((i) => i.id === display.item.id);
    [viewerItems[index - 1], viewerItems[index + 1]]
      .filter(Boolean)
      .forEach((item) => {
        void prepare(item).catch(() => {});
      });
  }, [display?.item.id, shown]);
  useEffect(() => {
    const interrupt = () => {
      menuRequested.current = false;
      if (dialog.current?.open) finishClose();
    };
    window.addEventListener("sodai:signature-navigation", interrupt);
    window.addEventListener("sodai:signature-dismiss-viewer", interrupt);
    window.addEventListener("popstate", interrupt);
    return () => {
      menuRequested.current = false;
      requestToken.current++;
      animation.current?.kill();
      slideAnimation.current?.kill();
      dialog.current?.close();
      unlock();
      window.removeEventListener("sodai:signature-navigation", interrupt);
      window.removeEventListener("sodai:signature-dismiss-viewer", interrupt);
      window.removeEventListener("popstate", interrupt);
    };
  }, []);
  useEffect(() => {
    if (desired.current && !shown.some((i) => i.id === desired.current))
      close(true);
  }, [shown]);
  const index = viewerItems.findIndex((i) => i.id === requested);
  const picture = (item: Item, old = false) => (
    <figure
      ref={old ? outgoing : frame}
      key={item.id}
      className={`sgv-frame ${item.height > item.width ? "sgv-portrait" : ""}`}
      aria-hidden={old || undefined}
    >
      {!old && display?.failed ? (
        <div className="sgv-fallback" role="img" aria-label={item.image.alt}>
          Photograph unavailable<p>{item.image.alt}</p>
        </div>
      ) : (
        <img
          {...imageProps(item)}
          className="sgv-image"
          loading="eager"
          draggable={false}
          onError={() => {
            if (!old)
              setDisplay((v) =>
                v ? { ...v, failed: true, old: undefined } : v,
              );
          }}
        />
      )}
      {item.caption && <figcaption tabIndex={0}>{item.caption}</figcaption>}
    </figure>
  );
  return (
    <>
      <span ref={filterSentinel} className="sgl-sentinel" aria-hidden="true" />
      <div ref={filterBar} className="sgl-filters-wrap">
        <div
          className="sgl-filters"
          role="group"
          aria-label="Gallery categories"
        >
          {[{ id: "all", label: "All", enabled: true }, ...categories].map(
            (c, i) => (
              <button
                ref={i === 0 ? firstFilter : undefined}
                key={c.id}
                aria-pressed={filter === c.id}
                onClick={() => {
                  close(true);
                  setFilter(c.id);
                }}
              >
                {c.label}
              </button>
            ),
          )}
        </div>
      </div>
      <p className="std-visually-hidden" role="status">
        {shown.length} photographs in{" "}
        {filter === "all"
          ? "All"
          : categories.find((c) => c.id === filter)?.label}
      </p>
      {shown.length ? (
        <div className="sgl-masonry">
          <div className="sgl-track" style={layout.heights as CSSProperties}>
            {shown.map((item, i) => (
              <button
                key={item.id}
                data-gallery-item={item.id}
                className="sgl-thumbnail"
                style={
                  {
                    ...layout.styles[i],
                    aspectRatio: `${item.width}/${item.height}`,
                  } as CSSProperties
                }
                aria-label={`View ${item.image.alt}`}
                onClick={(e) => open(item, e.currentTarget)}
              >
                <Photo
                  image={item.image}
                  sizes="(max-width:600px) 45vw,(max-width:900px) 30vw,20vw"
                />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="sgl-empty">
          {items.length
            ? "No photographs in this collection."
            : "No photographs have been published yet."}
        </p>
      )}
      <dialog
        ref={dialog}
        className="sgl-viewer"
        aria-label="Gallery photograph viewer"
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onClose={() => {
          if (locked.current) finishClose();
        }}
        onKeyDown={(e) => {
          containDialogFocus(e);
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.preventDefault();
            move(e.key === "ArrowLeft" ? -1 : 1);
          }
        }}
      >
        <div className="sgv-rail">
          {emblem && (
            <div className="sgv-emblem">
              <Photo image={emblem} sizes="32px" />
            </div>
          )}
          <button
            onClick={() => {
              menuRequested.current = true;
              close();
            }}
            aria-label="Open navigation menu from photograph"
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
        <div className="sgv-booking">
          {actions.map((a) => (
            <a
              key={a.label}
              href={a.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {a.label}
            </a>
          ))}
        </div>
        <button
          ref={closeControl}
          className="sgv-close"
          onClick={() => close()}
        >
          Close
        </button>
        <div
          className="sgv-stage"
          aria-busy={busy}
          onPointerDown={(e) => {
            if (e.pointerType !== "mouse")
              swipe.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerUp={(e) => {
            const start = swipe.current;
            swipe.current = null;
            if (start) {
              const dx = e.clientX - start.x,
                dy = e.clientY - start.y;
              if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.3)
                move(dx < 0 ? 1 : -1);
            }
          }}
          onPointerCancel={() => {
            swipe.current = null;
          }}
        >
          {display?.old && picture(display.old, true)}
          {display && picture(display.item)}
        </div>
        <button
          className="sgv-prev"
          disabled={index <= 0}
          aria-label="Previous photograph"
          onClick={() => move(-1)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M21 12H3m7-7-7 7 7 7" />
          </svg>
        </button>
        <button
          className="sgv-next"
          disabled={index < 0 || index >= shown.length - 1}
          aria-label="Next photograph"
          onClick={() => move(1)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 12h18m-7-7 7 7-7 7" />
          </svg>
        </button>
        <p className="std-visually-hidden" role="status" aria-live="polite">
          {busy
            ? "Loading photograph"
            : display?.failed
              ? "Photograph unavailable"
              : display
                ? `${index + 1} of ${shown.length}. ${display.item.image.alt}${display.item.caption ? ". " + display.item.caption : ""}`
                : ""}
        </p>
      </dialog>
    </>
  );
}
