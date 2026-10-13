import { z } from "zod";
import {upgradeSignatureContent} from "./signature-content-upgrade";
const text = z.string().trim().min(1).max(6000);
export const externalUrl = z
  .string()
  .url()
  .refine((v) => {
    try {
      return new URL(v).protocol === "https:";
    } catch {
      return false;
    }
  }, "Use an HTTPS destination");
const image = z.object({
  src: z
    .string()
    .refine(
      (v) =>
        /^\/api\/media\/[0-9a-f-]{36}$/.test(v) ||
        /^\/images\/[\w.-]+$/.test(v) ||
        /^\/reference-story\/[\w.-]+$/.test(v) ||
        /^\/reference-rooms\/[\w.-]+$/.test(v) ||
        /^\/reference-culture\/[\w.-]+$/.test(v) ||
        /^\/reference-dining\/[\w.-]+$/.test(v) ||
        /^\/reference-foundation\/[\w.-]+$/.test(v) ||
        /^\/reference-location\/[\w.-]+$/.test(v) ||
        /^\/reference-packages\/[\w.-]+$/.test(v) ||
        /^\/reference-gallery\/[\w.-]+$/.test(v) ||
        /^https:\/\/images\.unsplash\.com\/photo-[\w-]+\?/.test(v),
      "Choose a library image",
    ),
  alt: text.max(300),
  category: z.enum(["Spaces", "Living", "Nature"]),
  focalPoint: z.object({ x: z.number().min(0).max(100), y: z.number().min(0).max(100) }).optional(),
});
const entry = z.object({
  id:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100).optional(),
  enabled:z.boolean().optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(100),
  title: text.max(160),
  description: text,
  image,
});
const stableId = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100);
export const socialLinkSchema = z.object({
  id: stableId,
  platform: z.enum(["instagram","facebook","youtube","tripadvisor","linkedin","tiktok","x"]),
  url: z.union([externalUrl, z.literal("")]),
  order: z.number().int().nonnegative(),
  enabled: z.boolean().default(false),
}).superRefine((link,ctx) => {
  if (!link.url) return; // An unconfigured platform never renders a public link.
  const hosts: Record<string,string[]> = {instagram:["instagram.com"],facebook:["facebook.com"],youtube:["youtube.com","youtu.be"],tripadvisor:["tripadvisor.com"],linkedin:["linkedin.com"],tiktok:["tiktok.com"],x:["x.com","twitter.com"]};
  let url:URL; try {url=new URL(link.url);} catch {ctx.addIssue({code:"custom",message:"Use a valid platform account URL",path:["url"]});return;} const host = url.hostname.replace(/^www\./,"");
  if (url.username || url.password || !hosts[link.platform].includes(host)) ctx.addIssue({code:"custom",message:"Use the configured platform's HTTPS account URL",path:["url"]});
});
const packageSectionBase = z.object({id:stableId,enabled:z.boolean()});
const packageSection = z.discriminatedUnion('layout',[
  packageSectionBase.extend({layout:z.literal('intro'),heading:text,stayInfo:z.string().max(600),price:z.object({label:z.string().max(100),currency:z.string().max(8),amount:z.number().nonnegative().optional(),display:z.string().max(200),guestCount:z.number().int().positive().optional()}).optional(),durationNights:z.number().int().positive().optional(),body:z.array(text).max(8),small:image,wide:image}),
  packageSectionBase.extend({layout:z.enum(['inclusions','terms']),title:text.max(160),entries:z.array(z.object({id:stableId,enabled:z.boolean(),text})).max(60)}),
]);
const packageEntry=entry.extend({id:stableId.optional(),enabled:z.boolean().optional(),signature:z.object({destination:z.enum(['detail','enquiry']),enquiry:z.discriminatedUnion('type',[z.object({type:z.literal('external'),url:externalUrl}),z.object({type:z.literal('whatsapp'),phone:z.string().regex(/^[1-9][0-9]{7,14}$/)})]).optional(),referenceDemo:z.boolean().optional(),sections:z.array(packageSection).max(16)}).superRefine((v,ctx)=>{
  if(new Set(v.sections.map(s=>s.id)).size!==v.sections.length)ctx.addIssue({code:'custom',message:'Package section IDs must be unique',path:['sections']});
  v.sections.forEach((s,i)=>{if('entries'in s&&new Set(s.entries.map(e=>e.id)).size!==s.entries.length)ctx.addIssue({code:'custom',message:'Package row IDs must be unique',path:['sections',i,'entries']});});
  if(v.destination==='detail'&&!v.sections.some(s=>s.layout==='intro'))ctx.addIssue({code:'custom',message:'Detail destination requires an intro composition',path:['sections']});
}).optional()});
const storyPanel = z.object({
  id: stableId,
  enabled: z.boolean(),
  layout: z.enum(["intro", "archive", "editorial", "quote", "split", "culture", "collage", "closing", "cinematic"]),
  title: text.max(180),
  body: z.array(text).min(1).max(6),
  images: z.array(image).max(4),
  caption: z.string().trim().max(300),
});
// Fixed editorial compositions; array order is the published scroll order.
// Each ID survives reorder and edits, while disabled sections contribute no geometry.
const storyBase = z.object({ id: stableId, enabled: z.boolean() });
const paragraphs = z.array(text).min(1).max(8);
const videoBlock = z.object({
  enabled: z.boolean().default(false),
  source: z.string().default(""),
  poster: image.nullable().default(null),
}).superRefine((value, ctx) => {
  if (!value.enabled) return;
  const validSource = /^https:\/\/[^\s]+\.(?:mp4|webm)(?:\?[^\s]*)?$/i.test(value.source);
  if (!validSource) ctx.addIssue({ code: "custom", message: "Use a supported HTTPS MP4 or WebM source", path: ["source"] });
  if (!value.poster) ctx.addIssue({ code: "custom", message: "A poster image is required", path: ["poster"] });
});
const signatureStorySection = z.discriminatedUnion("layout", [
  storyBase.extend({ layout: z.literal("opener"), title: text.max(160), image }),
  storyBase.extend({ layout: z.literal("intro"), eyebrow: text.max(100), date: text.max(60), body: text, logo: image }),
  storyBase.extend({ layout: z.literal("timeline"), leadImage: image, entries: z.array(z.object({ id: stableId, image, body: text })).min(1).max(6), finalImage: image }),
  storyBase.extend({ layout: z.literal("founding"), heading: text.max(300), body: paragraphs, image, rightHeading: text.max(400), insetImage: image, rightCaption: text.max(600) }),
  storyBase.extend({ layout: z.literal("redEditorial"), image, heading: text.max(300), body: paragraphs, alignment: z.enum(["high", "low"]) }),
  storyBase.extend({ layout: z.literal("architecture"), image, heading: text.max(300), caption: text.max(300), body: paragraphs }),
  storyBase.extend({ layout: z.literal("laterHistory"), image, decoration: image.optional(), heading: text.max(500), note: text.max(600), detailImage: image, bookHeading: text.max(600), body: paragraphs }),
  storyBase.extend({ layout: z.literal("bookClosing"), image, body: paragraphs, heading: text.max(400) }),
  storyBase.extend({ layout: z.literal("still"), image }),
  videoBlock.safeExtend({id:stableId,layout:z.literal("video")}),
]);
const cultureEntry = z.object({
  id: stableId,
  enabled: z.boolean(),
  slug: stableId,
  title: text.max(160),
  summary: text.max(600),
  image,
  heading: text.max(200),
  body: z.array(text).min(1).max(8),
  detailImage: image.optional(),
  signature: z.object({
    hero: image,
    nextSlug: stableId.optional(),
    sections: z.array(z.discriminatedUnion("layout", [
      storyBase.extend({ layout: z.literal("portraitEditorial"), image, heading: text.max(600), body: paragraphs }),
      storyBase.extend({ layout: z.literal("redOverlay"), image, heading: text.max(600), body: paragraphs }),
    ])).max(24),
  }).optional(),
});
export const contentContract = z
  .object({
    contentVersion:z.literal(1).default(1),
    publicCopy:z.object({"roomsTitle":text.max(600),"galleryTitle":text.max(600),"locationTitle":text.max(600),"experiencesTitle":text.max(600),"packagesTitle":text.max(600),"termsTitle":text.max(600),"roomsLabel":text.max(600),"roomsHeading":text.max(600),"roomsLink":text.max(600),"amenitiesLabel":text.max(600),"amenitiesHeading":text.max(600),"galleryLabel":text.max(600),"galleryHeading":text.max(600),"galleryLink":text.max(600),"experiencesLabel":text.max(600),"experiencesHeading":text.max(600),"experiencesLink":text.max(600),"packagesLabel":text.max(600),"packagesHeading":text.max(600),"packagesLink":text.max(600),"roomFacilities":text.max(600),"roomInclusions":text.max(600),"perspectiveLabel":text.max(600),"perspectiveHeading":text.max(600),"stayInformation":text.max(600),"discoverMore":text.max(600),"signatureInclusions":text.max(600),"signatureFacilities":text.max(600),"otherRooms":text.max(600),"whatsappLabel":text.max(600),"planStay":text.max(600),"diningLabel":text.max(600),"diningLink":text.max(600),"locationLabel":text.max(600),"locationLink":text.max(600),"storyLink":text.max(600)}).optional(),
    navigation:z.array(z.object({id:stableId,route:z.string().max(220),label:text.max(80),visible:z.boolean(),order:z.number().int().nonnegative()})).max(60).optional(),
    pages:z.array(z.object({id:stableId,route:z.string().max(220),enabled:z.boolean(),title:z.string().max(160),description:z.string().max(300)})).max(100).optional(),
    branding:z.object({useSharedSlots:z.boolean(),logo:image.nullable(),emblem:image.nullable(),wordmark:image.nullable(),useSharedHero:z.boolean()}).optional(),
    name: text.max(100),
    tagline: text.max(180),
    heroTitle: text.max(180),
    intro: text,
    storyTitle: text.max(180),
    story: text,
    storyPanels: z.array(storyPanel).max(32).default([]),
    foundation: z.object({
      enabled: z.boolean(), title: text.max(160), description: text.max(600), hero: image,
      sections: z.array(z.discriminatedUnion("layout", [
        storyBase.extend({ layout: z.literal("heritage"), heading: text, archive: image, caption: text, statement: text, body: z.array(text).length(2), teacher: image }),
        storyBase.extend({ layout: z.literal("commitment"), heading: text, small: image, portrait: image, statement: text }),
        storyBase.extend({ layout: z.literal("aims"), heading: text, entries: z.array(z.object({ id: stableId, enabled: z.boolean(), body: text })).max(12) }),
        storyBase.extend({ layout: z.literal("widePhoto"), image }),
        storyBase.extend({ layout: z.literal("programs"), heading: text, statement: text, decoration: image.optional(), entries: z.array(z.object({ id: stableId, enabled: z.boolean(), image, description: text, placement: z.enum(["high", "low"]) })).max(24) }),
        storyBase.extend({ layout: z.literal("initiatives"), heading: text, small: image, wide: image, portrait: image, statement: text, body: text, closing: text }),
      ])).max(32),
    }).optional(),
    signatureMenu: z.object({
      logo: image, photo: image, referenceLabels: z.boolean().default(false),
      introBrand: z.object({
        emblem:image, wordmark:image, aspectRatio:z.number().min(.25).max(4),
        emblemBounds:z.object({x:z.number().min(0).max(100),y:z.number().min(0).max(100),width:z.number().positive().max(100),height:z.number().positive().max(100)})
          .refine(b=>b.x+b.width<=100&&b.y+b.height<=100,'Emblem bounds must fit the brand frame'),
      }).optional(),
      contactTitle: text.max(100).default("Get in Touch"), email: z.union([z.string().email(), z.literal("")]).optional(),
      social: z.array(socialLinkSchema).max(12).default([]),
      legal: text.max(300), credit: text.max(100).optional(),
    }).optional(),
    signatureStory: z.object({
      railEmblem: image.optional(),
      nextPageTitle: text.max(120).default("The villas"),
      sections: z.array(signatureStorySection).max(32),
      video: videoBlock.default({ enabled: false, source: "", poster: null }),
    }).optional(),
    culture: z.object({
      enabled: z.boolean(),
      hero: image,
      title: text.max(160),
      introTitle: text.max(300),
      intro: z.array(text).min(1).max(4),
      introImages: z.array(image).min(1).max(2),
      entries: z.array(cultureEntry).max(30),
    }).optional(),
    address: text.max(500),
    email: z.string().email(),
    mapUrl: externalUrl,
    hero: image,
    gallery: z.array(image).max(80),
    signatureGallery:z.object({enabled:z.boolean(),title:text.max(160),description:text.max(600),categories:z.array(z.object({id:stableId,label:text.max(60),enabled:z.boolean()})).max(20),items:z.array(z.object({id:stableId,enabled:z.boolean(),mediaId:z.uuid().optional(),image,width:z.number().int().min(1).max(16000),height:z.number().int().min(1).max(16000),caption:text.max(600).optional(),viewerOrder:z.number().int().min(0).optional(),categories:z.array(stableId).max(20)})).max(240)}).superRefine((v,ctx)=>{
      for(const key of ['categories','items']as const)if(new Set(v[key].map(r=>r.id)).size!==v[key].length)ctx.addIssue({code:'custom',message:'Gallery IDs must be unique',path:[key]});
      const ids=new Set(v.categories.map(c=>c.id));v.items.forEach((item,i)=>{if(item.categories.some(id=>!ids.has(id)))ctx.addIssue({code:'custom',message:'Unknown gallery category',path:['items',i,'categories']});if(item.image.src.startsWith('/api/media/')&&item.mediaId!==item.image.src.slice(11))ctx.addIssue({code:'custom',message:'Media ID must match the published library image',path:['items',i,'mediaId']});});
    }).optional(),
    amenities: z.array(text.max(100)).max(30),
    rooms: z
      .array(
        entry.extend({
          relatedRooms:z.array(stableId).max(30).optional(),
          capacity: z.number().int().min(1).max(30),
          area: z.number().min(1).max(2000),
          facilities: z.array(text.max(120)).max(30),
            inclusions: z.array(text.max(120)).max(30),
            signature: z.object({
              hero: image,
              heading: text,
              body: paragraphs,
              showcase: z.object({
                wide: image,
                small: image,
                tall: image,
                heading: text.max(400),
                body: text,
              }).optional(),
              photoGrid: z.array(z.object({id:stableId,enabled:z.boolean().default(true),image,caption:text.max(600).optional()})).max(30).refine(v=>v.filter(p=>p.enabled).length<=9,"Maximum nine enabled room photographs").optional(),
              gallery: z.array(z.object({ id: stableId, image })).max(20),
            }).optional(),
        }),
      )
      .min(1)
      .max(30),
    signatureRooms: z.object({
      title: text.max(160),
      hero: image,
      heading: text,
      smallImage: image,
      smallCopy: text,
      largeImage: image,
      largeCopy: text,
      ornament: image.optional(),
    }).optional(),
    modules: z.object({
      dining: z.boolean(),
      experiences: z.boolean(),
      packages: z.boolean(),
      terms: z.boolean(),
    }),
    dining: z.object({
      title: text.max(160),
      description: text,
      image,
      bookingUrl: externalUrl.or(z.literal("")),
      signature: z.object({
        introTitle: text.max(200),
        categories: z.array(z.object({ id: stableId, enabled: z.boolean(), title: text.max(160), description: text, image,
          menuPages: z.array(z.object({ id: stableId, image, width: z.number().int().positive().max(12000), height: z.number().int().positive().max(16000) })).max(40),
          mobileMenuPages: z.array(z.object({ id: stableId, image, width: z.number().int().positive().max(12000), height: z.number().int().positive().max(16000) })).max(40).optional(),
          downloadUrl: externalUrl.or(z.literal("")).or(z.string().regex(/^\/reference-dining\/[\w.-]+\.pdf$/)),
        })).max(20),
        offers: z.array(z.object({ id: stableId, enabled: z.boolean(), title: text.max(160), description: paragraphs, image, reservationUrl: externalUrl.or(z.literal("")) })).max(30),
        notes: z.array(text).max(8),
      }).superRefine((value, ctx) => {
        for (const [key, entries] of [["categories", value.categories], ["offers", value.offers]] as const) {
          if (new Set(entries.map(e => e.id)).size !== entries.length) ctx.addIssue({code:"custom",message:"Dining IDs must be unique",path:[key]});
        }
        value.categories.forEach((c,i)=>{if(new Set([...c.menuPages,...(c.mobileMenuPages||[])].map(p=>p.id)).size!==c.menuPages.length+(c.mobileMenuPages?.length||0))ctx.addIssue({code:"custom",message:"Menu page IDs must be unique",path:["categories",i,"menuPages"]});});
      }).optional(),
    }),
    experiences: z.array(entry).max(30),
    packages: z.array(packageEntry).max(30),
    signatureLocation: z.object({
      id:stableId, enabled:z.boolean(), title:text.max(160), description:text.max(600), hero:image, heading:text,
      contacts:z.object({phone:z.object({enabled:z.boolean(),label:text.max(80),display:text.max(100),number:z.string().regex(/^\+[1-9][0-9]{7,14}$/)}).optional(),email:z.object({enabled:z.boolean(),label:text.max(80),address:z.string().email()}).optional(),address:z.object({enabled:z.boolean(),label:text.max(80),lines:z.array(text.max(500)).min(1).max(6)})}),
      small:image, map:image, directionsUrl:externalUrl.or(z.literal('')),
      destinations:z.array(z.object({id:stableId,enabled:z.boolean(),name:text.max(300),distance:text.max(100)})).max(40),
      notes:z.array(z.object({id:stableId,enabled:z.boolean(),text})).max(20),
      newsletter:z.object({enabled:z.boolean().default(false),referenceDemoVisual:z.boolean().default(false),eyebrow:text.max(80),heading:text.max(300),image,fieldLabel:text.max(80),actionLabel:text.max(80)}).optional(),
    }).superRefine((v,ctx)=>{for(const key of ['destinations','notes'] as const)if(new Set(v[key].map(r=>r.id)).size!==v[key].length)ctx.addIssue({code:'custom',message:'Location row IDs must be unique',path:[key]});}).optional(),
    signaturePackages:z.object({title:text.max(160),description:text.max(600),hero:image,sections:z.array(packageSectionBase.extend({layout:z.literal('editorialIntro'),heading:text,body:text,small:image,tall:image})).max(8)}).superRefine((v,ctx)=>{if(new Set(v.sections.map(s=>s.id)).size!==v.sections.length)ctx.addIssue({code:'custom',message:'Package listing section IDs must be unique',path:['sections']});}).optional(),
    signatureTerms:z.object({enabled:z.boolean(),title:text.max(160),description:text.max(600),sections:z.array(z.object({id:stableId,enabled:z.boolean(),title:text.max(160),compactIntroduction:z.boolean().default(false),body:z.array(z.discriminatedUnion('type',[
      z.object({type:z.literal('paragraph'),text}),
      z.object({type:z.literal('list'),ordered:z.boolean(),items:z.array(text).min(1).max(50)})
    ])).min(1).max(50)})).max(40)}).superRefine((v,ctx)=>{if(new Set(v.sections.map(s=>s.id)).size!==v.sections.length)ctx.addIssue({code:'custom',message:'Terms section IDs must be unique',path:['sections']});}).optional(),
    terms: text,
    booking: z
      .object({
        controlsEnabled:z.boolean().default(false),
        mode: z.enum(["whatsapp", "external", "both"]),
        whatsapp: z.string(),
        url: externalUrl.or(z.literal("")),
        message: text.max(500),
      })
      .superRefine((v, ctx) => {
        if (v.controlsEnabled && v.mode !== "external" && !/^[1-9]\d{7,14}$/.test(v.whatsapp))
          ctx.addIssue({
            code: "custom",
            message: "Use an international number without + or spaces",
            path: ["whatsapp"],
          });
        if (v.controlsEnabled && v.mode !== "whatsapp" && !v.url)
          ctx.addIssue({
            code: "custom",
            message: "Booking URL required",
            path: ["url"],
          });
      }),
    showAdminLink: z.boolean(),
    showCmsLinkInNavigation: z.boolean().default(true),
  })
  .superRefine((v, ctx) => {
    for(const key of ['pages','navigation'] as const){const items=v[key];if(items&&new Set(items.map(i=>i.route)).size!==items.length)ctx.addIssue({code:'custom',message:'Destination routes must be unique',path:[key]});}
    const registered=new Set(['/', '/story','/rooms','/gallery','/location','/dining','/restaurant-menu','/cultures','/foundation','/packages','/experiences','/terms',...v.rooms.map(r=>'/rooms/'+r.slug),...v.experiences.map(r=>'/experiences/'+r.slug),...v.packages.map(r=>'/packages/'+r.slug),...(v.culture?.entries||[]).map(r=>'/culture/'+r.slug)]);
    for(const key of ['navigation','pages'] as const) v[key]?.forEach((p,i)=>{if(!registered.has(p.route))ctx.addIssue({code:'custom',message:'Choose a registered destination',path:[key,i,'route']}); if(key==='pages'&&p.route==='/'&&'enabled' in p&&!p.enabled)ctx.addIssue({code:'custom',message:'Core landing page must remain enabled',path:[key,i,'enabled']});});
    for(const key of ['rooms','experiences','packages'] as const){const ids=v[key].map(r=>r.id).filter(Boolean);if(new Set(ids).size!==ids.length)ctx.addIssue({code:'custom',message:'Stable IDs must be unique',path:[key]});}
    for(const key of ['navigation','pages'] as const){const ids=(v[key]||[]).map(r=>r.id);if(new Set(ids).size!==ids.length)ctx.addIssue({code:'custom',message:'IDs must be unique',path:[key]});}
    if((v.signatureStory?.sections.filter(s=>s.layout==='opener').length||0)>1)ctx.addIssue({code:'custom',message:'Story opener is a singleton',path:['signatureStory','sections']});
    const reserved=new Set(['admin','api','preview','story','rooms','gallery','dining','cultures','culture','location','packages','terms','foundation','restaurant-menu']);
    for(const key of ['rooms','experiences','packages'] as const)v[key].forEach((item,i)=>{if(reserved.has(item.slug))ctx.addIssue({code:'custom',message:'Reserved slug',path:[key,i,'slug']});});
    v.rooms.forEach((room,i)=>{if(room.relatedRooms?.some(id=>id===room.id||!v.rooms.some(r=>r.id===id)))ctx.addIssue({code:'custom',message:'Choose other existing rooms',path:['rooms',i,'relatedRooms']});});
    if (new Set(v.storyPanels.map((p) => p.id)).size !== v.storyPanels.length)
      ctx.addIssue({ code: "custom", message: "Story panel IDs must be unique", path: ["storyPanels"] });
    if (v.foundation) {
      const ids = v.foundation.sections.map(s=>s.id);
      if (new Set(ids).size !== ids.length) ctx.addIssue({code:"custom", message:"Foundation section IDs must be unique", path:["foundation","sections"]});
      v.foundation.sections.forEach((s,i)=>{if ("entries" in s && new Set(s.entries.map(e=>e.id)).size !== s.entries.length) ctx.addIssue({code:"custom",message:"Foundation entry IDs must be unique",path:["foundation","sections",i,"entries"]});});
    }
    if (v.signatureMenu && new Set(v.signatureMenu.social.map(s=>s.id)).size !== v.signatureMenu.social.length)
      ctx.addIssue({code:"custom",message:"Social IDs must be unique",path:["signatureMenu","social"]});
    if (v.signatureStory) {
      const sections = v.signatureStory.sections;
      if (new Set(sections.map((section) => section.id)).size !== sections.length)
        ctx.addIssue({ code: "custom", message: "Signature Story IDs must be unique", path: ["signatureStory", "sections"] });
      for (const [index, section] of sections.entries()) {
        if (section.layout === "timeline" && new Set(section.entries.map((entry) => entry.id)).size !== section.entries.length)
          ctx.addIssue({ code: "custom", message: "Timeline IDs must be unique", path: ["signatureStory", "sections", index, "entries"] });
      }
    }
    if (v.culture) {
      for (const key of ["id", "slug"] as const)
        if (new Set(v.culture.entries.map((entry) => entry[key])).size !== v.culture.entries.length)
          ctx.addIssue({ code: "custom", message: `Culture ${key}s must be unique`, path: ["culture", "entries"] });
      v.culture.entries.forEach((entry, index) => {
        if (entry.signature && new Set(entry.signature.sections.map(section => section.id)).size !== entry.signature.sections.length)
          ctx.addIssue({ code: "custom", message: "Culture section IDs must be unique", path: ["culture", "entries", index, "signature", "sections"] });
        if (entry.signature?.nextSlug === entry.slug)
          ctx.addIssue({ code: "custom", message: "Culture cannot transition to itself", path: ["culture", "entries", index, "signature", "nextSlug"] });
      });
    }
    for (const key of ["rooms", "experiences", "packages"] as const) {
      const slugs = v[key].map((x) => x.slug);
      if (new Set(slugs).size !== slugs.length)
        ctx.addIssue({
          code: "custom",
          message: "Slugs must be unique",
          path: [key],
        });
    }
    const packageIds=v.packages.flatMap(p=>p.id?[p.id]:[]);
    if(new Set(packageIds).size!==packageIds.length)ctx.addIssue({code:'custom',message:'Package IDs must be unique',path:['packages']});
    v.rooms.forEach((room, index) => {
      const grid=room.signature?.photoGrid;
      if(grid&&new Set(grid.map(item=>item.id)).size!==grid.length)ctx.addIssue({code:'custom',message:'Room grid IDs must be unique',path:['rooms',index,'signature','photoGrid']});

      if (room.signature && new Set(room.signature.gallery.map(item => item.id)).size !== room.signature.gallery.length)
        ctx.addIssue({ code: "custom", message: "Room photograph IDs must be unique", path: ["rooms", index, "signature", "gallery"] });
    });
  });
export const contentSchema = z.preprocess(upgradeSignatureContent, contentContract);
export type VillaContent = z.infer<typeof contentSchema>;
export type VillaImage = VillaContent["hero"];
export function bookingLinks(content: VillaContent, room?: string) {
  const b = content.booking;
  const context = b.message
    .replaceAll("{villa}", content.name)
    .replaceAll("{room}", room || "a stay");
  return {
    whatsapp:
      b.mode === "external" || !/^[1-9]\d{7,14}$/.test(b.whatsapp)
        ? null
        : `https://wa.me/${b.whatsapp}?text=${encodeURIComponent(context)}`,
    external: b.mode === "whatsapp" || !b.url ? null : b.url,
  };
}
