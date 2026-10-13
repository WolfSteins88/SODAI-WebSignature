import {visibleContent} from "@/lib/content/visibility";
import {culinaryTitle} from "@/lib/content/signature-labels";
import {HomepageIntro} from "./home-intro";
import {SignatureGalleryPage} from "./gallery";
import "./gallery.css";
import {Terms} from "./terms";
import "./terms.css";
import { Location } from "./location";
import "./location.css";
import { Packages } from "./packages";
import "./packages.css";
import { Foundation } from "./foundation";
import "./foundation.css";
import { MotionLink as Link } from "./motion";
import { SignatureStory } from "./story";
import { StoryPanels } from "./story-panels";
import { CultureHero, CultureIndex, CultureDetail } from "./culture";
import { Dining, DiningHero, RestaurantMenus } from "./dining";
import { CultureEntrance } from "./culture-entrance";
import { NextScene } from "./next-scene";
import { RoomStrip } from "./room-strip";
import { RoomsHero, RoomsListing, RoomDetail } from "./rooms";
import { notFound } from "next/navigation";
import type { VillaContent, VillaImage } from "@/lib/schemas/content";
import {
  standardPage,
  enabledModules,
  publicPaths,
} from "@/lib/content/public-routes";
import { Photo } from "../standard/photo";
import { Gallery } from "../standard/gallery";
import { Booking } from "../public/booking";
import { SignatureNavigation } from "./navigation";
import "../standard/standard.css";
import "./signature.css";
import "./story-reference.css";
import "./rooms.css";
import "./culture-reference.css";
import "./dining.css";
import "./menu-fidelity.css";

function Hero({
  image,
  title,
  home = false,
  monochrome = false,
}: {
  image: VillaImage;
  title: string;
  home?: boolean;
  monochrome?: boolean;
}) {
  return (
    <section
      className={`sg-hero ${home ? "sg-story-opener" : ""} ${monochrome ? "sg-hero-monochrome" : ""}`}
    >
      <Photo
        image={image}
        mainPhoto
        hero
        sizes="(max-width: 900px) 180vh, 100vw"
      />
      <div className="sg-hero-shade" />
      <h1>{title}</h1>
      <a
        className="sg-continue"
        href={home ? "#signature-story" : "#signature-content"}
      >
        {home ? "Read our story" : "Discover more"}
        <span aria-hidden="true">↓</span>
      </a>
    </section>
  );
}
function Entries({
  items,
  kind,
  prefix,
}: {
  items: VillaContent["experiences"];
  kind: string;
  prefix: string;
}) {
  return (
    <div className="sg-cards">
      {items.map((item) => (
        <article key={item.slug}>
          <Link
            href={`${prefix}/${kind}/${item.slug}`}
            aria-label={`Discover ${item.title}`}
          >
            <Photo mainPhoto image={item.image} sizes="(max-width: 900px) 100vw, 40vw" />
          </Link>
          <div className="sg-card-title">
            <h2>
              <Link href={`${prefix}/${kind}/${item.slug}`}>{item.title}</Link>
            </h2>
            <Link className="sg-label" href={`${prefix}/${kind}/${item.slug}`}>
              Discover more ↗
            </Link>
          </div>
          <p>{item.description}</p>
        </article>
      ))}
    </div>
  );
}
export function SignatureTemplate({
  content: sourceContent,
  path,
  preview = false,
}: {
  content: VillaContent;
  path: string[];
  preview?: boolean;
}) {
  const c=visibleContent(sourceContent);
  if (!publicPaths(c, "signature").includes("/" + path.join("/"))) notFound();
  const page = standardPage(c, path, "signature");
  if (!page) notFound();
  const { kind, item, room } = page,
    prefix = preview ? "/preview" : "",
    modules = enabledModules(c,"signature");
  if(kind === "gallery")return <SignatureGalleryPage content={c} prefix={prefix} preview={preview}/>;
  if(kind === "terms" && c.signatureTerms) return <Terms content={c} prefix={prefix} preview={preview}/>;
  if(kind === "location" && c.signatureLocation) return <Location content={c} prefix={prefix} preview={preview} referenceComparison={process.env.CONTEXT==="local" && process.env.SIGNATURE_REFERENCE_COMPARISON==="1"}/>;
  if(kind === "packages" && c.signaturePackages) return <Packages content={c} slug={path[1]} prefix={prefix} preview={preview}/>;
  if(kind === "foundation") return <Foundation content={c} prefix={prefix} preview={preview}/>;
  if(kind === "restaurant-menu") return <RestaurantMenus content={c} prefix={prefix} preview={preview}/>;
  const collection =
    kind === "rooms" || kind === "experiences" || kind === "packages"
      ? c[kind]
      : [];
  const cultureEntries = c.culture?.entries.filter((entry) => entry.enabled) || [];
  const currentCultureEntry = kind === "culture" ? cultureEntries.find(entry=>entry.slug===path[1]) : undefined;
  const nextCultureEntry = currentCultureEntry?.signature
    ? cultureEntries.find(entry=>entry.slug===currentCultureEntry.signature!.nextSlug)
    : kind === "culture" ? cultureEntries[cultureEntries.findIndex((entry) => entry.slug === path[1]) + 1] : undefined;
  let nextChoice =
    kind === "home"
      ? { title: c.signatureRooms?.title || c.signatureStory?.nextPageTitle || "The villas", href: "/rooms", image: c.signatureRooms?.hero || c.rooms[0]?.image || c.hero }
      : kind === "rooms" && modules.dining
        ? { title: culinaryTitle(c.dining.title), href: "/dining", image: c.dining.image }
        : kind === "dining" && modules.culture
          ? { title: c.culture!.title, href: "/cultures", image: c.culture!.hero }
        : kind === "dining" && modules.experiences
          ? { title: "Experiences", href: "/experiences", image: c.hero }
          : kind === "culture" && nextCultureEntry
            ? { title: nextCultureEntry.title, href: `/culture/${nextCultureEntry.slug}`, image: nextCultureEntry.image }
          : kind === "cultures" || kind === "culture"
            ? { title: "Gallery", href: "/gallery", image: c.gallery[0] || c.hero }
          : kind === "gallery"
            ? { title: "Find us", href: "/location", image: c.hero }
            : {
                title: "Gallery",
                href: "/gallery",
                image: c.gallery[0] || c.hero,
              };
  if(!publicPaths(c,"signature").includes(nextChoice.href))nextChoice=publicPaths(c,"signature").includes('/location')?{title:'Getting Here',href:'/location',image:c.signatureLocation?.hero||c.hero}:{title:c.storyTitle,href:'/',image:c.hero};
  const destination = standardPage(
    c,
    nextChoice.href.split("/").filter(Boolean),
    "signature",
  )!;
  const next = {
    ...nextChoice,
    title: c.navigation?.find(n=>n.route===nextChoice.href&&n.visible)?.label || c.pages?.find(p=>p.route===nextChoice.href)?.title || nextChoice.title,
    image: nextChoice.href === "/rooms" ? c.signatureRooms?.hero || c.rooms[0]?.image || c.hero : destination.image,
  };
  const nextScene = (
    <NextScene
      {...next}
      href={prefix + next.href}
      monochrome={next.href === "/rooms" || next.href.startsWith("/culture/")}
      horizontal={kind === "home" || kind === "culture"}
      culture={kind === "culture"}
      preview={preview}
    />
  );
  return (
    <>
    {kind === "home" && !preview && <HomepageIntro logo={c.signatureMenu?.logo} brand={c.signatureMenu?.introBrand} emblem={c.signatureStory?.railEmblem} name={c.name}/>}
    <div
      className={`sg-site ${c.signatureStory ? "sg-reference-site" : ""}`}
      data-signature-transition="hero" data-signature-background="#f1ecde" data-signature-route={prefix + "/" + path.join("/")}
    >
      <SignatureNavigation content={c} prefix={prefix} room={item?.title} />
      {preview && (
        <div className="sg-preview">
          Private draft preview · unpublished content
        </div>
      )}
      <main id="signature-main">
        {kind === "home" ? (
          <>
            <SignatureStory>
              {c.signatureStory ? <StoryPanels content={c} /> : <Hero image={c.hero} title={c.heroTitle} home />}
              {nextScene}
            </SignatureStory>
          </>
        ) : kind === "culture" ? <CultureEntrance><SignatureStory>
          <CultureHero image={page.image} title={page.title} detail />
          <CultureDetail content={c} slug={path[1]} prefix={prefix} />
          {nextScene}
        </SignatureStory></CultureEntrance> : kind === "cultures" ? <CultureHero image={page.image} title={page.title} /> : kind === "dining" ? <DiningHero content={c}/> : kind === "rooms" ? <RoomsHero content={c} room={room} /> : (
          <Hero
            image={kind === "rooms" && !item ? c.rooms[0]?.image || c.hero : page.image}
            title={
              item?.title ||
              (
                {
                  rooms: c.signatureStory?.nextPageTitle || "The villas",
                  gallery: "Gallery",
                  location: "Find us",
                  experiences: "Experiences",
                  cultures: c.culture?.title || "Culture Bali",
                  packages: "Packages",
                } as Record<string, string>
              )[kind] ||
              page.title
            }
            monochrome={kind === "rooms" && !item}
          />
        )}
        <div id="signature-content">
          {kind === "rooms" && (room ? <RoomDetail content={c} room={room} prefix={prefix} /> : <RoomsListing content={c} prefix={prefix} />)}
          {kind === "cultures" && <CultureIndex content={c} prefix={prefix} />}
          {kind !== "rooms" && collection.length > 0 && !item && (
            <section className="sg-section">
              <div className="sg-list-intro">
                <p>{c.intro}</p>
                <h2>{kind === "rooms" ? c.storyTitle : page.title}</h2>
              </div>
              <Entries items={collection} kind={kind} prefix={prefix} />
            </section>
          )}
          {kind !== "rooms" && item && (
            <>
              <section className="sg-section sg-detail-intro">
                <div>
                  <p className="sg-label">
                    {kind === "rooms" ? "The villas" : kind}
                  </p>
                  <h2>{item.title}</h2>
                  {room && (
                    <p className="sg-facts">
                      {room.capacity} guests <span>·</span> {room.area} m²
                    </p>
                  )}
                  <p>{item.description}</p>
                  <Booking content={c} room={item.title} />
                </div>
                <Photo
                  image={item.image}
                  sizes="(max-width: 900px) 85vw, 44vw"
                />
              </section>
              {room && (
                <section className="sg-section sg-facilities">
                  <div>
                    <h2>Included in your stay</h2>
                    <ul>
                      {room.inclusions.map((value, index) => (
                        <li key={index}>{value}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h2>In your villa</h2>
                    <ul>
                      {room.facilities.map((value, index) => (
                        <li key={index}>{value}</li>
                      ))}
                    </ul>
                  </div>
                </section>
              )}
              <div className="sg-detail-wide">
                <Photo mainPhoto image={item.image} sizes="100vw" />
              </div>
              {collection.length > 1 && (
                <RoomStrip
                  items={collection.filter((entry) => entry.slug !== item.slug)}
                  kind={kind}
                  prefix={prefix}
                />
              )}
            </>
          )}
          {kind === "dining" && <Dining content={c} prefix={prefix}/>}
          {kind === "gallery" && (
            <section className="sg-section sg-gallery">
              <Gallery images={c.gallery} />
            </section>
          )}
          {kind === "location" && (
            <section className="sg-section sg-detail-intro">
              <div>
                <p className="sg-label">Find us</p>
                <h2>{c.name}</h2>
                <p>{c.address}</p>
                <a
                  className="sg-text-link"
                  href={c.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open map & directions ↗
                </a>
                <a className="sg-email" href={`mailto:${c.email}`}>
                  {c.email}
                </a>
                <Booking content={c} />
              </div>
              <Photo
                image={
                  c.gallery.find((image) => image.category === "Nature") ||
                  c.hero
                }
                sizes="(max-width: 900px) 85vw, 44vw"
              />
            </section>
          )}
          {kind === "terms" && (
            <section className="sg-section sg-terms">
              <h2>Before your stay</h2>
              {c.terms.split("\n\n").map((text, index) => (
                <p key={index}>{text}</p>
              ))}
            </section>
          )}
        </div>
        {kind !== "terms" && kind !== "home" && kind !== "culture" && !(kind === "rooms" && room) && nextScene}
      </main>
      <footer className="sg-footer">
        <Link className="sg-wordmark" href={prefix + "/"}>
          {c.name}
        </Link>
        <div>
          <p>
            {c.tagline}
            <br />
            {c.address}
          </p>
          <a href={`mailto:${c.email}`}>{c.email}</a>
        </div>
        <nav aria-label="Footer navigation">
          <Link href={prefix + "/rooms"}>{c.navigation?.find(n=>n.route==="/rooms")?.label||c.publicCopy?.roomsTitle||"The villas"}</Link>
          <Link href={prefix + "/location"}>{c.navigation?.find(n=>n.route==="/location")?.label||c.publicCopy?.locationTitle||"Find us"}</Link>
          {modules.terms && <Link href={prefix + "/terms"}>{c.navigation?.find(n=>n.route==="/terms")?.label||c.publicCopy?.termsTitle||"Terms"}</Link>}
          {c.showAdminLink && <Link href="/admin/login">Admin</Link>}
        </nav>
        <small>
          © {new Date().getFullYear()} {c.name}
        </small>
      </footer>
    </div>
    </>
  );
}
