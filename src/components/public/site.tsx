import Link from "next/link";
import Image from "next/image";
import type { VillaContent, VillaImage } from "@/lib/schemas/content";
import { Header } from "./header";
import { Booking } from "./booking";
import { Gallery } from "./gallery";
import { StoryMotion } from "./story-motion";
import { MobileReserve } from "./mobile-reserve";
import { notFound } from "next/navigation";
import { isDemo, siteUrl } from "@/lib/config";
export function Photo({
  image,
  className = "",
  priority = false,
}: {
  image: VillaImage;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={`photo ${className}`}>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        unoptimized={image.src.startsWith("/api/media/")}
        sizes="(max-width: 700px) 100vw, 80vw"
        preload={priority}
        loading={priority ? "eager" : "lazy"}
      />
    </div>
  );
}
function Hero({
  content,
  title,
  image,
  home = false,
  signature = false,
}: {
  content: VillaContent;
  title: string;
  image: VillaImage;
  home?: boolean;
  signature?: boolean;
}) {
  return (
    <section className={`hero ${home ? "home-hero" : ""}`}>
      <Photo image={image} priority />
      <div className="hero-shade" />
      <div className="hero-copy">
        <span className="eyebrow">
          {home ? "BALI, AT YOUR OWN PACE" : content.tagline}
        </span>
        <h1>{title}</h1>
        {home && !signature ? (
          <p>
            A private world. A slower rhythm.
            <br />A little closer to what matters.
          </p>
        ) : null}
        {home && !signature ? (
          <a className="hero-link" href="#introduction">
            Discover Sodai <span>↘</span>
          </a>
        ) : null}
      </div>
      <span className="hero-coordinate">8°30′ S &nbsp; 115°15′ E · DEMO</span>
      <a className="scroll-cue" href="#introduction">
        {signature ? "Keep scroll" : "Scroll to explore"} <span>↓</span>
      </a>
      <span className="hero-count">
        01 <i /> 03
      </span>
    </section>
  );
}
function NextPage({
  title,
  href,
  image,
  prefix,
}: {
  title: string;
  href: string;
  image: VillaImage;
  prefix: string;
}) {
  return (
    <Link className="next-page" href={prefix + href}>
      <span className="eyebrow">Next chapter</span>
      <Photo image={image} />
      <h2>{title}</h2>
      <span className="text-link">Continue exploring ↗</span>
    </Link>
  );
}
function Cards({
  content,
  kind,
  prefix,
}: {
  content: VillaContent;
  kind: "rooms" | "experiences" | "packages";
  prefix: string;
}) {
  return (
    <div className="editorial-cards">
      {content[kind].map((item, i) => (
        <Link
          className="editorial-card"
          href={`${prefix}/${kind}/${item.slug}`}
          key={item.slug}
        >
          <Photo image={item.image} />
          <div className="card-line">
            <span className="eyebrow">
              0{i + 1}{" "}
              {kind === "rooms"
                ? ` / ${content.rooms[i].capacity} guests · ${content.rooms[i].area} m²`
                : ""}
            </span>
            <span aria-hidden="true">↗</span>
          </div>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <span className="text-link">Discover more</span>
        </Link>
      ))}
    </div>
  );
}
export function VillaSite({
  content,
  variant,
  path = [],
  preview = false,
}: {
  content: VillaContent;
  variant: string;
  path?: string[];
  preview?: boolean;
}) {
  const signature = variant === "signature";
  const prefix = preview ? "/preview" : "";
  const route = path[0] || "";
  const slug = path[1];
  if (path.length > 2) notFound();
  if (
    ["dining", "experiences", "packages", "terms"].includes(route) &&
    !content.modules[route as keyof typeof content.modules]
  )
    notFound();
  const item =
    slug && ["rooms", "experiences", "packages"].includes(route)
      ? content[route as "rooms" | "experiences" | "packages"].find(
          (x) => x.slug === slug,
        )
      : undefined;
  if (slug && !item) notFound();
  if (
    ![
      "",
      "story",
      "rooms",
      "gallery",
      "location",
      "dining",
      "experiences",
      "packages",
      "terms",
    ].includes(route)
  )
    notFound();
  const room =
    route === "rooms" && slug
      ? content.rooms.find((x) => x.slug === slug)
      : undefined;
  const home = !route;
  const title =
    item?.title ||
    {
      rooms: "Space to slow down.",
      story: content.storyTitle,
      gallery: "A glimpse of the good life.",
      location: "Find your way to us.",
      dining: content.dining.title,
      experiences: "Beyond the villa.",
      packages: "A little longer. A little slower.",
      terms: "Terms & conditions",
    }[route] ||
    content.heroTitle;
  const heroImage =
    item?.image ||
    (route === "dining"
      ? content.dining.image
      : route === "experiences"
        ? content.experiences[0]?.image
        : undefined) ||
    content.hero;
  return (
    <div className={`villa-site ${signature ? "signature" : "standard"}`}>
      {preview ? (
        <div className="preview-banner">
          Private draft preview <Link href="/admin">Return to editor ↗</Link>
        </div>
      ) : null}
      <Header content={content} variant={variant} prefix={prefix} />
      <main id="main">
        {!preview && !isDemo ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "LodgingBusiness",
                name: content.name,
                description: content.intro,
                url: siteUrl,
                email: content.email,
                address: content.address,
                image: new URL(content.hero.src, siteUrl).href,
                amenityFeature: content.amenities.map((name) => ({
                  "@type": "LocationFeatureSpecification",
                  name,
                  value: true,
                })),
              }).replace(/</g, "\\u003c"),
            }}
          />
        ) : null}
        <Hero
          content={content}
          title={signature && home ? "Our story" : title}
          image={heroImage}
          home={home}
          signature={signature}
        />
        {home ? (
          signature ? (
            <>
              <StoryMotion>
                <section className="story-panel story-intro" id="introduction">
                  <div className="story-emblem">
                    ✳<span>{content.name}</span>
                  </div>
                  <span className="eyebrow">A sense of belonging</span>
                  <h2>{content.storyTitle}</h2>
                  <p>{content.intro}</p>
                </section>
                <section className="story-panel story-photo">
                  <Photo image={content.gallery[1] || content.hero} />
                  <span className="eyebrow">
                    Honest materials. Unhurried days.
                  </span>
                </section>
                <section className="story-panel story-text">
                  <span className="eyebrow">Our beginnings</span>
                  <h2>
                    A place to feel
                    <br />
                    <em>at home.</em>
                  </h2>
                  {content.story.split("\n\n").map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </section>
                <section className="story-panel story-photo last">
                  <Photo image={content.gallery[5] || content.hero} />
                  <h2>
                    The island,
                    <br />
                    in its own time.
                  </h2>
                </section>
              </StoryMotion>
              <NextPage
                title="The villas"
                href="/rooms"
                image={content.rooms[0].image}
                prefix={prefix}
              />
            </>
          ) : (
            <>
              <section className="introduction section" id="introduction">
                <div>
                  <span className="eyebrow">Welcome to {content.name}</span>
                  <h2>
                    A world away.
                    <br />
                    <em>Right where you belong.</em>
                  </h2>
                </div>
                <div>
                  <p>{content.intro}</p>
                  <Link className="text-link" href={prefix + "/story"}>
                    Our story <span>↗</span>
                  </Link>
                </div>
                <span className="intro-seal" aria-hidden="true">
                  ✳
                </span>
              </section>
              <section className="villas-section section">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">Find your own sanctuary</span>
                    <h2>Room to simply be.</h2>
                  </div>
                  <Link className="text-link" href={prefix + "/rooms"}>
                    Explore the villas ↗
                  </Link>
                </div>
                <Cards content={content} kind="rooms" prefix={prefix} />
              </section>
              <section className="amenities-band">
                <span className="eyebrow">
                  The little things, taken care of.
                </span>
                <div>
                  {content.amenities.map((a, i) => (
                    <span key={a}>
                      <small>0{i + 1}</small>
                      {a}
                    </span>
                  ))}
                </div>
              </section>
              <section className="split-section section">
                <Photo
                  image={
                    content.gallery.find((x) => x.category === "Nature") ||
                    content.hero
                  }
                />
                <div>
                  <span className="eyebrow">Live a little slower</span>
                  <h2>
                    Less agenda.
                    <br />
                    <em>More island.</em>
                  </h2>
                  <p>
                    A morning without an alarm. A walk with no destination. The
                    luxury of a day that is entirely yours.
                  </p>
                  <Link
                    className="text-link"
                    href={
                      prefix +
                      (content.modules.experiences
                        ? "/experiences"
                        : "/gallery")
                    }
                  >
                    Explore the island ↗
                  </Link>
                </div>
              </section>
              <section className="home-gallery section">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">Life at {content.name}</span>
                    <h2>Moments, not itineraries.</h2>
                  </div>
                  <Link className="text-link" href={prefix + "/gallery"}>
                    View gallery ↗
                  </Link>
                </div>
                <div>
                  {content.gallery.slice(0, 3).map((im) => (
                    <Link key={im.src} href={prefix + "/gallery"}>
                      <Photo image={im} />
                    </Link>
                  ))}
                </div>
              </section>
              <section className="stay-cta section">
                <span className="eyebrow">Your island chapter awaits</span>
                <h2>
                  Come for the place.
                  <br />
                  <em>Stay for the feeling.</em>
                </h2>
                <Booking content={content} />
              </section>
            </>
          )
        ) : null}
        {route === "story" ? (
          <section className="split-section section" id="introduction">
            <Photo image={content.gallery[1] || content.hero} />
            <div>
              <span className="eyebrow">The {content.name} story</span>
              <h2>{content.storyTitle}</h2>
              {content.story.split("\n\n").map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </section>
        ) : null}
        {["rooms", "experiences", "packages"].includes(route) && !slug ? (
          <section className="listing-section section" id="introduction">
            <div className="listing-intro">
              <span className="eyebrow">
                {route === "rooms"
                  ? "A small collection, thoughtfully made"
                  : "Discover your own Bali"}
              </span>
              <h2>
                {route === "rooms"
                  ? "Private spaces.\nPersonal moments."
                  : title}
              </h2>
              <p>
                {route === "rooms"
                  ? content.intro
                  : "There is more to a stay than where you sleep. Make time for the island and everything it brings."}
              </p>
            </div>
            <Cards
              content={content}
              kind={route as "rooms" | "experiences" | "packages"}
              prefix={prefix}
            />
          </section>
        ) : null}
        {item ? (
          <>
            <section className="detail-intro section" id="introduction">
              <div>
                <span className="eyebrow">
                  {route === "rooms"
                    ? "Your private sanctuary"
                    : "A new perspective"}
                </span>
                <h2>{item.title}</h2>
                {room ? (
                  <div className="room-facts">
                    <span>{room.capacity} guests</span>
                    <span>{room.area} m²</span>
                    <span>Private retreat</span>
                  </div>
                ) : null}
              </div>
              <div>
                <p>{item.description}</p>
                <Booking content={content} room={item.title} />
              </div>
            </section>
            {room ? (
              <section className="facilities section">
                <div>
                  <h3>Consider it taken care of.</h3>
                  <ul>
                    {room.inclusions.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="eyebrow">In your villa</span>
                  <ul>
                    {room.facilities.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
              </section>
            ) : null}
            <Photo image={item.image} className="detail-wide" />
            <section className="other-rooms">
              <span className="eyebrow">
                {route === "rooms" ? "Other villas" : "Keep exploring"}
              </span>
              <div>
                {content[route as "rooms" | "experiences" | "packages"]
                  .filter((x) => x.slug !== slug)
                  .map((x) => (
                    <Link href={`${prefix}/${route}/${x.slug}`} key={x.slug}>
                      <Photo image={x.image} />
                      <h3>{x.title}</h3>
                      <span>Discover ↗</span>
                    </Link>
                  ))}
              </div>
            </section>
          </>
        ) : null}
        {route === "gallery" ? (
          <section className="section" id="introduction">
            <span className="eyebrow">A look inside</span>
            <Gallery images={content.gallery} />
          </section>
        ) : null}
        {route === "location" ? (
          <section className="split-section section" id="introduction">
            <Photo
              image={
                content.gallery.find((x) => x.category === "Nature") ||
                content.hero
              }
            />
            <div>
              <span className="eyebrow">Getting here</span>
              <h2>
                Close to nature.
                <br />
                <em>Closer to yourself.</em>
              </h2>
              <p>{content.address}</p>
              <p>
                Contact your host for arrival details and help arranging a
                transfer.
              </p>
              <a
                className="text-link"
                target="_blank"
                rel="noopener noreferrer"
                href={content.mapUrl}
              >
                Open in Google Maps ↗
              </a>
              <a className="contact-email" href={`mailto:${content.email}`}>
                {content.email}
              </a>
            </div>
          </section>
        ) : null}
        {route === "dining" ? (
          <section className="split-section section" id="introduction">
            <Photo image={content.dining.image} />
            <div>
              <span className="eyebrow">Good food. Good company.</span>
              <h2>{content.dining.title}</h2>
              <p>{content.dining.description}</p>
            </div>
          </section>
        ) : null}
        {route === "terms" ? (
          <section className="prose section" id="introduction">
            <h2>Before your stay</h2>
            <p>{content.terms}</p>
          </section>
        ) : null}
        {route && !slug && route !== "terms" ? (
          <NextPage
            title={
              route === "gallery"
                ? "Find us"
                : route === "rooms" && content.modules.dining
                  ? "At the table"
                  : "A glimpse inside"
            }
            href={
              route === "gallery"
                ? "/location"
                : route === "rooms" && content.modules.dining
                  ? "/dining"
                  : "/gallery"
            }
            image={
              route === "rooms" && content.modules.dining
                ? content.dining.image
                : content.gallery[2] || content.hero
            }
            prefix={prefix}
          />
        ) : null}
      </main>
      <footer className="site-footer">
        <div className="footer-main">
          <Link className="wordmark" href={prefix + "/"}>
            <span className="brand-flower" aria-hidden="true">
              ✳
            </span>
            {content.name}
          </Link>
          <p>
            {content.tagline}
            <br />
            {content.address}
          </p>
          <div>
            <span className="eyebrow">Begin a conversation</span>
            <a href={`mailto:${content.email}`}>{content.email} ↗</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {content.name} · Fictional villa demo
          </span>
          <div>
            {content.modules.terms ? (
              <Link href={prefix + "/terms"}>Terms</Link>
            ) : null}
            {content.showAdminLink ? <Link href="/admin">Admin ↗</Link> : null}
          </div>
          <span>Thoughtfully made in Bali</span>
        </div>
      </footer>
      {signature ? (
        <MobileReserve content={content} room={item?.title} />
      ) : null}
    </div>
  );
}
