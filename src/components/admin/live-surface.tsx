"use client";
import {
  useEffect,
  useRef,
  useState,
  startTransition,
  type ReactNode,
} from "react";
import { previewInput } from "@/lib/content/live-preview";
type Binding = { channel: string; scope: string; version: string; id: string };
export function LivePreviewSurface({
  binding,
  render,
}: {
  binding: Binding;
  render: (
    input: unknown,
  ) => Promise<{ sequence: number; warnings: string[]; node: ReactNode }>;
}) {
  const [node, setNode] = useState<ReactNode>(null),
    [error, setError] = useState(""),
    [warning, setWarning] = useState("");
  const latest = useRef<any>(null),
    running = useRef(false),
    mounted = useRef(true),
    route = useRef(""),
    accepted = useRef(-1),
    stopProfile = useRef(() => {}),
    focused = useRef(""),
    placement = useRef<any>(null);
  useEffect(() => {
    if (!node || !placement.current) return;
    const pending = placement.current;
    placement.current = null;
    let second = 0;
    window.dispatchEvent(new Event("resize"));
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => pending());
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [node]);
  useEffect(() => {
    mounted.current = true;
    const send = (type: string, extra = {}) => {
      const message = {
        type,
        channel: binding.channel,
        scope: binding.scope,
        ...extra,
      };
      if (window.opener) window.opener.postMessage(message, location.origin);
      else window.parent.postMessage(message, location.origin);
    };
    async function pump() {
      if (running.current || !latest.current) return;
      running.current = true;
      const input = latest.current;
      latest.current = null;
      const y = scrollY,
        x = scrollX,
        changed = route.current !== input.route;
      const started = performance.now();
      let last = started,
        frames = 0,
        slowFrames = 0,
        maxGap = 0,
        longTasks = 0,
        frame = 0,
        tracking = true;
      const sample = (now: number) => {
        const gap = now - last;
        last = now;
        frames++;
        maxGap = Math.max(maxGap, gap);
        if (gap > 20) slowFrames++;
        if (tracking) frame = requestAnimationFrame(sample);
      };
      frame = requestAnimationFrame(sample);
      const observer =
        typeof PerformanceObserver !== "undefined"
          ? new PerformanceObserver((list) => {
              longTasks += list.getEntries().length;
            })
          : null;
      try {
        observer?.observe({ type: "longtask", buffered: false });
      } catch {}
      const finish = () => {
        tracking = false;
        cancelAnimationFrame(frame);
        observer?.disconnect();
        return {
          frames,
          framesOver20ms: slowFrames,
          maxFrameGapMs: maxGap,
          longTasks,
          updateMs: performance.now() - started,
        };
      };
      stopProfile.current = () => {
        finish();
      };
      send("villa-preview:busy", { sequence: input.sequence });
      try {
        const result = await new Promise<Awaited<ReturnType<typeof render>>>(
          (resolve, reject) =>
            startTransition(async () => {
              try {
                resolve(await render(input));
              } catch (e) {
                reject(e);
              }
            }),
        );
        if (!mounted.current) return;
        if (!latest.current) {
          placement.current = () => {
            window.scrollTo(changed ? 0 : x, changed ? 0 : y);
            if (input.focus && input.focus !== focused.current) {
              const target =
                document.getElementById("story-" + input.focus) ||
                document.querySelector(
                  `[data-culture-section="${CSS.escape(input.focus)}"]`,
                );
              if (target) {
                const track = target.closest<HTMLElement>(".sg-story-track"),
                  flow = track?.closest<HTMLElement>(".sg-story-flow");
                if (
                  track &&
                  flow &&
                  innerWidth > 900 &&
                  track.dataset.reduced !== "true"
                )
                  window.scrollTo({
                    top:
                      flow.getBoundingClientRect().top +
                      scrollY +
                      target.getBoundingClientRect().left -
                      track.getBoundingClientRect().left +
                      track.scrollLeft,
                    behavior: "instant",
                  });
                else target.scrollIntoView({ block: "nearest" });
                focused.current = input.focus;
              }
            }
          };
          startTransition(() => {
            setNode(result.node);
            setError("");
            setWarning(
              result.warnings.length
                ? "Incomplete fields use saved values: " +
                    result.warnings.slice(0, 3).join("; ")
                : "",
            );
          });
          route.current = input.route;
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              const metrics = finish();
              document
                .querySelector(".live-surface")
                ?.setAttribute("data-preview-profile", JSON.stringify(metrics));
              send("villa-preview:rendered", {
                sequence: input.sequence,
                elapsed: metrics.updateMs,
                warnings: result.warnings.length,
              });
            }),
          );
        }
      } catch (e) {
        finish();
        if (mounted.current) {
          setError(e instanceof Error ? e.message : "Live preview failed.");
          send("villa-preview:error", {
            message:
              "Live preview failed. Retry after checking fields or signing in again.",
          });
        }
      } finally {
        if (latest.current || !mounted.current) finish();
        running.current = false;
        if (latest.current && mounted.current) void pump();
      }
    }
    const receive = (event: MessageEvent) => {
      if (
        event.origin !== location.origin ||
        event.source !== (window.opener || window.parent)
      )
        return;
      try {
        const input = previewInput(event.data);
        if (
          input.channel !== binding.channel ||
          input.scope !== binding.scope ||
          input.version !== binding.version ||
          input.sequence <= accepted.current
        )
          return;
        accepted.current = input.sequence;
        latest.current = input;
        void pump();
      } catch {}
    };
    const navigate = (event: MouseEvent) => {
      const a = (event.target as Element)?.closest("a");
      if (!a) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname.startsWith("/admin")) {
        event.preventDefault();
        event.stopPropagation();
        send("villa-preview:error");
        return;
      }
      if (!url.pathname.startsWith("/preview")) return;
      if (
        url.hash &&
        (url.pathname.replace(/^\/preview/, "") || "/") === route.current
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      send("villa-preview:navigate", {
        route: url.pathname.replace(/^\/preview/, "") || "/",
      });
    };
    window.addEventListener("message", receive);
    document.addEventListener("click", navigate, true);
    send("villa-preview:ready");
    return () => {
      mounted.current = false;
      stopProfile.current();
      window.removeEventListener("message", receive);
      document.removeEventListener("click", navigate, true);
    };
  }, [binding, render]);
  return (
    <>
      <style>
        {
          ".live-feedback{position:fixed;top:8px;left:8px;right:8px;z-index:9999;padding:12px;background:#fff7dc;color:#252c29;font:14px/1.5 Arial;box-shadow:0 2px 12px #0002}.live-route-unavailable{padding:80px 30px;font:18px Arial}.live-stale{opacity:.4;pointer-events:none}"
        }
      </style>
      {(error || warning || !node) && (
        <aside className="live-feedback" role={error ? "alert" : "status"}>
          {error || warning || "Connecting to editor…"}
        </aside>
      )}
      <div className={error ? "live-surface live-stale" : "live-surface"}>
        {node}
      </div>
    </>
  );
}
