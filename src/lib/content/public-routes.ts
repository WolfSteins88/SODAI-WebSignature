import {publicCopy} from "./public-copy";
import {culinaryTitle} from "./signature-labels";
import type { VillaContent } from "../schemas/content";
export function enabledModules(content: VillaContent, variant: "standard" | "signature" = "standard") {
  const on=(route:string)=>!content.pages?.some(p=>p.route===route&&!p.enabled);
  return {
    dining:on('/dining')&& content.modules.dining && Boolean(content.dining.title.trim()),
    experiences:on('/experiences')&& content.modules.experiences && content.experiences.some(e=>e.enabled!==false),
    packages:on('/packages')&& content.modules.packages && content.packages.some(p=>p.enabled!==false),
    terms:on('/terms')&& content.modules.terms && (variant === "signature" && content.signatureTerms ? content.signatureTerms.enabled && content.signatureTerms.sections.some(s=>s.enabled) : Boolean(content.terms.trim())),
    foundation:on('/foundation')&& Boolean(content.foundation?.enabled && content.foundation.sections.some(s=>s.enabled)),
    culture:on('/cultures')&& Boolean(content.culture?.enabled && content.culture.entries.some((entry) => entry.enabled)),
  };
}
export function publicPaths(
  content: VillaContent,
  variant: "standard" | "signature" = "standard",
) {
  const modules = enabledModules(content,variant);
  return [
    "/",
    ...(variant === "standard" ? ["/story"] : []),
    "/rooms",
    ...content.rooms.filter(r=>r.enabled!==false).map((r) => `/rooms/${r.slug}`),
    ...(variant === "signature" && modules.dining && content.dining.signature?.categories.some(c=>c.enabled && c.menuPages.length) ? ["/restaurant-menu"] : []),
    ...(variant === "signature" && modules.foundation ? ["/foundation"] : []),
    ...(variant!=="signature" || content.signatureGallery?.enabled!==false ? ["/gallery"] : []),
    ...(variant!=="signature" || content.signatureLocation?.enabled!==false ? ["/location"] : []),
    ...Object.entries(modules)
      .filter(([name]) => name !== "culture" && name !== "foundation")
      .filter(([, on]) => on)
      .map(([name]) => `/${name}`),
    ...(variant === "signature" && modules.culture ? ["/cultures", ...content.culture!.entries.filter((entry) => entry.enabled).map((entry) => `/culture/${entry.slug}`)] : []),
    ...(modules.experiences
      ? content.experiences.filter(r=>r.enabled!==false).map((r) => `/experiences/${r.slug}`)
      : []),
    ...(modules.packages
      ? content.packages.filter(r=>r.enabled!==false && (variant!=="signature" || r.signature?.destination!=="enquiry")).map((r) => `/packages/${r.slug}`)
      : []),
  ].filter(route=>route==='/'||!content.pages?.some(p=>!p.enabled&&(p.route===route||route.startsWith(p.route+'/')||(p.route==='/cultures'&&route.startsWith('/culture/'))||(p.route==='/dining'&&route==='/restaurant-menu'))));
}
export function standardPage(content: VillaContent, path: string[], variant: "standard" | "signature" = "standard") {
  const route = "/" + path.join("/");
  if (!publicPaths(content, variant).includes(route)) return null;
  const kind = path[0] || "home";
  if (variant === "signature" && (kind === "cultures" || kind === "culture")) {
    const article = kind === "culture" ? content.culture?.entries.find((entry) => entry.enabled && entry.slug === path[1]) : undefined;
    return { kind, item: undefined, room: undefined, cultureEntry: article,
      title: article?.title || content.culture!.title,
      description: article?.summary || content.culture!.introTitle,
      image: article?.signature?.hero || article?.image || content.culture!.hero };
  }
  if(variant==="signature" && kind==="gallery" && content.signatureGallery)return {kind,item:undefined,room:undefined,title:content.signatureGallery.title,description:content.signatureGallery.description,image:content.signatureGallery.items.find(i=>i.enabled)?.image||content.hero};
  if(variant==="signature" && kind==="terms" && content.signatureTerms)return {kind,item:undefined,room:undefined,title:content.signatureTerms.title,description:content.signatureTerms.description,image:content.hero};
  if(variant==="signature" && kind==="location" && content.signatureLocation)return {kind,item:undefined,room:undefined,title:content.signatureLocation.title,description:content.signatureLocation.description,image:content.signatureLocation.hero};
  if (variant === "signature" && kind === "foundation") return {kind,item:undefined,room:undefined,title:content.foundation!.title,description:content.foundation!.description,image:content.foundation!.hero};
  if(variant === "signature" && kind === "packages" && content.signaturePackages){const item=content.packages.find(p=>p.enabled!==false&&p.slug===path[1]);return{kind,item,room:undefined,title:item?.title||content.signaturePackages.title,description:item?.description||content.signaturePackages.description,image:item?.image||content.signaturePackages.hero};}
  const item =
    kind === "rooms" || kind === "experiences" || kind === "packages"
      ? content[kind].find((r) => r.slug === path[1])
      : undefined;
  const room =
    kind === "rooms"
      ? content.rooms.find((r) => r.slug === path[1])
      : undefined;
  const titles: Record<string, string> = {
    home: content.heroTitle,
    story: content.storyTitle,
    rooms: publicCopy(content,"roomsTitle"),
    gallery: publicCopy(content,"galleryTitle"),
    location: publicCopy(content,"locationTitle"),
    dining: variant==="signature"?culinaryTitle(content.dining.title):content.dining.title,
    "restaurant-menu": content.dining.signature?.introTitle || content.dining.title,
    experiences: publicCopy(content,"experiencesTitle"),
    packages: publicCopy(content,"packagesTitle"),
    terms: publicCopy(content,"termsTitle"),
  };
  return {
    kind,
    item,
    room,
    title: item?.title || (variant === "signature" && kind === "rooms" ? content.signatureRooms?.title || titles[kind] : titles[kind]),
    description:
      item?.description ||
      (kind === "dining"
        ? content.dining.description
        : kind === "story"
          ? content.story
          : content.intro),
    image:
      (variant === "signature" && kind === "rooms" ? room?.signature?.hero || item?.image || content.signatureRooms?.hero || content.rooms[0]?.image || content.hero : item?.image) || (kind === "dining" ? content.dining.image : content.hero),
  };
}
