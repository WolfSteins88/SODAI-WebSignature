"use client";
import { useEffect, useRef, useState, useId, type CSSProperties } from "react";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { PREVIEW_LIMIT } from "@/lib/content/live-preview";
/** useLayouts Discrete Tabs, adapted from the owner-supplied source. */
export function Tabs({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]),
    id = useId(),
    reduced = useReducedMotion();
  return (
    <LayoutGroup id={id}>
      <div className="cms-tabs" role="tablist" aria-label={label}>
        {options.map((option, i) => (
          <motion.button
            layout={!reduced}
            transition={{
              layout: {
                type: "spring",
                damping: 20,
                stiffness: 230,
                mass: 1.2,
              },
            }}
            ref={(el) => {
              refs.current[i] = el;
            }}
            key={option}
            type="button"
            role="tab"
            aria-selected={value === option}
            tabIndex={value === option ? 0 : -1}
            onClick={() => onChange(option)}
            onKeyDown={(e) => {
              let next = i;
              if (e.key === "ArrowRight") next = (i + 1) % options.length;
              else if (e.key === "ArrowLeft")
                next = (i + options.length - 1) % options.length;
              else if (e.key === "Home") next = 0;
              else if (e.key === "End") next = options.length - 1;
              else return;
              e.preventDefault();
              onChange(options[next]);
              refs.current[next]?.focus();
            }}
          >
            {value === option && (
              <motion.span
                aria-hidden="true"
                className="cms-tab-highlight"
                layoutId="active-tab"
                transition={
                  reduced
                    ? { duration: 0 }
                    : { type: "spring", damping: 20, stiffness: 230, mass: 1.2 }
                }
              />
            )}
            <span className="cms-tab-content">
              <svg
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                {option === "Mobile" ? (
                  <>
                    <rect x="7" y="2" width="10" height="20" rx="2" />
                    <path d="M10 18h4" />
                  </>
                ) : option === "Desktop" ? (
                  <>
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <path d="M8 22h8m-4-5v5" />
                  </>
                ) : option === "Editor" ? (
                  <>
                    <path d="M4 20l1-5L17 3l4 4L9 19zM14 6l4 4" />
                  </>
                ) : (
                  <>
                    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </>
                )}
              </svg>
              {option}
            </span>
          </motion.button>
        ))}
      </div>
    </LayoutGroup>
  );
}
export function PreviewPane({
  content,
  scope,
  version,
  route,
  onRoute,
  routes,
  focus,
}: {
  content: unknown;
  scope: string;
  version: string;
  route: string;
  onRoute: (r: string) => void;
  routes: string[];
  focus?: string;
}) {
  const frame = useRef<HTMLIFrameElement>(null),
    stage = useRef<HTMLDivElement>(null),
    popup = useRef<Window | null>(null),
    current = useRef<any>(null),
    sequence = useRef(0),
    ready = useRef(false);
  const [channel, setChannel] = useState(""),
    [view, setView] = useState("Desktop"),
    [width, setWidth] = useState(450),
    [status, setStatus] = useState("Connecting…"),
    [failed, setFailed] = useState(false),
    [retry, setRetry] = useState(0),
    [elapsed, setElapsed] = useState(0);
  const routing = useRef({ routes, onRoute });
  routing.current = { routes, onRoute };
  useEffect(() => setChannel(crypto.randomUUID()), []);
  const send = () => {
    if (!current.current || !channel) return;
    const message = {
      type: "villa-preview:update",
      channel,
      scope,
      version,
      sequence: ++sequence.current,
      ...current.current,
    };
    if (
      new TextEncoder().encode(JSON.stringify(message)).length > PREVIEW_LIMIT
    ) {
      setFailed(true);
      setStatus(
        "Preview exceeds size limit. Reduce content or open the saved preview.",
      );
      return;
    }
    if (ready.current)
      frame.current?.contentWindow?.postMessage(message, location.origin);
    if (popup.current && !popup.current.closed)
      popup.current.postMessage(message, location.origin);
  };
  useEffect(() => {
    const observer = new ResizeObserver((entries) =>
      setWidth(entries[0].contentRect.width),
    );
    if (stage.current) observer.observe(stage.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (
        event.origin !== location.origin ||
        !(
          event.source === frame.current?.contentWindow ||
          event.source === popup.current
        ) ||
        !event.data ||
        event.data.channel !== channel ||
        event.data.scope !== scope
      )
        return;
      const message = event.data;
      if (message.type === "villa-preview:ready") {
        if (event.source === frame.current?.contentWindow) ready.current = true;
        send();
      } else if (message.type === "villa-preview:rendered") {
        setFailed(false);
        setElapsed(Number(message.elapsed) || 0);
        setStatus(
          message.warnings
            ? "Preview uses saved values for incomplete fields"
            : "Live · unsaved content",
        );
      } else if (message.type === "villa-preview:busy") {
        setStatus("Updating preview…");
      } else if (message.type === "villa-preview:error") {
        setFailed(true);
        setStatus("Preview paused. Check fields or session, then Retry.");
      } else if (
        message.type === "villa-preview:navigate" &&
        typeof message.route === "string" &&
        routing.current.routes.includes(message.route)
      )
        routing.current.onRoute(message.route);
    };
    window.addEventListener("message", receive);
    return () => {
      window.removeEventListener("message", receive);
      popup.current?.postMessage(
        { type: "villa-preview:closed", channel, scope },
        location.origin,
      );
    };
  }, [channel, scope, version]);
  useEffect(() => {
    current.current = { content, route, focus };
    setStatus("Updating preview…");
    const timer = setTimeout(send, 300);
    return () => clearTimeout(timer);
  }, [content, route, focus, channel, scope, version, retry]);
  useEffect(() => {
    if (!channel) return;
    const timer = setTimeout(() => {
      if (!ready.current) {
        setFailed(true);
        setStatus("Preview connection unavailable. Sign in again or Retry.");
      }
    }, 15000);
    return () => clearTimeout(timer);
  }, [channel]);
  const viewport = view === "Mobile" ? 390 : 1280,
    scale = Math.min(1, Math.max(1, width - 24) / viewport);
  return (
    <section className="cms-preview-pane" aria-label="Live website preview">
      <header>
        <div>
          <strong>Live preview</strong>
          <span
            className={
              failed ? "cms-preview-status error" : "cms-preview-status"
            }
            role="status"
            data-render-ms={elapsed.toFixed(1)}
          >
            {status}
          </span>
        </div>
        <Tabs
          label="Preview viewport"
          value={view}
          options={["Desktop", "Mobile"]}
          onChange={setView}
        />
        <label className="cms-preview-route">
          Page
          <select
            aria-label="Preview page"
            value={route}
            onChange={(e) => onRoute(e.target.value)}
          >
            {routes.map((r) => (
              <option key={r} value={r}>
                {r === "/" ? "Homepage" : r}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => {
            setFailed(false);
            if (!ready.current) setChannel(crypto.randomUUID());
            else send();
            setRetry((n) => n + 1);
          }}
        >
          Retry
        </button>
        <button
          type="button"
          onClick={() => {
            popup.current = window.open(
              "/preview/live?channel=" + channel,
              "villa-live-" + channel,
            );
          }}
        >
          Open Preview
        </button>
      </header>
      <div className="cms-preview-stage" ref={stage}>
        <div
          className="cms-preview-device"
          style={
            {
              width: viewport * scale,
              height: (view === "Mobile" ? 780 : 900) * scale,
            } as CSSProperties
          }
        >
          {channel && (
            <iframe
              key={channel}
              ref={frame}
              title="Private unsaved website preview"
              src={"/preview/live?channel=" + channel}
              style={{
                width: viewport,
                height: view === "Mobile" ? 780 : 900,
                transform: `scale(${scale})`,
              }}
              onLoad={() => {
                setStatus("Connecting…");
              }}
            />
          )}
        </div>
      </div>
      <p className="cms-preview-note">
        Private preview · changes are not saved or published.{" "}
        {view === "Mobile" ? "390 × 780" : "1280 × 900"} CSS px, scaled to fit.{" "}
        <a
          href={"/preview" + (route === "/" ? "" : route)}
          target="_blank"
          rel="noreferrer"
        >
          Saved draft
        </a>
      </p>
    </section>
  );
}
