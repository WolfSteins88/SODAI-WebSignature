import type { VillaContent, VillaImage } from "@/lib/schemas/content";
import { Photo } from "../standard/photo";
import { MotionLink as Link } from "./motion";

type CultureEntry = NonNullable<VillaContent["culture"]>["entries"][number];
export function CultureHero({ image, title, detail = false }: { image: VillaImage; title: string; detail?: boolean }) {
  return <section className={`sg-hero sg-rooms-hero sg-culture-hero ${detail ? "sg-culture-detail-hero" : ""}`}>
    <Photo image={image} mainPhoto hero sizes="100vw" /><div className="sg-hero-shade" /><h1>{title}</h1>
  </section>;
}
export function CultureIndex({ content, prefix }: { content: VillaContent; prefix: string }) {
  const culture = content.culture!;
  return <div className="sg-bungalows sg-culture-index">
    <section className="sg-bungalow-introduction" aria-labelledby="culture-intro-title">
      <h2 id="culture-intro-title">{culture.introTitle}</h2>
      <div className="sg-bungalow-intro-images">
        <div className="sg-bungalow-small"><div className="sg-room-photo"><Photo image={culture.introImages[0]} sizes="(max-width: 900px) 70vw, 16vw" /></div><p>{culture.intro[0]}</p></div>
        {culture.introImages[1] && <div className="sg-bungalow-large"><div className="sg-room-photo"><Photo mainPhoto image={culture.introImages[1]} sizes="(max-width: 900px) 82vw, 29vw" /></div><p>{culture.intro.slice(1).join("\n\n")}</p></div>}
      </div>
    </section>
    <section className="sg-bungalow-list" aria-label="Cultural stories">
      <div className="sg-bungalow-ornament" aria-hidden="true"><Photo image={{src:"/reference-rooms/listing-ornament.svg",alt:"Coral ornament",category:"Nature"}} sizes="31vw" /></div>
      <ol>{culture.entries.filter(entry=>entry.enabled).map(entry=><li key={entry.id} data-culture-id={entry.id}>
        <Link href={`${prefix}/culture/${entry.slug}`} className="sg-bungalow-cover" aria-label={`Discover ${entry.title}`}><Photo mainPhoto image={entry.image} sizes="(max-width: 900px) 82vw, 38vw" /></Link>
        <div className="sg-bungalow-card-copy"><h2><Link href={`${prefix}/culture/${entry.slug}`}>{entry.title}</Link></h2><p>{entry.summary}</p><Link className="sg-bungalow-discover" href={`${prefix}/culture/${entry.slug}`}>Discover More</Link></div>
      </li>)}</ol>
    </section>
  </div>;
}
function Editorial({ entry }: { entry: CultureEntry }) {
  const sections = entry.signature?.sections.filter(section=>section.enabled);
  if (!sections) return <section className="sg-culture-legacy"><h2>{entry.heading}</h2>{entry.body.map((body,i)=><p key={i}>{body}</p>)}{entry.detailImage && <Photo image={entry.detailImage} />}</section>;
  return sections.map(section=><section key={section.id} data-culture-section={section.id} className={`sg-culture-panel sg-culture-${section.layout}`}>
    <div className="sg-culture-panel-photo"><Photo mainPhoto image={section.image} sizes="(max-width: 900px) 90vw, 100vh" />
      {section.layout === "redOverlay" && <div className="sg-culture-coral" aria-hidden="true"><Photo image={{src:"/reference-culture/coral-emblem.svg",alt:"Coral motif",category:"Nature"}} sizes="22vh" /></div>}
    </div>
    <div className="sg-culture-panel-copy"><h2>{section.heading}</h2><div className="sg-culture-panel-body" tabIndex={0} aria-label={`${entry.title}: supporting text`}>{section.body.map((body,i)=><p key={i}>{body}</p>)}</div></div>
  </section>);
}
export function CultureDetail({ content, slug }: { content: VillaContent; slug: string; prefix: string }) {
  const entry = content.culture!.entries.find(item=>item.enabled&&item.slug===slug)!;
  return <Editorial entry={entry} />;
}
