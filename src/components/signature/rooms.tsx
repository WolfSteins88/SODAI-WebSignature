import {publicCopy} from "@/lib/content/public-copy";
import type { VillaContent } from "@/lib/schemas/content";
import { bookingLinks } from "@/lib/schemas/content";
import { Photo } from "../standard/photo";
import { MotionLink } from "./motion";
import {RoomGallery} from "./room-gallery";
import {roomPhotoGrid} from "@/lib/content/room-photo-grid";
import { RoomPhotographs, OtherBungalows } from "./rooms-interactive";

type Room = VillaContent["rooms"][number];
export function RoomsHero({ content, room }: { content: VillaContent; room?: Room }) {
  return <section className="sg-hero sg-rooms-hero">
    <Photo image={room?.signature?.hero || room?.image || content.signatureRooms?.hero || content.rooms[0]?.image || content.hero} mainPhoto hero sizes="100vw" />
    <div className="sg-hero-shade" />
    <h1>{room?.title || content.signatureRooms?.title || "Our Rooms"}</h1>
  </section>;
}

export function RoomsListing({ content, prefix }: { content: VillaContent; prefix: string }) {
  const page = content.signatureRooms;
  return <div className="sg-bungalows">
    <section className="sg-bungalow-introduction">
      <h2>{page?.heading || content.storyTitle}</h2>
      {page ? <div className="sg-bungalow-intro-images">
        <div className="sg-bungalow-small"><div className="sg-room-photo"><Photo image={page.smallImage} sizes="(max-width: 900px) 88vw, 42vw" /></div><p>{page.smallCopy}</p></div>
        <div className="sg-bungalow-large"><div className="sg-room-photo"><Photo mainPhoto image={page.largeImage} sizes="(max-width: 900px) 88vw, 42vw" /></div><p>{page.largeCopy}</p></div>
      </div> : <p>{content.intro}</p>}
    </section>
    <section className="sg-bungalow-list" aria-label="Bungalows">
      {page?.ornament && <div className="sg-bungalow-ornament" aria-hidden="true"><Photo image={page.ornament} sizes="32vw" /></div>}
      <ol>{content.rooms.map(room => <li key={room.slug} data-room-slug={room.slug}>
        <MotionLink className="sg-bungalow-cover" href={`${prefix}/rooms/${room.slug}`} aria-label={`Discover ${room.title}`}><Photo mainPhoto image={room.image} sizes="(max-width: 900px) 85vw, 38vw" /></MotionLink>
        <div className="sg-bungalow-card-copy">
          <h2><MotionLink href={`${prefix}/rooms/${room.slug}`}>{room.title}</MotionLink></h2>
          <p>{room.description}</p>
          <MotionLink className="sg-bungalow-discover" href={`${prefix}/rooms/${room.slug}`}>{publicCopy(content,"discoverMore")}</MotionLink>
        </div>
      </li>)}</ol>
    </section>
  </div>;
}

function Facilities({ title, values }: { title: string; values: string[] }) {
  if (!values.length) return null;
  return <section className="sg-room-facilities-row"><h2>{title}</h2><ul>{values.map((value, index) => <li key={`${index}-${value}`}>{value}</li>)}</ul></section>;
}

export function RoomDetail({ content, room, prefix }: { content: VillaContent; room: Room; prefix: string }) {
  const details = room.signature, showcase = details?.showcase;
  const links = bookingLinks(content, room.title), booking = links.whatsapp;
  return <article className="sg-bungalow-detail">
    <section className="sg-room-editorial">
      <div className="sg-room-facts"><div className="sg-room-fact-line" /><p><span><svg aria-hidden="true" viewBox="0 0 16 16"><circle cx="8" cy="4" r="2.2" /><path d="M3 13v-1.5a5 5 0 0 1 10 0V13ZM8 6.2V13" /></svg> {room.capacity} Adults</span><span><svg aria-hidden="true" viewBox="0 0 16 16"><path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4M4 12l8-8M8 4h4v4" /></svg> {room.area} m²</span></p></div>
      <div className="sg-room-editorial-copy"><h2>{details?.heading || room.description}</h2><div className="sg-room-copy-columns">{(details?.body || [room.description]).map((text, index) => <p key={index}>{text}</p>)}</div></div>
    </section>
    <RoomGallery images={roomPhotoGrid(room)} title={room.title} roomId={room.slug}/>
    {showcase && <section className="sg-room-showcase-caption"><h2>{showcase.heading}</h2><p>{showcase.body}</p></section>}
    <div className="sg-room-services">
      <Facilities title={publicCopy(content,"signatureInclusions")} values={room.inclusions} />
      <Facilities title={publicCopy(content,"signatureFacilities")} values={room.facilities} />
      {booking && <a className="sg-room-book" href={booking} target="_blank" rel="noopener noreferrer">{publicCopy(content,"whatsappLabel")}</a>}
    </div>
    <RoomPhotographs images={details?.gallery || []} title={room.title} />
    <OtherBungalows heading={publicCopy(content,"otherRooms")} items={content.rooms.filter(other => other.slug !== room.slug && (!room.relatedRooms || room.relatedRooms.includes(other.id||"")))} prefix={prefix} />
  </article>;
}
