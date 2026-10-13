import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
type Scene = { measure: () => void; update: () => void; dirty: boolean };
const scenes = new Set<Scene>();
let trigger: ScrollTrigger | undefined;
let refreshPending = false;
function flush() {
  // Geometry reads precede writes; ordinary frames use cached measurements.
  scenes.forEach(scene => { if (scene.dirty) { scene.dirty = false; scene.measure(); } });
  scenes.forEach(scene => scene.update());
}
function invalidate() { scenes.forEach(scene => { scene.dirty = true; }); }
function refreshOnce() {
  gsap.ticker.remove(refreshOnce); refreshPending = false;
  invalidate(); flush(); trigger?.refresh();
}
function refresh() {
  if (refreshPending) return;
  refreshPending = true; gsap.ticker.add(refreshOnce);
}
/** One ScrollTrigger owns native document scroll, without smoothing or snapping. */
export function registerScrollScene(measure: () => void, update: () => void) {
  gsap.registerPlugin(ScrollTrigger);
  const scene = { measure, update, dirty: true };
  scenes.add(scene);
  if (!trigger) trigger = ScrollTrigger.create({
    start: 0, end: () => Math.max(1, ScrollTrigger.maxScroll(window)),
    onUpdate: flush, onRefreshInit: invalidate, onRefresh: flush,
  });
  refresh();
  return {
    refresh() { scene.dirty = true; refresh(); },
    dispose() {
      scenes.delete(scene);
      if (!scenes.size) {
        trigger?.kill(); trigger = undefined;
        gsap.ticker.remove(refreshOnce); refreshPending = false;
      }
    },
  };
}
