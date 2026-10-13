import type { CSSProperties } from "react";
import type { VillaContent, VillaImage } from "@/lib/schemas/content";
import { Photo } from "../standard/photo";

type Section = NonNullable<VillaContent["signatureStory"]>["sections"][number];

function Image({ image, className = "", hero = false, main = false }: { image: VillaImage; className?: string; hero?: boolean; main?: boolean }) {
  return <Photo mainPhoto={main} image={image} className={`sg-ref-image ${className}`} sizes={hero ? "(max-width: 900px) 180vh, 100vw" : "(max-width: 900px) 100vw, 65vw"} hero={hero} />;
}

function Paragraphs({ items, className = "" }: { items: string[]; className?: string }) {
  return <div className={`sg-ref-paragraphs ${className}`} tabIndex={items.join(" ").length > 700 ? 0 : undefined}>
    {items.map((item, index) => <p key={index}>{item}</p>)}
  </div>;
}

function StorySection({ section, emblem }: { section: Section; emblem?: VillaImage }) {
  const marker = { id: `story-${section.id}`, "data-panel-id": section.id };
  switch (section.layout) {
    case "opener":
      return <section {...marker} lang="en" className="sg-ref-section sg-ref-opener">
        <Image main image={section.image} hero />
        <span className="sg-ref-hero-shade" aria-hidden="true" />
        <h1>{section.title}</h1>
      </section>;
    case "intro":
      return <section {...marker} className="sg-ref-section sg-ref-intro">
        <Image image={section.logo} className="sg-ref-logo" />
        <p className="sg-ref-eyebrow">{section.eyebrow}</p>
        <h2>{section.date}</h2>
        <span className="sg-ref-ornament" aria-hidden="true"><i /></span>
        <p className="sg-ref-intro-body" tabIndex={section.body.length > 700 ? 0 : undefined}>{section.body}</p>
      </section>;
    case "timeline":
      return <section {...marker} className="sg-ref-section sg-ref-timeline" style={{ "--sg-timeline-width": 1240 + 407 * section.entries.length, "--sg-timeline-list-width": 104 + 407 * section.entries.length } as CSSProperties}>
        <Image main image={section.leadImage} className="sg-ref-timeline-lead" />
        <div className="sg-ref-timeline-list">
          <span className="sg-ref-timeline-rule" aria-hidden="true" />
          {section.entries.map((entry, index) => <article key={entry.id} className={`sg-ref-timeline-entry ${index % 2 ? "sg-ref-timeline-down" : "sg-ref-timeline-up"}`} data-entry-id={entry.id}>
            <div className="sg-ref-timeline-mat"><Image main image={entry.image} /></div>
            <span className="sg-ref-timeline-marker" aria-hidden="true" />
            <p tabIndex={entry.body.length > 700 ? 0 : undefined}>{entry.body}</p>
          </article>)}
        </div>
        <Image main image={section.finalImage} className="sg-ref-timeline-final" />
      </section>;
    case "founding":
      return <section {...marker} className="sg-ref-section sg-ref-founding">
        <div className="sg-ref-founding-first"><h2>{section.heading}</h2><span className="sg-ref-rule" /><Paragraphs items={section.body} /></div>
        <Image main image={section.image} className="sg-ref-founding-photo" />
        <div className="sg-ref-founding-last"><h2>{section.rightHeading}</h2><Image image={section.insetImage} className="sg-ref-inset" /><p>{section.rightCaption}</p></div>
      </section>;
    case "redEditorial":
      return <section {...marker} className={`sg-ref-section sg-ref-red sg-ref-red-${section.alignment}`}>
        <Image main image={section.image} className="sg-ref-red-photo" />
        <span className="sg-ref-sunburst" aria-hidden="true">{emblem && <Image image={emblem} />}</span>
        <div className="sg-ref-red-copy"><h2>{section.heading}</h2><span className="sg-ref-rule" /><Paragraphs items={section.body} /></div>
      </section>;
    case "architecture":
      return <section {...marker} className="sg-ref-section sg-ref-architecture">
        <Image main image={section.image} className="sg-ref-architecture-photo" />
        <div className="sg-ref-architecture-title"><h2>{section.heading}</h2><p>{section.caption}</p></div>
        <Paragraphs items={section.body} className="sg-ref-architecture-body" />
      </section>;
    case "laterHistory":
      return <section {...marker} className="sg-ref-section sg-ref-later">
        {section.decoration && <span className="sg-ref-later-decoration" aria-hidden="true"><Image image={section.decoration} /></span>}
        <Image main image={section.image} className="sg-ref-later-main" />
        <h2 className="sg-ref-later-heading">{section.heading}</h2>
        <p className="sg-ref-later-note">{section.note}</p>
        <Image image={section.detailImage} className="sg-ref-later-detail" />
        <h2 className="sg-ref-later-book">{section.bookHeading}</h2>
        <Paragraphs items={section.body} className="sg-ref-later-body" />
      </section>;
    case "bookClosing":
      return <section {...marker} className="sg-ref-section sg-ref-book">
        <Image main image={section.image} className="sg-ref-book-photo" />
        <Paragraphs items={section.body} className="sg-ref-book-body" />
        <h2>{section.heading}</h2>
      </section>;
    case "video": return null; // Playback belongs to a later phase; no poster or geometry in M4.
    case "still":
      return <section {...marker} className="sg-ref-section sg-ref-still"><Image main image={section.image} /></section>;
  }
}

export function StoryPanels({ content }: { content: VillaContent }) {
  return content.signatureStory?.sections.filter((section) => section.enabled && section.layout !== "video").map((section) => <StorySection key={section.id} section={section} emblem={content.signatureStory?.railEmblem} />) || null;
}
