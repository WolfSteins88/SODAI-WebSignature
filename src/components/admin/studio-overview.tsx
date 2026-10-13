import { StudioIcon } from "./studio-icon";
export function StudioOverview({
  content,
  revision,
  published,
  publishedAt,
  savedAt,
  changes,
  issues,
  busy,
  open,
  review,
  health,
}: {
  content: any;
  revision: number;
  published: number;
  publishedAt: string | null;
  savedAt: string | null;
  changes: number;
  issues: number;
  busy: boolean;
  open: (key: string) => void;
  review: () => void;
  health: () => void;
}) {
  const date = savedAt ? new Date(savedAt) : null;
  const print = (s: string | null, part: "date" | "time") =>
    s
      ? new Date(s).toLocaleString("en-GB", {
          timeZone: "UTC",
          ...(part === "date"
            ? { day: "2-digit", month: "short", year: "numeric" }
            : { hour: "2-digit", minute: "2-digit" }),
        })
      : "Not yet published";
  const images = [
    content.signatureStory?.sections?.find((s: any) => s.layout === "opener")
      ?.image || content.hero,
    content.rooms?.[0]?.signature?.hero || content.rooms?.[0]?.image,
    content.dining?.signature?.hero ||
      content.dining?.signature?.categories?.[0]?.image ||
      content.dining?.hero ||
      content.dining?.image,
  ];
  const photo = (image: any) =>
    image?.src?.startsWith("/api/media/") ? image.src + "?draft=1" : image?.src;
  return (
    <section className="studio-overview">
      <div className="studio-intro">
        <div className="studio-date">
          <strong>{date ? date.getUTCDate() : "—"}</strong>
          <span>
            {date
              ? date.toLocaleString("en-GB", {
                  month: "short",
                  timeZone: "UTC",
                })
              : "Saved"}
          </span>
        </div>
        <div>
          <span className="cms-eyebrow">YOUR VILLA, YOUR STORY</span>
          <h1>{content.name}</h1>
          <p>Manage your content. Preview every change.</p>
        </div>
        <div className="studio-intro-actions">
          <button className="cms-primary" onClick={() => open("story")}>
            <StudioIcon name="edit" />
            Edit Website
            <StudioIcon name="chevron" />
          </button>
          <a
            className="studio-button"
            href="/"
            target="_blank"
            rel="noreferrer"
          >
            <StudioIcon name="external" />
            Open Website
          </a>
        </div>
      </div>
      <div className="studio-status-grid">
        <article className="studio-website-card studio-card">
          {photo(images[0]) ? (
            <img src={photo(images[0])} alt={images[0].alt || ""} />
          ) : (
            <div className="studio-empty-photo">No villa image</div>
          )}
          <div>
            <h2>Website status</h2>
            <p className="studio-published">
              <i />
              {published ? "Published" : "Not yet published"}
            </p>
            <p className="studio-muted">
              {changes
                ? `${changes} content changes to review.`
                : "Draft matches publication."}
            </p>
            <a
              className="studio-button"
              href="/"
              target="_blank"
              rel="noreferrer"
            >
              View live site
              <StudioIcon name="external" />
              <StudioIcon name="chevron" />
            </a>
          </div>
        </article>
        <div className="studio-card-stack">
          {[
            ["Draft revision", revision, "pages"],
            ["Published revision", published, "layers"],
          ].map(([label, value, icon]) => (
            <button
              className="studio-card studio-revision"
              key={label}
              onClick={() => open("revisions")}
            >
              <span
                className={
                  "studio-icon-disc " + (icon === "layers" ? "green" : "")
                }
              >
                <StudioIcon name={String(icon)} />
              </span>
              <span>
                <strong>{value}</strong>
                <small>{label}</small>
              </span>
              <StudioIcon name="chevron" />
            </button>
          ))}
        </div>
        <div className="studio-card-stack">
          <article className="studio-card studio-published-date">
            <span className="studio-icon-disc neutral">
              <StudioIcon name="calendar" />
            </span>
            <div>
              <p className="studio-muted">Last published</p>
              <strong>{print(publishedAt, "date")}</strong>
              {publishedAt && <small>{print(publishedAt, "time")} UTC</small>}
            </div>
          </article>
          <article className="studio-card studio-changes">
            <span className="studio-icon-disc green">
              <StudioIcon name="check" />
            </span>
            <div>
              <p className="studio-muted">Changes</p>
              <strong>{changes}</strong>
              <small>pending content changes</small>
              <p className="studio-muted">
                {changes
                  ? "Review before publishing."
                  : "Everything is up to date."}
              </p>
              <button className="cms-primary" disabled={busy} onClick={review}>
                Review &amp; Publish
                <StudioIcon name="chevron" />
              </button>
            </div>
          </article>
        </div>
      </div>
      <div className="studio-lower-grid">
        <article className="studio-card">
          <h2>
            Edit content <StudioIcon name="chevron" />
          </h2>
          {[
            ["story", "Our Story"],
            ["rooms", "Rooms"],
            ["culinary", "Culinary"],
          ].map(([key, label], i) => (
            <button
              className="studio-content-row"
              key={key}
              onClick={() => open(key)}
            >
              {photo(images[i]) && <img src={photo(images[i])} alt="" />}
              <span>{label}</span>
              <StudioIcon name="chevron" />
            </button>
          ))}
        </article>
        <article className="studio-card">
          <h2>Quick access</h2>
          {[
            ["story", "Edit homepage", "edit"],
            ["navigation", "Edit navigation", "navigation"],
            ["rooms", "Manage rooms", "rooms"],
            ["media", "Open media library", "media"],
          ].map(([key, label, icon]) => (
            <button
              className="studio-quick-row"
              key={key}
              onClick={() => open(key)}
            >
              <span className="studio-icon-disc">
                <StudioIcon name={icon} />
              </span>
              <span>{label}</span>
              <StudioIcon name="chevron" />
            </button>
          ))}
        </article>
        <article className="studio-card studio-health">
          <h2>
            Content health
            <button aria-label="Review content validation" onClick={health}>
              <StudioIcon name="chevron" />
            </button>
          </h2>
          <div className="studio-health-ring">
            <strong>{issues}</strong>
            <span>Validation issues</span>
          </div>
          <p className="studio-muted">
            {issues
              ? "Review the highlighted fields."
              : "Ready for your next update."}
          </p>
        </article>
        <article className="studio-card studio-preview-card">
          <h2>
            Live preview <StudioIcon name="desktop" />
          </h2>
          <div>
            <span className="studio-icon-disc">
              <StudioIcon name="desktop" />
            </span>
            <span className="studio-icon-disc neutral">
              <StudioIcon name="mobile" />
            </span>
            <h3>Open editor &amp; preview</h3>
            <p>See how your changes look on desktop and mobile.</p>
          </div>
          <button onClick={() => open("story")}>
            Open editor &amp; preview
            <StudioIcon name="external" />
          </button>
        </article>
      </div>
      <p className="studio-last-saved">
        <StudioIcon name="revisions" />
        Last saved:{" "}
        {savedAt
          ? print(savedAt, "date") + ", " + print(savedAt, "time") + " UTC"
          : "Initial snapshot"}
      </p>
    </section>
  );
}
