import {publicCopy} from "@/lib/content/public-copy";
import {visibleContent} from "@/lib/content/visibility";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { VillaContent } from "@/lib/schemas/content";
import { enabledModules, standardPage,publicPaths } from "@/lib/content/public-routes";
import { bookingLinks } from "@/lib/schemas/content";
import { Booking } from "../public/booking";
import { Photo } from "./photo";
import { Navigation } from "./navigation";
import { ImageAccordion } from "./accordion";
import { Carousel } from "./carousel";
import { Gallery } from "./gallery";
import "./standard.css";
function Paragraphs({ text }: { text: string }) {
  return text
    .split(/\n\s*\n/)
    .map((paragraph, index) => <p key={index}>{paragraph}</p>);
}
function Cards({
  content,
  kind,
  prefix,
  limit,
}: {
  content: VillaContent;
  kind: "rooms" | "experiences" | "packages";
  prefix: string;
  limit?: number;
}) {
  return (
    <div className="std-cards">
      {content[kind].filter(item=>!("enabled" in item)||item.enabled!==false).slice(0, limit).map((item) => (
        <article key={item.slug}>
          <Link
            href={`${prefix}/${kind}/${item.slug}`}
            className="std-card-image"
            aria-label={`Discover ${item.title}`}
          >
            <Photo
              image={item.image}
              sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
            />
          </Link>
          {"capacity" in item && "area" in item && (
            <p className="std-label">
              {String(item.capacity)} guests · {String(item.area)} m²
            </p>
          )}
          <h3>
            <Link href={`${prefix}/${kind}/${item.slug}`}>{item.title}</Link>
          </h3>
          <p>{item.description}</p>
          <Link
            className="std-text-link"
            href={`${prefix}/${kind}/${item.slug}`}
          >
            Discover {item.title} <span aria-hidden="true">↗</span>
          </Link>
        </article>
      ))}
    </div>
  );
}
export function StandardTemplate(props: {
  content: VillaContent;
  path: string[];
  preview?: boolean;
}) {
  const {path,preview=false}=props;
  const c=visibleContent(props.content);
  const page = standardPage(c, path);
  if (!page) notFound();
  const paths=publicPaths(c);
  const prefix = preview ? "/preview" : "";
  const modules = enabledModules(c),
    links = bookingLinks(c, page.item?.title);
  const sectionHeading = (
    label: string,
    title: string,
    href?: string,
    linkLabel?: string,
  ) => (
    <div className="std-section-heading">
      <div>
        <span className="std-label">{label}</span>
        <h2>{title}</h2>
      </div>
      {href && (
        <Link className="std-text-link" href={prefix + href}>
          {linkLabel} <span aria-hidden="true">↗</span>
        </Link>
      )}
    </div>
  );
  return (
    <div className="std-site">
      {preview && (
        <aside className="std-preview">
          Private draft preview · <Link href="/admin">Return to dashboard</Link>
        </aside>
      )}
      <Navigation content={c} prefix={prefix} />
      <main id="main" tabIndex={-1}>
        <section
          className={`std-hero ${page.kind === "home" ? "std-home-hero" : "std-inner-hero"}`}
        >
          <Photo image={page.image} hero sizes="100vw" />
          <div className="std-hero-shade" />
          <div className="std-hero-copy">
            <span className="std-label">{c.tagline}</span>
            <h1>{page.title}</h1>
            {page.kind === "home" && (
              <>
                <p>{c.intro}</p>
                <Booking content={c} />
                <a className="std-hero-explore" href="#introduction">
                  Explore {c.name} <span aria-hidden="true">↓</span>
                </a>
              </>
            )}
            {page.room && (
              <p>
                {page.room.capacity} guests · {page.room.area} m²
              </p>
            )}
          </div>
        </section>
        {page.kind === "home" && (
          <>
            <section className="std-section std-introduction" id="introduction">
              <div>
                <span className="std-label">Welcome to {c.name}</span>
                <h2>{c.storyTitle}</h2>
              </div>
              <div>
                <p>{c.intro}</p>
                <Link className="std-text-link" href={prefix + "/story"}>
                  {publicCopy(c,"storyLink")} <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </section>
            {paths.includes('/rooms')&&c.rooms.length>0&&<section className="std-section std-soft">
              {sectionHeading(
                publicCopy(c,"roomsLabel"),
                publicCopy(c,"roomsHeading"),
                "/rooms",
                publicCopy(c,"roomsLink"),
              )}
              <Cards content={c} kind="rooms" prefix={prefix} limit={3} />
            </section>}
            {c.amenities.length > 0 && (
              <section className="std-section std-amenities">
                {sectionHeading(
                  publicCopy(c,"amenitiesLabel"),
                  publicCopy(c,"amenitiesHeading"),
                )}
                <ul>
                  {c.amenities.map((amenity, index) => (
                    <li key={index}>
                      <span aria-hidden="true">✳</span>
                      {amenity}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {c.gallery.length > 0 && paths.includes('/gallery') && (
              <section className="std-section">
                {sectionHeading(
                  publicCopy(c,"galleryLabel"),
                  publicCopy(c,"galleryHeading"),
                  "/gallery",
                  publicCopy(c,"galleryLink"),
                )}
                <ImageAccordion
                  label="Gallery preview"
                  items={c.gallery.slice(0, 5).map((image) => ({
                    title: image.alt,
                    image,
                    href: prefix + "/gallery",
                  }))}
                />
              </section>
            )}
            {modules.dining && (
              <section className="std-section std-split std-soft">
                <Photo image={c.dining.image} />
                <div>
                  <span className="std-label">{publicCopy(c,"diningLabel")}</span>
                  <h2>{c.dining.title}</h2>
                  <p>{c.dining.description}</p>
                  <Link className="std-text-link" href={prefix + "/dining"}>
                    {publicCopy(c,"diningLink")} <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </section>
            )}
            {modules.experiences && (
              <section className="std-section">
                {sectionHeading(
                  publicCopy(c,"experiencesLabel"),
                  publicCopy(c,"experiencesHeading"),
                  "/experiences",
                  publicCopy(c,"experiencesLink"),
                )}
                <Cards
                  content={c}
                  kind="experiences"
                  prefix={prefix}
                  limit={3}
                />
              </section>
            )}
            {modules.packages && (
              <section className="std-section std-soft">
                {sectionHeading(
                  publicCopy(c,"packagesLabel"),
                  publicCopy(c,"packagesHeading"),
                  "/packages",
                  publicCopy(c,"packagesLink"),
                )}
                <Cards content={c} kind="packages" prefix={prefix} limit={3} />
              </section>
            )}
            {paths.includes('/location')&&<section className="std-section std-location">
              <div>
                <span className="std-label">{publicCopy(c,"locationLabel")}</span>
                <h2>{c.address}</h2>
                <Link className="std-text-link" href={prefix + "/location"}>
                  {publicCopy(c,"locationLink")} <span aria-hidden="true">↗</span>
                </Link>
              </div>
              <Photo
                image={
                  c.gallery.find((image) => image.category === "Nature") ||
                  c.hero
                }
              />
            </section>}
          </>
        )}
        {page.kind === "story" && (
          <section className="std-section std-split" id="introduction">
            <Photo image={c.gallery[0] || c.hero} />
            <div>
              <span className="std-label">The {c.name} story</span>
              <h2>{c.storyTitle}</h2>
              <Paragraphs text={c.story} />
            </div>
          </section>
        )}
        {["rooms", "experiences", "packages"].includes(page.kind) &&
          !page.item && (
            <section className="std-section" id="introduction">
              <p className="std-lead">{c.intro}</p>
              {page.kind === "rooms" && (
                <ImageAccordion
                  label="Room preview"
                  items={c.rooms.slice(0, 5).map((room) => ({
                    title: room.title,
                    image: room.image,
                    href: `${prefix}/rooms/${room.slug}`,
                  }))}
                />
              )}
              <Cards
                content={c}
                kind={page.kind as "rooms" | "experiences" | "packages"}
                prefix={prefix}
              />
            </section>
          )}
        {page.item && (
          <>
            <section className="std-section std-detail" id="introduction">
              <div>
                <span className="std-label">{c.name}</span>
                <h2>{page.item.title}</h2>
                {page.room && (
                  <p className="std-label">
                    {page.room.capacity} guests · {page.room.area} m²
                  </p>
                )}
              </div>
              <div>
                <Paragraphs text={page.item.description} />
                <Booking content={c} room={page.item.title} />
              </div>
            </section>
            {page.room && (
              <section className="std-section std-facilities std-soft">
                {page.room.facilities.length > 0 && (
                  <div>
                    <h2>{publicCopy(c,"roomFacilities")}</h2>
                    <ul>
                      {page.room.facilities.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {page.room.inclusions.length > 0 && (
                  <div>
                    <h2>{publicCopy(c,"roomInclusions")}</h2>
                    <ul>
                      {page.room.inclusions.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}
            <section className="std-section">
              <Photo
                className="std-wide"
                image={page.item.image}
                sizes="100vw"
              />
              <Link className="std-text-link" href={`${prefix}/${page.kind}`}>
                Back to all {page.kind} <span aria-hidden="true">↗</span>
              </Link>
            </section>
          </>
        )}
        {page.kind === "gallery" && (
          <>
            <section className="std-section" id="introduction">
              <Gallery images={c.gallery} />
            </section>
            {c.gallery.length > 0 && paths.includes('/gallery') && (
              <section className="std-section std-soft">
                {sectionHeading(publicCopy(c,"perspectiveLabel"), publicCopy(c,"perspectiveHeading"))}
                <Carousel images={c.gallery.slice(0, 8)} />
              </section>
            )}
          </>
        )}
        {page.kind === "location" && (
          <section className="std-section std-split" id="introduction">
            <Photo
              image={
                c.gallery.find((image) => image.category === "Nature") || c.hero
              }
            />
            <div>
              <span className="std-label">Getting here</span>
              <h2>{c.name}</h2>
              <address>{c.address}</address>
              <a
                className="std-text-link"
                href={c.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open directions <span aria-hidden="true">↗</span>
              </a>
              <a className="std-text-link" href={`mailto:${c.email}`}>
                {c.email}
              </a>
            </div>
          </section>
        )}
        {page.kind === "dining" && (
          <section className="std-section std-split" id="introduction">
            <Photo image={c.dining.image} />
            <div>
              <h2>{c.dining.title}</h2>
              <Paragraphs text={c.dining.description} />

            </div>
          </section>
        )}
        {page.kind === "terms" && (
          <section className="std-section std-prose" id="introduction">
            <h2>{publicCopy(c,"stayInformation")}</h2>
            <Paragraphs text={c.terms} />
          </section>
        )}
        {links.whatsapp && (
          <section className="std-section std-stay" id="reservation">
            <span className="std-label">Your next chapter</span>
            <h2>Stay with {c.name}.</h2>
            <p>{c.tagline}</p>
            <Booking content={c} room={page.item?.title} />
          </section>
        )}
      </main>
      <footer className="std-footer">
        <div className="std-footer-main">
          <Link className="std-brand" href={prefix + "/"}>
            {c.name}
            <span>{c.tagline}</span>
          </Link>
          <address>
            {c.address}
            <a href={`mailto:${c.email}`}>{c.email}</a>
          </address>
          <nav aria-label="Footer navigation">
            <Link href={prefix + "/story"}>{publicCopy(c,"storyLink")}</Link>
            <Link href={prefix + "/rooms"}>Rooms</Link>
            <Link href={prefix + "/gallery"}>Gallery</Link>
            <Link href={prefix + "/location"}>Location</Link>
            {modules.terms && <Link href={prefix + "/terms"}>Terms</Link>}
            {c.showAdminLink && <Link href="/admin/login">Admin</Link>}
          </nav>
        </div>
        <div className="std-footer-bottom">
          © {new Date().getFullYear()} {c.name}
        </div>
      </footer>
    </div>
  );
}
