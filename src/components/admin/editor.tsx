"use client";
import {
  useState,
  useEffect,
  useRef,
  useContext,
  createContext,
  useMemo,
  type CSSProperties,
} from "react";
import {
  useForm,
  useWatch,
  FormProvider,
  useFormContext,
  useController,
} from "react-hook-form";
import { contentSchema } from "@/lib/schemas/content";
import { Logout } from "./logout";
import { SocialLinksEditor } from "./social-links-editor";
import "./editor.css";
import { SectionDropdown } from "./section-dropdown";
import { PreviewPane, Tabs } from "./preview-pane";
import { StudioIcon, StudioMark } from "./studio-icon";
import { StudioOverview } from "./studio-overview";
import { changeCount, itemLabel, fieldTab, studioSearch } from "./studio-model";
import "./studio.css";
const SelectionContext = createContext<any>(null);
type Shape = {
  type?: string;
  properties?: Record<string, Shape>;
  items?: Shape;
  anyOf?: Shape[];
  oneOf?: Shape[];
  enum?: unknown[];
  const?: unknown;
  default?: unknown;
  minimum?: number;
  maximum?: number;
  minItems?: number;
  maxItems?: number;
  maxLength?: number;
  required?: string[];
};
type Data = Record<string, any>;
const labels: Record<string, string> = {
  showCmsLinkInNavigation:
    "Legacy CMS link preference (Signature menu uses logo shortcut)",
  branding: "Shared identity slots",
  signatureMenu: "Menu and loading screen",
  signatureStory: "Our Story compositions",
  signatureRooms: "Rooms introduction",
  signatureGallery: "Gallery categories and photographs",
  signatureLocation: "Getting Here",
  signatureTerms: "Terms and Conditions",
  signaturePackages: "Packages and activities",
  publicCopy: "Shared public labels",
  other: "Additional content",
};
const name = (s: string) =>
  labels[s] ||
  s.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
const locked = new Set([
  "contentVersion",
  "referenceLabels",
  "aspectRatio",
  "emblemBounds",
  "width",
  "height",
]);
function shapeFor(s: Shape, v: any): Shape {
  const choices = s.anyOf || s.oneOf;
  if (!choices) return s;
  return (
    choices.find(
      (x) => x.properties?.layout?.const === v?.layout && v?.layout,
    ) ||
    choices.find((x) => x.type === (Array.isArray(v) ? "array" : typeof v)) ||
    choices.find((x) => x.type !== "null") ||
    choices[0]
  );
}
function blank(s: Shape, hero: any): any {
  s = shapeFor(s, undefined);
  if (s.const !== undefined) return s.const;
  if (s.default !== undefined) return structuredClone(s.default);
  if (s.enum) return s.enum[0];
  if (s.type === "object") {
    if (s.properties?.src) return { ...hero };
    return Object.fromEntries(
      Object.entries(s.properties || {})
        .filter(([k]) => s.required?.includes(k))
        .map(([k, v]) => [
          k,
          k === "id"
            ? "item-" + crypto.randomUUID()
            : k === "enabled"
              ? true
              : blank(v, hero),
        ]),
    );
  }
  if (s.type === "array")
    return Array.from({ length: s.minItems || 0 }, () =>
      blank(s.items || {}, hero),
    );
  if (s.type === "boolean") return false;
  if (s.type === "number" || s.type === "integer") return s.minimum || 0;
  return "";
}
function renew(v: any): any {
  if (Array.isArray(v)) return v.map(renew);
  if (v && typeof v === "object")
    return Object.fromEntries(
      Object.entries(v).map(([k, x]) => [
        k,
        k === "id"
          ? "item-" + crypto.randomUUID()
          : k === "slug"
            ? String(x) + "-copy-" + crypto.randomUUID().slice(0, 6)
            : renew(x),
      ]),
    );
  return v;
}
export function Editor({
  initial,
  contract,
  role,
  environment,
  routes,
  variant,
  previewScope,
  previewVersion,
  initialSection = "dashboard",
}: {
  initial: Data;
  contract: Shape;
  role: string;
  environment: string;
  routes: string[];
  variant: "standard" | "signature";
  previewScope: string;
  previewVersion: string;
  initialSection?: string;
}) {
  const form = useForm<Data>({ defaultValues: initial.draft });
  const [generation, setGeneration] = useState(0);
  const [publishedSnapshot, setPublishedSnapshot] = useState(() =>
    contentSchema.parse(initial.published),
  );
  const [collapsed, setCollapsed] = useState(false),
    [query, setQuery] = useState("");
  const restructure = (path: string, value: any) => {
    const next = structuredClone(form.getValues());
    const parts = path.split(".");
    let parent: any = next;
    for (const key of parts.slice(0, -1)) parent = parent[key];
    parent[parts.at(-1)!] = value;
    form.reset(next, { keepDefaultValues: true });
    setGeneration((g) => g + 1);
  };
  const all = useWatch({ control: form.control });
  const [revision, setRevision] = useState(initial.revision),
    [published, setPublished] = useState(initial.publishedRevision),
    [publishedAt, setPublishedAt] = useState(initial.publishedAt),
    [section, setSection] = useState(initialSection),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState(""),
    [issues, setIssues] = useState<{ path: string; message: string }[]>([]),
    [confirm, setConfirm] = useState<null | { label: string; run: () => void }>(
      null,
    ),
    [history, setHistory] = useState<any>(null),
    [media, setMedia] = useState<any[]>([]),
    [diagnostics, setDiagnostics] = useState<any>(null);
  const [pane, setPane] = useState("Editor"),
    [previewOpen, setPreviewOpen] = useState(true),
    [previewWidth, setPreviewWidth] = useState(40),
    [navOpen, setNavOpen] = useState(false),
    [area, setArea] = useState(""),
    [previewRoute, setPreviewRoute] = useState(
      (
        {
          rooms: "/rooms",
          culinary: "/dining",
          culture: variant === "signature" ? "/cultures" : "/experiences",
          foundation: "/foundation",
          packages: "/packages",
          gallery: "/gallery",
          location: "/location",
          terms: "/terms",
        } as Record<string, string>
      )[initialSection] || "/",
    ),
    [previewFocus, setPreviewFocus] = useState(""),
    [selected, setSelected] = useState<Record<string, string>>({}),
    [undo, setUndo] = useState<Record<string, any>>({}),
    [savedAt, setSavedAt] = useState(initial.updatedAt);
  const actionLock = useRef(false);
  const showPreview = ![
    "dashboard",
    "media",
    "revisions",
    "diagnostics",
    "booking",
  ].includes(section);
  const dirty = form.formState.isDirty;
  const contentChanges = useMemo(
    () => changeCount(all, publishedSnapshot),
    [all, publishedSnapshot],
  );
  const validation = useMemo(() => contentSchema.safeParse(all), [all]);
  const validationIssues = validation.success
    ? []
    : validation.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      }));
  const confirmTrigger = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavOpen(false);
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, []);
  useEffect(() => {
    if (!navOpen || !window.matchMedia("(max-width:700px)").matches) return;
    const nav = document.getElementById("cms-sidebar");
    const buttons = () =>
      Array.from(
        nav?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") || [],
      );
    buttons()[0]?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        const list = buttons(),
          first = list[0],
          last = list.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    nav?.addEventListener("keydown", trap);
    return () => {
      nav?.removeEventListener("keydown", trap);
      document.querySelector<HTMLButtonElement>(".cms-nav-toggle")?.focus();
    };
  }, [navOpen]);
  useEffect(() => {
    if (confirm) {
      confirmTrigger.current = document.activeElement as HTMLElement;
      return () => confirmTrigger.current?.focus();
    }
  }, [confirm]);
  useEffect(() => {
    const guard = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);
  const mediaLoad = async () => {
    const r = await fetch("/api/admin/media", { cache: "no-store" });
    const j = await r.json();
    if (!r.ok) throw Error(j.error || "Media unavailable");
    setMedia(j.items || j);
  };
  const reload = async () => {
    const r = await fetch("/api/admin/content", { cache: "no-store" });
    if (!r.ok) throw Error("Draft reload failed");
    const j = await r.json();
    form.reset(j.draft);
    setUndo({});
    setGeneration((g) => g + 1);
    setRevision(j.revision);
    setSavedAt(j.updatedAt);
    setPublished(j.publishedRevision);
    setPublishedAt(j.publishedAt);
    setPublishedSnapshot(contentSchema.parse(j.published));
  };
  const historyLoad = async () => {
    const r = await fetch("/api/admin/history", { cache: "no-store" });
    const j = await r.json();
    if (!r.ok) throw Error(j.error);
    setHistory(j);
  };
  async function operation(action: string, content?: unknown) {
    if (actionLock.current) return;
    actionLock.current = true;
    setBusy(true);
    setStatus(action === "publish" ? "Publishing…" : "Saving…");
    setIssues([]);
    try {
      if (action === "save") {
        const parsed = contentSchema.safeParse(form.getValues());
        if (!parsed.success) {
          setIssues(
            parsed.error.issues.map((i) => ({
              path: i.path.join("."),
              message: i.message,
            })),
          );
          throw Error("Resolve validation issues before saving.");
        }
        content = parsed.data;
      }
      const r = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, expected: revision, content }),
      });
      const j = await r.json();
      if (!r.ok) {
        setIssues(
          (j.issues || []).map((i: any) => ({
            path: Array.isArray(i.path) ? i.path.join(".") : i.path,
            message: i.message,
          })),
        );
        throw Error(
          r.status === 409
            ? "Another editor changed this draft. Your edits are retained. Reload to discard them and load the latest revision."
            : j.error || "Operation failed",
        );
      }
      await reload();
      if (history) await historyLoad();
      setStatus(
        j.cacheRefreshPending
          ? "Published; cache refresh pending. Use Retry cache refresh."
          : action === "publish"
            ? "Published successfully."
            : action === "restore"
              ? "Revision restored into a new draft."
              : "Saved successfully.",
      );
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Request failed.");
    } finally {
      actionLock.current = false;
      setBusy(false);
    }
  }
  const keys = Object.keys(contract.properties || {});
  const groups: Record<string, string[]> = {
    identity:
      variant === "signature"
        ? ["name", "tagline", "branding", "signatureMenu", "socialLinks"]
        : ["name", "tagline", "branding"],
    navigation:
      variant === "signature"
        ? ["navigation", "showCmsLinkInNavigation"]
        : ["navigation"],
    pages: ["pages"],
    story:
      variant === "signature"
        ? [
            "signatureStory",
            "hero",
            "heroTitle",
            "intro",
            "storyTitle",
            "story",
          ]
        : ["hero", "heroTitle", "intro", "storyTitle", "story", "storyPanels"],
    rooms: variant === "signature" ? ["rooms", "signatureRooms"] : ["rooms"],
    culinary: ["dining"],
    culture:
      variant === "signature" ? ["culture", "experiences"] : ["experiences"],
    foundation: ["foundation"],
    packages:
      variant === "signature"
        ? ["packages", "signaturePackages"]
        : ["packages"],
    gallery:
      variant === "signature" ? ["signatureGallery", "gallery"] : ["gallery"],
    location:
      variant === "signature"
        ? ["signatureLocation", "address", "email", "mapUrl"]
        : ["address", "email", "mapUrl"],
    terms: variant === "signature" ? ["signatureTerms", "terms"] : ["terms"],
    standard: ["amenities", "testimonials"],
    booking: ["booking", "modules", "adminLink"],
  };
  const copyGroups: Record<string, string[]> = {
    rooms: [
      "rooms",
      "room",
      "signatureInclusions",
      "signatureFacilities",
      "otherRooms",
      "perspective",
    ],
    gallery: ["gallery"],
    location: ["location"],
    culture: ["experiences"],
    packages: ["packages"],
    culinary: ["dining"],
    story: ["story", "amenities"],
    booking: ["whatsapp", "planStay", "stayInformation"],
    terms: ["terms"],
  };
  const copyKeys = Object.keys(
    contract.properties?.publicCopy?.properties || {},
  ).filter(
    (k) =>
      (copyGroups[section] || []).some((p) => k.startsWith(p)) ||
      (section === "pages" &&
        !Object.values(copyGroups)
          .flat()
          .some((p) => k.startsWith(p))),
  );
  const shown = (groups[section] || []).filter(
    (k) => keys.includes(k) || k === "socialLinks",
  );
  const activeArea =
    shown.includes(area) || copyKeys.includes(area) ? area : shown[0];
  const catalog = [
    ...new Set([
      ...routes,
      ...(all.rooms || []).map((r: any) => "/rooms/" + r.slug),
      ...(all.culture?.entries || []).map((r: any) => "/culture/" + r.slug),
    ]),
  ];
  const sectionRoute: Record<string, string> = {
    identity: "/",
    navigation: "/",
    pages: "/",
    story: "/",
    rooms: "/rooms",
    culinary: "/dining",
    culture: variant === "signature" ? "/cultures" : "/experiences",
    foundation: "/foundation",
    packages: "/packages",
    gallery: "/gallery",
    location: "/location",
    terms: "/terms",
    booking: "/",
  };
  const taskGroups = [
    { title: "Overview", items: ["dashboard"] },
    { title: "Website", items: ["identity", "navigation", "pages"] },
    {
      title: "Content",
      items: [
        "story",
        "rooms",
        "culinary",
        "culture",
        ...(variant === "signature" ? ["foundation"] : []),
        "packages",
        "gallery",
        "location",
        "terms",
        ...(variant === "standard" ? ["standard"] : []),
      ],
    },
    { title: "Library", items: ["media"] },
    {
      title: "Settings",
      items: [
        "booking",
        "revisions",
        ...(role === "super_admin" ? ["diagnostics"] : []),
      ],
    },
  ];
  const sectionName = (k: string) =>
    (
      ({
        dashboard: "Overview",
        pages: "Pages & SEO",
        story: "Our Story",
        location: "Getting Here",
        booking: "Booking & modules",
        culture: variant === "signature" ? "Culture" : "Experiences",
      }) as Record<string, string>
    )[k] || name(k);
  const selection = {
    variant,
    selected,
    select: (path: string, id: string, item: any) => {
      setSelected((x) => ({ ...x, [path]: id }));
      if (path === "rooms") setPreviewRoute("/rooms/" + item.slug);
      else if (path === "culture.entries")
        setPreviewRoute("/culture/" + item.slug);
      else if (path === "pages") setPreviewRoute(item.route);
      else if (path === "navigation") setPreviewRoute(item.route);
      setPreviewFocus(item.id || "");
    },
    notify: setStatus,
    confirm: setConfirm,
    undo,
    setUndo,
  };
  useEffect(() => {
    if (section === "media")
      void mediaLoad().catch((e) => setStatus(e.message));
    if (section === "revisions")
      void historyLoad().catch((e) => setStatus(e.message));
    if (section === "diagnostics")
      void fetch("/api/admin/diagnostics", { cache: "no-store" })
        .then(async (r) => {
          if (!r.ok) throw Error("Diagnostics unavailable");
          setDiagnostics(await r.json());
        })
        .catch((e) => setStatus(e.message));
  }, [section]);
  useEffect(() => {
    const pop = () => {
      const next = window.location.pathname.split("/")[2] || "dashboard";
      setSection(next);
      setArea("");
      setPreviewRoute(sectionRoute[next] || "/");
      setPreviewFocus("");
    };
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, []);
  const changeSection = (next: string) => {
    setSection(next);
    setArea("");
    setNavOpen(false);
    setPreviewRoute(sectionRoute[next] || "/");
    setPreviewFocus("");
    window.history.pushState(null, "", "/admin/" + next);
    setStatus("");
    setQuery("");
  };
  const reviewPublish = () => {
    if (validationIssues.length) {
      setIssues(validationIssues);
      setStatus("Resolve validation issues before publishing.");
      return;
    }
    if (dirty) {
      setStatus(
        "Save your draft before publishing. Open an editor to review and save changes.",
      );
      return;
    }
    setConfirm({
      label: "Publish the saved draft to the public website?",
      run: () => {
        void operation("publish");
      },
    });
  };
  function archive(path: string, index: number) {
    if (dirty) {
      setStatus("Save or reload your draft before archiving an entry.");
      return;
    }
    const parts = path.split(".");
    let cursor: any = form.getValues();
    const stable: string[] = [];
    for (const p of parts) {
      if (Array.isArray(cursor)) {
        const child = cursor[Number(p)];
        stable.push(
          child?.id ? "@" + child.id : child?.slug ? "@" + child.slug : p,
        );
        cursor = child;
      } else {
        stable.push(p);
        cursor = cursor?.[p];
      }
    }
    setConfirm({
      label: "Archive this entry? Restore it later from Revisions.",
      run: () => {
        void operation("archive", { path: stable, index });
      },
    });
  }
  return (
    <div
      className={
        "cms cms-studio studio-redesign" +
        (collapsed ? " sidebar-collapsed" : "") +
        (section === "dashboard" ? " studio-dashboard" : "") +
        (!showPreview ? " studio-operational-page" : "")
      }
      style={{ "--preview-width": previewWidth + "%" } as CSSProperties}
    >
      <header className="cms-topbar">
        <div className="studio-brand-block">
          <a
            className="cms-brand"
            href="/admin"
            onClick={(e) => {
              e.preventDefault();
              changeSection("dashboard");
            }}
          >
            <StudioMark />
            <span>
              <strong>Villa Studio</strong>
              <small>{all.name}</small>
            </span>
          </a>
          <button
            className="studio-collapse"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((v) => !v)}
          >
            <StudioIcon name="collapse" />
          </button>
          <button
            className="cms-nav-toggle"
            aria-label="Toggle CMS navigation"
            aria-expanded={navOpen}
            aria-controls="cms-sidebar"
            onClick={() => setNavOpen((v) => !v)}
          >
            <StudioIcon name="menu" />
          </button>
        </div>
        <div className="studio-header-tools">
          <div className="studio-search">
            <StudioIcon name="search" />
            <input
              aria-label="Search content"
              placeholder="Search content..."
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setQuery("");
              }}
            />
            {query.trim() && (
              <div
                className="studio-search-results"
                aria-label="Content search results"
              >
                {studioSearch(
                  all,
                  taskGroups.flatMap((g) =>
                    g.items.map((key) => ({ key, label: sectionName(key) })),
                  ),
                  query,
                ).map((result, i) => (
                  <button
                    key={result.key + ":" + i}
                    onClick={() => {
                      changeSection(result.key);
                      if (result.path) {
                        const item = form.getValues(result.path)?.[
                          result.index!
                        ];
                        if (item)
                          selection.select(
                            result.path,
                            String(item.id || item.slug || result.index),
                            item,
                          );
                      }
                    }}
                  >
                    <span>{result.label}</span>
                    <small>{result.detail}</small>
                    <StudioIcon name="chevron" />
                  </button>
                ))}
                {!studioSearch(
                  all,
                  taskGroups.flatMap((g) =>
                    g.items.map((key) => ({ key, label: sectionName(key) })),
                  ),
                  query,
                ).length && <p>No matching content.</p>}
              </div>
            )}
          </div>
          <span className="studio-environment">
            {environment === "local-demo" ? "Local demo" : environment}
          </span>
          <details className="studio-account">
            <summary>
              {role === "owner" ? "Owner" : "Super Admin"}
              <span aria-hidden="true">⌄</span>
            </summary>
            <div>
              <p>{all.name}</p>
              <Logout dirty={dirty} />
            </div>
          </details>
          <a
            className="studio-open-link"
            href="/"
            target="_blank"
            rel="noreferrer"
            aria-label="Open published website"
          >
            <StudioIcon name="external" />
          </a>
        </div>
      </header>
      <div className="cms-studio-layout">
        {navOpen && (
          <button
            className="studio-drawer-backdrop"
            aria-label="Close CMS navigation"
            onClick={() => setNavOpen(false)}
          />
        )}
        <nav
          id="cms-sidebar"
          className={navOpen ? "cms-sidebar open" : "cms-sidebar"}
          aria-label="CMS sections"
        >
          <button
            className="studio-drawer-close"
            onClick={() => {
              setNavOpen(false);
              document
                .querySelector<HTMLButtonElement>(".cms-nav-toggle")
                ?.focus();
            }}
          >
            Close navigation ×
          </button>
          {taskGroups.map((g) => (
            <section key={g.title}>
              <h2>{g.title}</h2>
              {g.items.map((k) => (
                <button
                  key={k}
                  aria-current={section === k ? "page" : undefined}
                  aria-label={sectionName(k)}
                  onClick={() => changeSection(k)}
                >
                  <StudioIcon name={k} />
                  <span>{sectionName(k)}</span>
                </button>
              ))}
            </section>
          ))}
          <p className="cms-sidebar-note">
            Content is yours.
            <br />
            Layouts stay protected.
          </p>
        </nav>
        <div className="cms-workspace">
          <div className="cms-toolbar">
            <div>
              <h1>{sectionName(section)}</h1>
              <p className="studio-page-description">
                {section === "story"
                  ? "Shape the story, preserve the experience."
                  : section === "rooms"
                    ? "Manage your rooms, content and photos."
                    : "Manage your content. Preview every change."}
              </p>
            </div>
            <SectionDropdown
              groups={taskGroups}
              value={section}
              label={sectionName}
              onChange={changeSection}
            />
            <div className="cms-publication">
              <span className={"cms-state " + (dirty ? "dirty" : "")}>
                {dirty
                  ? "Unsaved changes"
                  : contentChanges > 0
                    ? "Unpublished draft"
                    : "Published"}
              </span>
              <small>
                Draft {revision} · Live {published}
              </small>
            </div>
            <div className="cms-actions">
              {section !== "dashboard" && (
                <button
                  className="studio-save"
                  disabled={busy || !dirty}
                  onClick={() => operation("save")}
                >
                  {busy && status === "Saving…" ? "Saving…" : "Save Draft"}
                </button>
              )}
              <button
                className="cms-primary"
                disabled={busy || dirty}
                title={dirty ? "Save your draft before publishing" : undefined}
                onClick={reviewPublish}
              >
                Publish
                <StudioIcon name="chevron" />
              </button>
              <button
                className="studio-preview-toggle"
                hidden={!showPreview}
                onClick={() => {
                  setPreviewOpen((v) => !v);
                  setPane("Preview");
                }}
              >
                {previewOpen ? "Collapse preview" : "Show preview"}
              </button>
              <details className="cms-more">
                <summary aria-label="More draft actions">•••</summary>
                <div>
                  <a href="/preview" target="_blank" rel="noreferrer">
                    Open saved preview
                  </a>
                  <button
                    disabled={busy}
                    onClick={() =>
                      setConfirm({
                        label:
                          "Discard unsaved changes and load the latest saved draft?",
                        run: () => {
                          void reload().catch((e) => setStatus(e.message));
                        },
                      })
                    }
                  >
                    Reload draft
                  </button>
                  <button disabled={busy} onClick={() => operation("refresh")}>
                    Retry cache refresh
                  </button>
                </div>
              </details>
            </div>
          </div>
          <div className="cms-mobile-tabs">
            <Tabs
              label="Editor or Preview"
              value={pane}
              options={["Editor", "Preview"]}
              onChange={(v) => {
                setPane(v);
                if (v === "Preview") setPreviewOpen(true);
              }}
            />
          </div>
          <p className="cms-notification" role="status" aria-live="polite">
            {status}
          </p>
          {issues.length > 0 && (
            <section className="cms-validation" role="alert">
              <h2>{issues.length} validation issues</h2>
              <ul>
                {issues.map((i, n) => (
                  <li key={n}>
                    {i.path}: {i.message}
                  </li>
                ))}
              </ul>
            </section>
          )}
          <div
            className={
              "cms-split " +
              (previewOpen && showPreview ? "" : "preview-collapsed")
            }
            data-active-pane={pane}
          >
            <main className="cms-editor-pane" aria-label="Content editor">
              {section === "dashboard" && (
                <StudioOverview
                  content={all}
                  revision={revision}
                  published={published}
                  publishedAt={publishedAt}
                  savedAt={savedAt}
                  changes={contentChanges}
                  issues={validationIssues.length}
                  busy={busy}
                  open={changeSection}
                  review={reviewPublish}
                  health={() => {
                    changeSection("pages");
                    setIssues(validationIssues);
                    setStatus(
                      validationIssues.length
                        ? "Resolve highlighted validation issues."
                        : "No validation issues.",
                    );
                  }}
                />
              )}
              {shown.length > 0 && (
                <div className="cms-area-select">
                  <label>
                    Content area
                    <select
                      aria-label="Content area"
                      value={activeArea}
                      onChange={(e) => setArea(e.target.value)}
                    >
                      {shown.map((k) => (
                        <option key={k} value={k}>
                          {name(k)}
                        </option>
                      ))}
                      {copyKeys.length > 0 && (
                        <optgroup label="Page labels">
                          {copyKeys.map((k) => (
                            <option key={k} value={k}>
                              {name(k)}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </label>
                  <p>Changes appear in the private preview before saving.</p>
                </div>
              )}
              <SelectionContext.Provider value={selection}>
                <FormProvider key={generation} {...form}>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void operation("save");
                    }}
                  >
                    <fieldset disabled={busy}>
                      {activeArea === "socialLinks" ? (
                        <SocialLinksEditor issues={issues} />
                      ) : (
                        activeArea && (
                          <Field
                            key={activeArea}
                            path={
                              copyKeys.includes(activeArea)
                                ? "publicCopy." + activeArea
                                : activeArea
                            }
                            label={name(activeArea)}
                            schema={
                              copyKeys.includes(activeArea)
                                ? contract.properties!.publicCopy.properties![
                                    activeArea
                                  ]
                                : contract.properties![activeArea]
                            }
                            media={media}
                            loadMedia={mediaLoad}
                            routes={catalog}
                            archive={archive}
                            restructure={restructure}
                            issues={issues}
                          />
                        )
                      )}
                    </fieldset>
                  </form>
                </FormProvider>
              </SelectionContext.Provider>
              {section === "media" && (
                <MediaLibrary
                  items={media}
                  load={mediaLoad}
                  notify={setStatus}
                  confirm={setConfirm}
                />
              )}
              {section === "revisions" && (
                <HistoryView
                  history={history}
                  busy={busy || dirty}
                  restore={(id: string) =>
                    setConfirm({
                      label:
                        "Restore into a new draft? Published content stays unchanged.",
                      run: () => {
                        void operation("restore", id);
                      },
                    })
                  }
                  unarchive={(id: string) => {
                    void operation("unarchive", id);
                  }}
                />
              )}
              {section === "diagnostics" && (
                <DiagnosticsView data={diagnostics} />
              )}
              {confirm && (
                <div
                  className="cms-confirm"
                  role="alertdialog"
                  aria-modal="true"
                  aria-labelledby="confirm-label"
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setConfirm(null);
                    if (e.key === "Tab") {
                      e.preventDefault();
                      const buttons =
                        e.currentTarget.querySelectorAll("button");
                      (document.activeElement === buttons[0]
                        ? buttons[1]
                        : buttons[0]
                      ).focus();
                    }
                  }}
                >
                  <div>
                    <p id="confirm-label">{confirm.label}</p>
                    <button autoFocus onClick={() => setConfirm(null)}>
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        const run = confirm.run;
                        setConfirm(null);
                        run();
                      }}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}
            </main>
            {showPreview && (
              <>
                <div
                  className="cms-resizer"
                  role="separator"
                  aria-label="Resize preview"
                  aria-orientation="vertical"
                  aria-valuemin={32}
                  aria-valuemax={55}
                  aria-valuenow={previewWidth}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
                      e.preventDefault();
                      setPreviewWidth((v) =>
                        Math.min(
                          55,
                          Math.max(32, v + (e.key === "ArrowLeft" ? 2 : -2)),
                        ),
                      );
                    }
                  }}
                  onPointerDown={(e) => {
                    const el = e.currentTarget;
                    el.setPointerCapture(e.pointerId);
                  }}
                  onPointerMove={(e) => {
                    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                      const box =
                        e.currentTarget.parentElement!.getBoundingClientRect();
                      setPreviewWidth(
                        Math.min(
                          55,
                          Math.max(
                            32,
                            ((box.right - e.clientX) / box.width) * 100,
                          ),
                        ),
                      );
                    }
                  }}
                  onPointerUp={(e) =>
                    e.currentTarget.releasePointerCapture(e.pointerId)
                  }
                />
                <PreviewPane
                  content={all}
                  scope={previewScope}
                  version={previewVersion}
                  route={previewRoute}
                  onRoute={setPreviewRoute}
                  routes={catalog}
                  focus={previewFocus}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
function Field({
  path,
  label,
  schema,
  media,
  loadMedia,
  routes,
  archive,
  restructure,
  issues,
}: any) {
  const f = useFormContext();
  const context = useContext(SelectionContext);
  const value = useWatch({ control: f.control, name: path });
  const s: Shape = shapeFor(schema, value);
  const key = path.split(".").at(-1);
  const set = (v: any) =>
    Array.isArray(v)
      ? restructure(path, v)
      : f.setValue(path, v, { shouldDirty: true });
  const error = issues.find((i: any) => i.path === path);
  const [preset, setPreset] = useState(0);
  const [drag, setDrag] = useState<number | null>(null);
  const [selecting, setSelecting] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false),
    [uploadError, setUploadError] = useState("");
  const replaceImage = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file || uploading) return;
    setUploading(true);
    setUploadError("");
    try {
      if (
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > 4 * 1024 * 1024
      )
        throw Error("Choose JPEG, PNG or WebP up to 4 MB.");
      const r = await fetch("/api/admin/media", {
        method: "POST",
        headers: {
          "Content-Type": file.type,
          "X-File-Name": encodeURIComponent(file.name),
        },
        body: file,
      });
      const j = await r.json();
      if (!r.ok || !j.item?.ready)
        throw Error(j.error || "Image was not marked ready. Retry the upload.");
      const m = j.item;
      set({
        ...value,
        src: "/api/media/" + m.id,
        alt: value?.alt || m.name,
        focalPoint: m.focalPoint,
      });
      const parent = path.split(".").slice(0, -1).join(".");
      if (
        f.getValues(parent)?.mediaId !== undefined ||
        path.startsWith("signatureGallery.items.")
      )
        f.setValue(parent + ".mediaId", m.id, { shouldDirty: true });
      if (f.getValues(parent)?.width !== undefined) {
        f.setValue(parent + ".width", m.width, { shouldDirty: true });
        f.setValue(parent + ".height", m.height, { shouldDirty: true });
      }
      await loadMedia();
    } catch (e) {
      setUploadError((e as Error).message);
    } finally {
      setUploading(false);
    }
  };
  const gather = () => {
    const found = new Map<string, any>();
    function scan(v: any) {
      if (Array.isArray(v)) v.forEach(scan);
      else if (v && typeof v === "object") {
        if (typeof v.src === "string" && !v.src.startsWith("/api/"))
          found.set(v.src, v);
        Object.values(v).forEach(scan);
      }
    }
    scan(f.getValues());
    setAssets([...found.values()]);
  };
  if (
    context?.variant === "standard" &&
    (key === "signature" || key?.startsWith("signature"))
  )
    return null;
  if (key === "order" || key === "viewerOrder") return null;
  if (locked.has(key) || key === "id")
    return value === undefined ? null : (
      <details className="cms-technical">
        <summary>
          {key === "id" ? "Content details" : "Protected " + label}
        </summary>
        <p className="cms-locked">
          {label}:{" "}
          {typeof value === "object"
            ? "Fixed composition geometry"
            : String(value)}
        </p>
      </details>
    );
  if (key === "introBrand" && !value)
    return (
      <p>
        Split branding is not configured for this deployment. Edit the existing
        logo slot.
      </p>
    );
  if (value === undefined || value === null)
    return (
      <div className="cms-optional">
        <span>{label} - not configured</span>
        <button
          type="button"
          onClick={() => set(blank(s, f.getValues("hero")))}
        >
          Configure {label}
        </button>
      </div>
    );
  if (
    (s.type === "array" || Array.isArray(value)) &&
    (s.items?.type === "object" ||
      s.items?.anyOf ||
      s.items?.oneOf ||
      value.some((x: any) => x && typeof x === "object"))
  )
    return (
      <CollectionField
        {...{
          path,
          label,
          schema: s,
          media,
          loadMedia,
          routes,
          archive,
          restructure,
          issues,
        }}
      />
    );
  if (s.type === "array" || Array.isArray(value)) {
    const items = Array.isArray(value) ? value : [];
    const variants = (
      s.items?.anyOf ||
      s.items?.oneOf || [s.items || {}]
    ).filter((v: Shape) => v.properties?.layout?.const !== "opener");
    const move = (from: number, to: number) => {
      if (
        to < 0 ||
        to >= items.length ||
        items[from]?.layout === "opener" ||
        items[to]?.layout === "opener"
      )
        return;
      const next = [...items];
      next.splice(to, 0, next.splice(from, 1)[0]);
      set(
        next.map((x: any, n: number) =>
          x && typeof x === "object"
            ? {
                ...x,
                ...("order" in x ? { order: n } : {}),
                ...("viewerOrder" in x ? { viewerOrder: n } : {}),
              }
            : x,
        ),
      );
    };
    return (
      <details open className="cms-group" id={"field-" + path}>
        <summary>
          {label} ({items.length})
        </summary>
        {items.map((item: any, i: number) => (
          <details
            open={i === 0}
            key={path + "." + i + ":" + (item?.id || item?.slug || "entry")}
            className="cms-entry"
            data-editor-path={path + "." + i}
            draggable={item?.layout !== "opener"}
            onDragStart={(e) => {
              e.stopPropagation();
              setDrag(i);
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (drag !== null) move(drag, i);
              setDrag(null);
            }}
          >
            <summary>
              {/body|intro/.test(path)
                ? "Paragraph " + (i + 1)
                : label + " " + (i + 1)}
            </summary>
            <div className="cms-actions">
              <strong>
                {item?.title ||
                  item?.heading ||
                  item?.layout ||
                  label + " " + (i + 1)}
              </strong>
              <button
                type="button"
                disabled={
                  i === 0 ||
                  item?.layout === "opener" ||
                  items[i - 1]?.layout === "opener"
                }
                onClick={() => move(i, i - 1)}
              >
                Move Up
              </button>
              <button
                type="button"
                disabled={i === items.length - 1 || item?.layout === "opener"}
                onClick={() => move(i, i + 1)}
              >
                Move Down
              </button>
              <button
                type="button"
                disabled={item?.layout === "opener"}
                onClick={() =>
                  set([
                    ...items.slice(0, i + 1),
                    renew(item),
                    ...items.slice(i + 1),
                  ])
                }
              >
                Duplicate
              </button>
              <button
                type="button"
                disabled={
                  item?.layout === "opener" ||
                  ["navigation", "pages"].includes(path)
                }
                onClick={() =>
                  context?.confirm({
                    label:
                      "Remove this " +
                      label +
                      " entry from the unsaved draft? Saved revisions remain available.",
                    run: () =>
                      set(items.filter((_: any, n: number) => n !== i)),
                  })
                }
              >
                Remove
              </button>
            </div>
            <Field
              path={path + "." + i}
              label={"Entry " + (i + 1)}
              schema={s.items || {}}
              {...{ media, loadMedia, routes, archive, restructure, issues }}
            />
          </details>
        ))}
        <div className="cms-actions">
          {variants.length > 1 && (
            <select
              aria-label={"Composition for " + label}
              value={preset}
              onChange={(e) => setPreset(Number(e.target.value))}
            >
              {variants.map((v: Shape, i: number) => (
                <option key={i} value={i}>
                  {name(
                    String(
                      v.properties?.layout?.const || "Composition " + (i + 1),
                    ),
                  )}
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            disabled={items.length >= (s.maxItems || 500)}
            onClick={() =>
              set([
                ...items,
                blank(variants[preset] || variants[0], f.getValues("hero")),
              ])
            }
          >
            Add {label}
          </button>
        </div>
      </details>
    );
  }
  if (s.type === "object" || typeof value === "object") {
    const imageSlot = !!s.properties?.src;
    if (
      !imageSlot &&
      (label === "Content" ||
        /^rooms\.\d+$/.test(path) ||
        /^signatureStory\.sections\.\d+$/.test(path))
    )
      return (
        <GroupedFields
          {...{
            path,
            label,
            schema: s,
            media,
            loadMedia,
            routes,
            archive,
            restructure,
            issues,
          }}
        />
      );
    if (!imageSlot)
      return (
        <ObjectCategory
          {...{
            path,
            label,
            schema: s,
            media,
            loadMedia,
            routes,
            archive,
            restructure,
            issues,
          }}
        />
      );
    return (
      <details
        open={
          label === "Content" ||
          path.split(".").length <= 2 ||
          /^rooms\.\d+\.signature\.hero$/.test(path)
        }
        className="cms-group"
        id={"field-" + path}
      >
        <summary>
          {label}
          {value.layout ? " - " + name(value.layout) : ""}
        </summary>
        {schema.anyOf?.some((x: Shape) => x.type === "null") && (
          <button type="button" onClick={() => set(null)}>
            Clear {label}
          </button>
        )}
        {imageSlot && (
          <div className="cms-image-picker">
            <img
              loading="lazy"
              src={
                value.src?.startsWith("/api/media/")
                  ? value.src + "?draft=1"
                  : value.src
              }
              alt={value.alt || ""}
            />
            <button
              type="button"
              onClick={() => {
                setSelecting(!selecting);
                gather();
                void loadMedia().catch(() => {});
              }}
            >
              Choose library image
            </button>
            <label
              className="cms-dropzone"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                void replaceImage(e.dataTransfer.files);
              }}
            >
              Replace this image · JPEG, PNG or WebP
              <input
                aria-label={"Upload replacement for " + label}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploading}
                onChange={(e) => void replaceImage(e.target.files)}
              />
            </label>
            {uploading && <p role="status">Validating and uploading image…</p>}
            {uploadError && (
              <p role="alert">{uploadError} Choose the file again to retry.</p>
            )}
            {selecting && (
              <div className="cms-media-grid">
                {assets.map((a) => (
                  <button
                    key={a.src}
                    type="button"
                    onClick={() => {
                      set({ ...value, src: a.src, alt: a.alt });
                      setSelecting(false);
                    }}
                  >
                    <img loading="lazy" src={a.src} alt={a.alt} />
                    {a.alt}
                  </button>
                ))}
                {media
                  .filter((m: any) => m.ready && !m.archived)
                  .map((m: any) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        set({
                          ...value,
                          src: "/api/media/" + m.id,
                          alt: m.alt || value.alt,
                          focalPoint: m.focalPoint,
                        });
                        const parent = path.split(".").slice(0, -1).join(".");
                        if (
                          f.getValues(parent)?.mediaId !== undefined ||
                          path.startsWith("signatureGallery.items.")
                        )
                          f.setValue(parent + ".mediaId", m.id, {
                            shouldDirty: true,
                          });
                        if (f.getValues(parent)?.width !== undefined) {
                          f.setValue(parent + ".width", m.width, {
                            shouldDirty: true,
                          });
                          f.setValue(parent + ".height", m.height, {
                            shouldDirty: true,
                          });
                        }
                        setSelecting(false);
                      }}
                    >
                      <img
                        loading="lazy"
                        src={"/api/media/" + m.id + "?draft=1"}
                        alt={m.alt || m.name}
                      />
                      {m.name}
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}
        {Object.entries(s.properties || {})
          .filter(
            ([k]) =>
              k !== "src" &&
              !(path === "signatureMenu" && ["social", "email"].includes(k)),
          )
          .map(([k, v]) => (
            <Field
              key={k}
              path={path + "." + k}
              label={name(k)}
              schema={v}
              {...{ media, loadMedia, routes, archive, restructure, issues }}
            />
          ))}
      </details>
    );
  }
  return (
    <Primitive key={path} {...{ path, label, schema: s, issues, routes }} />
  );
}
function ObjectCategory(props: any) {
  const properties: Record<string, Shape> = props.schema.properties || {},
    keys = Object.keys(properties).filter(
      (k) =>
        !["order", "viewerOrder"].includes(k) &&
        !(props.path === "signatureMenu" && ["social", "email"].includes(k)),
    );
  const initial =
    (props.path === "dining" && keys.includes("signature")
      ? "signature"
      : props.path === "signatureGallery"
        ? "items"
        : undefined) ||
    ["sections", "categories", "entries", "items"].find((k) =>
      keys.includes(k),
    ) ||
    keys[0];
  const [selected, setSelected] = useState(initial),
    active = keys.includes(selected) ? selected : initial;
  return (
    <section className="studio-object-editor">
      <label className="studio-category-select">
        {props.label}
        <select
          aria-label={props.label + " category"}
          value={active}
          onChange={(e) => setSelected(e.target.value)}
        >
          {keys.map((k) => (
            <option key={k} value={k}>
              {name(k)}
            </option>
          ))}
        </select>
      </label>
      {active ? (
        <Field
          key={active}
          {...props}
          path={props.path + "." + active}
          label={name(active)}
          schema={properties[active]}
        />
      ) : (
        <p>No settings in this group.</p>
      )}
    </section>
  );
}
function GroupedFields(props: any) {
  const f = useFormContext(),
    value = useWatch({ control: f.control, name: props.path }),
    room = /^rooms\.\d+$/.test(props.path),
    story = /^signatureStory\.sections\.\d+$/.test(props.path),
    [tab, setTab] = useState("Content");
  const fields: {
    key: string;
    path: string;
    schema: Shape;
    label: string;
    tab: string;
  }[] = [];
  const add = (
    properties: Record<string, Shape>,
    prefix: string,
    signature = false,
  ) =>
    Object.entries(properties || {}).forEach(([key, s]) => {
      if (key === "enabled" || key === "visible") return;
      if (room && key === "signature" && value.signature) {
        add(s.properties || {}, prefix + ".signature", true);
        return;
      }
      const image = !!shapeFor(s, undefined).properties?.src;
      const destination =
        room || story
          ? fieldTab(key, room, image)
          : props.path.startsWith("pages.") &&
              ["title", "description"].includes(key)
            ? "SEO"
            : image ||
                [
                  "gallery",
                  "images",
                  "photos",
                  "mediaId",
                  "menuPages",
                  "mobileMenuPages",
                  "introImages",
                ].includes(key)
              ? "Media"
              : [
                    "layout",
                    "id",
                    "enabled",
                    "nextSlug",
                    "placement",
                    "signature",
                  ].includes(key)
                ? "Options"
                : "Content";
      fields.push({
        key,
        path: prefix + "." + key,
        schema: s,
        label: signature
          ? key === "hero"
            ? "Signature hero image"
            : key === "heading"
              ? "Signature heading"
              : key === "body"
                ? "Signature body paragraphs"
                : name(key)
          : key === "title" && room
            ? "Room name"
            : key === "body"
              ? "Body paragraphs"
              : name(key),
        tab: destination,
      });
    });
  add(props.schema.properties || {}, props.path);
  if (room) {
    const order = [
      "title",
      "slug",
      "description",
      "capacity",
      "area",
      "image",
      "hero",
      "relatedRooms",
      "heading",
      "body",
    ];
    fields.sort(
      (a, b) =>
        (order.includes(a.key) ? order.indexOf(a.key) : 99) -
        (order.includes(b.key) ? order.indexOf(b.key) : 99),
    );
  }
  const additional = (field: (typeof fields)[number]) =>
    room &&
    field.tab === "Content" &&
    (field.key === "relatedRooms" ||
      field.key === "heading" ||
      field.key === "body" ||
      (field.key === "image" && !!value.signature));
  const renderField = (field: (typeof fields)[number]) => (
    <Field
      key={field.path}
      {...props}
      path={field.path}
      label={field.label}
      schema={field.schema}
    />
  );
  const tabs = [
      "Content",
      "Photos",
      "Image",
      "Amenities",
      "Video",
      "Media",
      "Options",
      "SEO",
    ].filter((t) => fields.some((v) => v.tab === t)),
    activeTab = tabs.includes(tab) ? tab : tabs[0] || "Content";
  return (
    <div className="studio-grouped-fields">
      {Object.entries(props.schema.properties || {})
        .filter(([key]) => ["enabled", "visible"].includes(key))
        .map(([key, s]) =>
          room ? (
            <label className="studio-room-visible" key={key}>
              <input
                type="checkbox"
                checked={value[key] !== false}
                onChange={(e) =>
                  f.setValue(props.path + "." + key, e.target.checked, {
                    shouldDirty: true,
                  })
                }
              />
              Visible
              <small>
                This room is{" "}
                {value[key] === false ? "hidden from" : "visible on"} the
                website.
              </small>
            </label>
          ) : (
            <Field
              key={key}
              {...props}
              path={props.path + "." + key}
              label="Visible"
              schema={s}
            />
          ),
        )}
      <Tabs
        label={room ? "Room fields" : "Story section fields"}
        value={activeTab}
        options={tabs}
        onChange={setTab}
      />
      <div role="tabpanel" aria-label={activeTab + " fields"}>
        {fields
          .filter(
            (field) =>
              field.tab === activeTab &&
              !additional(field) &&
              !(room && ["capacity", "area"].includes(field.key)),
          )
          .map((field) =>
            room &&
            (field.key === "hero" ||
              (field.key === "image" && !value.signature)) ? (
              <div key={field.path}>
                <div className="studio-room-metrics">
                  {fields
                    .filter((f) => ["capacity", "area"].includes(f.key))
                    .map(renderField)}
                </div>
                {renderField(field)}
              </div>
            ) : (
              renderField(field)
            ),
          )}
        {activeTab === "Content" && fields.some(additional) && (
          <details className="studio-additional-fields">
            <summary>Signature wording & related rooms</summary>
            {fields.filter(additional).map(renderField)}
          </details>
        )}
        {!fields.some((v) => v.tab === activeTab) && (
          <p className="studio-muted">
            No {tab.toLowerCase()} settings for this composition.
          </p>
        )}
      </div>
    </div>
  );
}
function CollectionField(props: any) {
  const {
    path,
    label,
    schema: s,
    media,
    loadMedia,
    routes,
    archive,
    restructure,
    issues,
  } = props;
  const f = useFormContext(),
    ctx = useContext(SelectionContext);
  const items = useWatch({ control: f.control, name: path }) || [];
  const [menu, setMenu] = useState(false),
    [preset, setPreset] = useState(0),
    [drag, setDrag] = useState<number | null>(null),
    [filterQuery, setFilterQuery] = useState("");
  const removed = ctx?.undo[path],
    setRemoved = (v: any) => ctx?.setUndo((x: any) => ({ ...x, [path]: v }));
  const identity = (item: any, index: number) =>
      String(item?.id || item?.slug || index),
    selected = ctx?.selected[path],
    index = Math.max(
      0,
      items.findIndex((item: any, n: number) => identity(item, n) === selected),
    ),
    item = items[index],
    variants = (s.items?.anyOf || s.items?.oneOf || [s.items || {}]).filter(
      (v: Shape) => v.properties?.layout?.const !== "opener",
    );
  const choose = (entry: any, n: number) => {
    ctx?.select(path, identity(entry, n), entry);
    setMenu(false);
  };
  const set = (next: any[]) =>
    restructure(
      path,
      next.map((x: any, n: number) => ({
        ...x,
        ...("order" in x ? { order: n } : {}),
        ...("viewerOrder" in x ? { viewerOrder: n } : {}),
      })),
    );
  const move = (from: number, to: number) => {
    if (
      to < 0 ||
      to >= items.length ||
      items[from]?.layout === "opener" ||
      items[to]?.layout === "opener"
    )
      return;
    const next = [...items];
    next.splice(to, 0, next.splice(from, 1)[0]);
    set(next);
  };
  const pinned =
      item?.layout === "opener" || ["navigation", "pages"].includes(path),
    title = (x: any, n: number) => itemLabel(x, label + " " + (n + 1));
  const thumb = (x: any) =>
    x?.image ||
    x?.hero ||
    x?.leadImage ||
    x?.logo ||
    x?.photo ||
    x?.signature?.hero;
  return (
    <section className="cms-collection" id={"field-" + path}>
      <div className="cms-collection-body">
        <div className="studio-collection-card">
          {" "}
          <header>
            <div>
              <h2>
                {path === "rooms"
                  ? "Room types"
                  : path === "signatureStory.sections"
                    ? "Story sections"
                    : label}
              </h2>
              <small>
                {items.length} {path === "rooms" ? "rooms" : "sections"}
              </small>
            </div>
            <div className="cms-actions">
              {variants.length > 1 && (
                <select
                  aria-label={"Composition for " + label}
                  value={preset}
                  onChange={(e) => setPreset(Number(e.target.value))}
                >
                  {variants.map((v: Shape, n: number) => (
                    <option key={n} value={n}>
                      {name(
                        String(
                          v.properties?.layout?.const ||
                            "Composition " + (n + 1),
                        ),
                      )}
                    </option>
                  ))}
                </select>
              )}
              <button
                type="button"
                disabled={
                  items.length >= (s.maxItems || 500) ||
                  ["navigation", "pages"].includes(path)
                }
                title={
                  ["navigation", "pages"].includes(path)
                    ? "Registered destinations are managed through existing rows"
                    : undefined
                }
                onClick={() => {
                  const next = blank(
                    variants[preset] || variants[0],
                    f.getValues("hero"),
                  );
                  set([...items, next]);
                  choose(next, items.length);
                }}
              >
                Add item
              </button>
            </div>
          </header>
          <input
            className="studio-collection-search"
            type="search"
            aria-label={"Search " + label}
            placeholder={"Search " + label.toLowerCase() + "..."}
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
          />
          <div className="cms-item-list" aria-label={label + " items"}>
            {items.map((entry: any, n: number) => (
              <button
                className="cms-item-row"
                type="button"
                key={identity(entry, n)}
                hidden={
                  !title(entry, n)
                    .toLowerCase()
                    .includes(filterQuery.toLowerCase())
                }
                aria-pressed={n === index}
                aria-label={
                  title(entry, n) +
                  (entry.enabled === false || entry.visible === false
                    ? " — Hidden"
                    : " — Visible")
                }
                title={title(entry, n)}
                draggable={entry.layout !== "opener"}
                onDragStart={(e) => {
                  e.stopPropagation();
                  setDrag(n);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (drag !== null) move(drag, n);
                  setDrag(null);
                }}
                onClick={() => choose(entry, n)}
              >
                {thumb(entry) && (
                  <img
                    loading="lazy"
                    src={
                      thumb(entry).src.startsWith("/api/media/")
                        ? thumb(entry).src + "?draft=1"
                        : thumb(entry).src
                    }
                    alt=""
                  />
                )}
                <span>
                  <strong
                    className={
                      title(entry, n).length <= 24
                        ? "cms-short-label"
                        : undefined
                    }
                    title={title(entry, n)}
                  >
                    {title(entry, n)}
                  </strong>
                  <small>
                    {entry.enabled === false || entry.visible === false
                      ? "Hidden"
                      : "Visible"}
                    {entry.layout
                      ? " · " + name(entry.layout)
                      : entry.route
                        ? " · " + entry.route
                        : ""}
                  </small>
                </span>
                <StudioIcon name="grip" />
              </button>
            ))}
          </div>
        </div>
        <div className="cms-selected-item">
          {removed && (
            <div className="cms-undo">
              <span>Item removed from this draft.</span>
              <button
                type="button"
                onClick={() => {
                  const next = [...items];
                  next.splice(
                    Math.min(removed.index, next.length),
                    0,
                    removed.item,
                  );
                  set(next);
                  setRemoved(null);
                }}
              >
                Undo
              </button>
            </div>
          )}
          {item ? (
            <>
              <div className="cms-selected-heading">
                <h3>{title(item, index)}</h3>
                <div className="cms-actions">
                  <button
                    type="button"
                    aria-label="Move selected item up"
                    disabled={
                      index === 0 ||
                      item.layout === "opener" ||
                      items[index - 1]?.layout === "opener"
                    }
                    onClick={() => move(index, index - 1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label="Move selected item down"
                    disabled={
                      index === items.length - 1 || item.layout === "opener"
                    }
                    onClick={() => move(index, index + 1)}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    aria-label="Item actions"
                    aria-expanded={menu}
                    onClick={() => setMenu((v) => !v)}
                  >
                    •••
                  </button>
                </div>
              </div>
              {menu && (
                <div
                  className="cms-item-menu"
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setMenu(false);
                  }}
                >
                  <button
                    type="button"
                    disabled={pinned}
                    title={
                      pinned
                        ? "Pinned or registered content cannot be duplicated"
                        : undefined
                    }
                    onClick={() => {
                      const copy = renew(item);
                      set([
                        ...items.slice(0, index + 1),
                        copy,
                        ...items.slice(index + 1),
                      ]);
                      choose(copy, index + 1);
                    }}
                  >
                    Duplicate item
                  </button>
                  <button
                    type="button"
                    disabled={pinned}
                    title={
                      pinned
                        ? "Pinned or registered content cannot be archived"
                        : undefined
                    }
                    onClick={() =>
                      ctx?.confirm({
                        label:
                          "Archive " +
                          title(item, index) +
                          "? It is removed from this unsaved preview; Save Draft will preserve it in Revisions.",
                        run: () => {
                          setRemoved({ item, index });
                          set(items.filter((_: any, n: number) => n !== index));
                          ctx.notify(
                            "Removed from unsaved draft. Save Draft to archive, or Undo.",
                          );
                          setMenu(false);
                        },
                      })
                    }
                  >
                    Archive item
                  </button>
                  {pinned && (
                    <small>
                      This content is pinned or registered. Edit its content or
                      visibility instead.
                    </small>
                  )}
                </div>
              )}
              <Field
                key={identity(item, index) + ":" + index}
                {...props}
                path={path + "." + index}
                label="Content"
                schema={s.items || {}}
              />
            </>
          ) : (
            <p>No items yet. Add a supported composition to get started.</p>
          )}
        </div>
      </div>
    </section>
  );
}
function Primitive({ path, label, schema: s, issues, routes }: any) {
  const f = useFormContext();
  const { field } = useController({ control: f.control, name: path });
  const key = path.split(".").at(-1);
  const error = issues.find((i: any) => i.path === path);
  const refChoices = /relatedRooms\.\d+$/.test(path)
    ? f
        .getValues("rooms")
        ?.filter(
          (r: any) =>
            r.id !== f.getValues(path.split(".").slice(0, -2).join("."))?.id,
        )
        .map((r: any) => r.id)
    : /^signatureGallery\.items\.\d+\.categories\.\d+$/.test(path)
      ? f.getValues("signatureGallery.categories")?.map((c: any) => c.id)
      : undefined;
  const choices =
    refChoices || s.enum || (s.const !== undefined ? [s.const] : undefined);
  const video =
    key === "enabled" &&
    (f.getValues(path.replace(/\.enabled$/, ".layout")) === "video" ||
      path === "signatureStory.video.enabled");
  const pinned =
    key === "enabled" &&
    (f.getValues(path.replace(/\.enabled$/, ".layout")) === "opener" ||
      (path.startsWith("pages.") &&
        f.getValues(path.replace(/\.enabled$/, ".route")) === "/"));
  const value = field.value ?? "";
  const props = {
    name: field.name,
    onBlur: field.onBlur,
    ref: field.ref,
    "aria-invalid": !!error,
  };
  const routeOptions = routes;
  return (
    <label className="cms-field" id={"field-" + path}>
      <span>
        {key === "visible"
          ? "Show in navigation menu"
          : key === "enabled"
            ? path.startsWith("pages.")
              ? "Enable page"
              : "Enable this content"
            : label}
      </span>
      {video ? (
        <p>Video playback planned; block must remain disabled.</p>
      ) : pinned ? (
        <p>Core landing composition remains enabled.</p>
      ) : s.type === "boolean" ? (
        <input
          {...props}
          type="checkbox"
          checked={field.value === true}
          onChange={(e) => field.onChange(e.target.checked)}
        />
      ) : key === "route" ? (
        <select {...props} value={value} onChange={field.onChange}>
          {[...new Set([value, ...routeOptions])].map((r: any) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      ) : choices ? (
        <select
          {...props}
          value={value}
          onChange={field.onChange}
          disabled={s.const !== undefined}
        >
          {choices.map((v: any) => (
            <option key={String(v)} value={String(v)}>
              {name(String(v))}
            </option>
          ))}
        </select>
      ) : s.type === "integer" || s.type === "number" ? (
        <input
          {...props}
          type="number"
          step={s.type === "integer" ? 1 : "any"}
          min={s.minimum}
          max={s.maximum}
          value={Number.isFinite(value) ? value : ""}
          onChange={(e) =>
            field.onChange(e.target.value === "" ? NaN : Number(e.target.value))
          }
        />
      ) : [
          "story",
          "terms",
          "body",
          "description",
          "heading",
          "lead",
          "copy",
          "text",
          "smallCopy",
          "largeCopy",
          "message",
          "intro",
        ].includes(key) || /\.(body|intro|description)\.\d+$/.test(path) ? (
        <textarea
          {...props}
          rows={4}
          maxLength={s.maxLength}
          value={value}
          onChange={field.onChange}
        />
      ) : (
        <input
          {...props}
          placeholder=" "
          maxLength={s.maxLength}
          value={value}
          onChange={field.onChange}
        />
      )}{" "}
      {error && <small role="alert">{error.message}</small>}
    </label>
  );
}

function MediaLibrary({ items, load, notify, confirm }: any) {
  const [busy, setBusy] = useState(false);
  async function run(method: string, body: any) {
    setBusy(true);
    try {
      const r = await fetch("/api/admin/media", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (!r.ok) throw Error(j.error || "Operation failed");
      await load();
      notify("Media saved.");
    } catch (e) {
      notify((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function upload(files: FileList | null) {
    if (!files?.length || busy) return;
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        if (
          !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
          file.size > 4 * 1024 * 1024
        )
          throw Error("Choose JPEG, PNG or WebP up to 4 MB.");
        const r = await fetch("/api/admin/media", {
          method: "POST",
          headers: {
            "Content-Type": file.type,
            "X-File-Name": encodeURIComponent(file.name),
          },
          body: file,
        });
        const j = await r.json();
        if (!r.ok) throw Error(j.error || "Upload failed");
      }
      await load();
      notify("Upload complete.");
    } catch (e) {
      notify((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const [search, setSearch] = useState(""),
    [filter, setFilter] = useState("all"),
    [selected, setSelected] = useState("");
  const active = items.find((m: any) => m.id === selected)?.id || items[0]?.id;
  const filtered = items.filter(
    (m: any) =>
      (filter === "all" ||
        (filter === "archived" ? m.archived : !m.archived)) &&
      (m.name + " " + m.alt).toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <section>
      <label
        className="cms-dropzone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void upload(e.dataTransfer.files);
        }}
      >
        Drop images here or select files
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={busy}
          onChange={(e) => upload(e.target.files)}
        />
      </label>
      <p>
        {busy
          ? "Uploading or saving..."
          : "JPEG / PNG / WebP - 4 MB maximum - replacements create a new immutable image."}
      </p>
      <div className="studio-media-workspace">
        <div className="studio-media-browser">
          <div className="studio-media-tools">
            <input
              type="search"
              aria-label="Search media"
              placeholder="Search media..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              aria-label="Filter media"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All images</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="cms-media-grid">
            {filtered.map((m: any) => (
              <button
                type="button"
                aria-pressed={active === m.id}
                key={m.id}
                onClick={() => setSelected(m.id)}
              >
                {m.ready && (
                  <img
                    src={"/api/media/" + m.id + "?draft=1"}
                    alt=""
                    loading="lazy"
                  />
                )}
                <span>{m.name}</span>
                <small>
                  {m.archived ? "Archived" : m.ready ? "Ready" : "Incomplete"}
                </small>
              </button>
            ))}
            {!filtered.length && (
              <p>No matching images. Upload an image or adjust the filters.</p>
            )}
          </div>
        </div>
        <div className="studio-media-details">
          {items.map((m: any) => (
            <article key={m.id} hidden={active !== m.id}>
              {m.ready && <MediaFraming item={m} />}
              <p>
                {m.name} - {m.width}x{m.height} -{" "}
                {m.ready ? "Ready" : "Incomplete upload"}
                {m.archived ? " - Archived" : ""}
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const d = new FormData(e.currentTarget);
                  void run("PATCH", {
                    id: m.id,
                    alt: d.get("alt"),
                    caption: d.get("caption"),
                    focalPoint: {
                      x: Number(d.get("x")),
                      y: Number(d.get("y")),
                    },
                    archived: m.archived,
                  });
                }}
              >
                <label>
                  Alt text
                  <input name="alt" defaultValue={m.alt} maxLength={300} />
                </label>
                <label>
                  Caption
                  <input
                    name="caption"
                    defaultValue={m.caption}
                    maxLength={600}
                  />
                </label>
                <fieldset>
                  <legend>Focal point (%)</legend>
                  {["x", "y"].map((k) => (
                    <label key={k}>
                      {k}
                      <input
                        name={k}
                        type="number"
                        min="0"
                        max="100"
                        defaultValue={m.focalPoint?.[k] ?? 50}
                      />
                    </label>
                  ))}
                </fieldset>
                <button disabled={busy}>Save metadata</button>
              </form>
              <button
                disabled={busy}
                onClick={() =>
                  run("PATCH", { id: m.id, archived: !m.archived })
                }
              >
                {m.archived ? "Unarchive" : "Archive"}
              </button>
              <InlineConfirm
                disabled={busy}
                label="Delete unused image"
                action={() => run("DELETE", { id: m.id })}
              />
              <button
                onClick={async () => {
                  const r = await fetch("/api/admin/media/" + m.id);
                  const j = await r.json();
                  notify(
                    r.ok
                      ? "References: " + JSON.stringify(j.references)
                      : j.error,
                  );
                }}
              >
                References
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HistoryView({ history, busy, restore, unarchive }: any) {
  const [category, setCategory] = useState("Revisions"),
    [selected, setSelected] = useState("");
  if (!history) return <p role="status">Loading revision history…</p>;
  const rows =
      category === "Revisions"
        ? history.revisions || []
        : history.archives || [],
    active = rows.find((r: any) => r.id === selected) || rows[0];
  return (
    <section>
      <Tabs
        label="History category"
        value={category}
        options={["Revisions", "Archived entries"]}
        onChange={setCategory}
      />
      <div className="studio-operational">
        <div className="studio-operational-list">
          <h2>{category}</h2>
          {rows.map((r: any) => (
            <button
              key={r.id}
              aria-pressed={active?.id === r.id}
              onClick={() => setSelected(r.id)}
            >
              {category === "Revisions"
                ? "Revision " + r.revision
                : itemLabel(r.value, "Archived entry")}
              <small>{r.action || r.path?.join(" / ")}</small>
            </button>
          ))}
          {!rows.length && <p>No {category.toLowerCase()}.</p>}
        </div>
        <div className="studio-operational-detail">
          {active ? (
            <>
              <h2>
                {category === "Revisions"
                  ? "Revision " + active.revision
                  : itemLabel(active.value, "Archived entry")}
              </h2>
              <p>
                {active.action} {active.actor}
              </p>
              {active.createdAt && (
                <p>
                  {new Date(active.createdAt).toLocaleString("en-GB", {
                    timeZone: "UTC",
                  })}{" "}
                  UTC
                </p>
              )}
              {active.path && <p>{active.path.join(" / ")}</p>}
              <button
                disabled={busy}
                onClick={() =>
                  category === "Revisions"
                    ? restore(active.id)
                    : unarchive(active.id)
                }
              >
                {category === "Revisions" ? "Restore draft" : "Restore entry"}
              </button>
              {busy && (
                <p>Save or reload your current edits before restoring.</p>
              )}
            </>
          ) : (
            <p>Select an entry to see details.</p>
          )}
        </div>
      </div>
    </section>
  );
}
function DiagnosticsView({ data }: any) {
  const [selected, setSelected] = useState("");
  if (!data) return <p role="status">Loading diagnostics…</p>;
  const keys = Object.keys(data),
    active = keys.includes(selected) ? selected : keys[0];
  return (
    <section className="studio-operational">
      <div className="studio-operational-list">
        <h2>Diagnostics</h2>
        {keys.map((k) => (
          <button
            key={k}
            aria-pressed={active === k}
            onClick={() => setSelected(k)}
          >
            {name(k)}
          </button>
        ))}
      </div>
      <div className="studio-operational-detail">
        <h2>{active ? name(active) : "No diagnostics"}</h2>
        <pre>
          {typeof data[active] === "object"
            ? JSON.stringify(data[active], null, 2)
            : String(data[active] ?? "")}
        </pre>
      </div>
    </section>
  );
}
function MediaFraming({ item }: { item: any }) {
  const [ratio, setRatio] = useState(1);
  return (
    <div>
      <div className="cms-aspect-stage">
        <img
          loading="lazy"
          src={"/api/media/" + item.id + "?draft=1"}
          alt={item.alt || item.name}
          style={{
            width: 160 * Math.sqrt(ratio),
            height: 160 / Math.sqrt(ratio),
            objectFit: "cover",
            objectPosition: `${item.focalPoint?.x ?? 50}% ${item.focalPoint?.y ?? 50}%`,
          }}
        />
      </div>
      <div className="cms-actions" role="group" aria-label="Framing preview">
        {[4 / 3, 1, 3 / 4].map((r, i) => (
          <button
            key={r}
            aria-pressed={r === ratio}
            onClick={() => setRatio(r)}
          >
            {["Landscape", "Square", "Portrait"][i]}
          </button>
        ))}
      </div>
      <small>
        Crop preview only. Public slot dimensions stay fixed; focal point is
        saved below.
      </small>
    </div>
  );
}

function InlineConfirm({
  label,
  disabled,
  action,
}: {
  label: string;
  disabled: boolean;
  action: () => void;
}) {
  const [armed, setArmed] = useState(false);
  return (
    <span
      className="cms-inline-confirm"
      onKeyDown={(e) => {
        if (e.key === "Escape") setArmed(false);
      }}
    >
      {armed ? (
        <>
          <span>Delete permanently?</span>
          <button
            autoFocus
            disabled={disabled}
            onClick={() => {
              setArmed(false);
              action();
            }}
          >
            Confirm delete
          </button>
          <button onClick={() => setArmed(false)}>Cancel</button>
        </>
      ) : (
        <button disabled={disabled} onClick={() => setArmed(true)}>
          {label}
        </button>
      )}
    </span>
  );
}
