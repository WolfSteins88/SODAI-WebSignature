export type MenuPhase = "closed" | "opening" | "open" | "closing";
export type MenuNavigation = "default" | "logo" | "menu" | "admin";

// Completion callbacks can arrive after an interruption. Only the current intent
// may settle visibility, release the lock, or commit a pending destination.
export function createMenuController(adapter: {
  phase: (phase: MenuPhase) => void;
  activate: () => void;
  deactivate: (restoreFocus: boolean) => void;
  move: (open: boolean, navigation: MenuNavigation) => void;
  navigate: (href: string, navigation: MenuNavigation) => void;
}) {
  let phase: MenuPhase = "closed", destination: string | undefined;
  let navigation: MenuNavigation = "default";
  const set = (next: MenuPhase) => { phase = next; adapter.phase(next); };
  const request = (open: boolean, href?: string, kind: MenuNavigation = "default") => {
    destination = open ? undefined : href;
    navigation = kind;
    if (open && phase === "closed") adapter.activate();
    if (!open && phase === "closed") {
      destination = undefined;
      if (href) adapter.navigate(href, kind);
      return;
    }
    set(open ? "opening" : "closing");
    adapter.move(open, kind);
  };
  return {
    get phase() { return phase; },
    request,
    toggle() { request(phase !== "opening" && phase !== "open"); },
    opened() { if (phase === "opening") set("open"); },
    closed() {
      if (phase !== "closing") return;
      const href = destination;
      destination = undefined;
      set("closed");
      adapter.deactivate(!href);
      if (href) adapter.navigate(href, navigation);
    },
    reset() {
      destination = undefined;
      if (phase !== "closed") { set("closed"); adapter.deactivate(false); }
    },
  };
}
