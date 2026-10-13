import {referenceGallery} from "./signature-gallery-reference";
import {referenceTerms} from "./signature-terms-reference";
import {referenceLocation} from "./signature-location-reference";
import {referencePackagePage,referencePackages} from "./signature-package-reference";
import type { VillaContent, VillaImage } from "../schemas/content";
import { demoContent } from "./demo";
import { referenceRooms, referenceRoomPage } from "./signature-room-reference";
import { referenceCulture } from "./signature-culture-reference";
import { referenceFoundation } from "./signature-foundation-reference";
import { referenceDining } from "./signature-dining-reference";

// Replaceable, published comparison seed. This is deliberately separate from
// the fictional villa seed and from the CMS editing interface planned for M5.
const photo = (file: string, alt: string): VillaImage => ({
  src: `/reference-story/${file}`,
  alt,
  category: "Spaces",
});

const media = {
  opener: photo("lobby-editwebp.webp", "Tandjung Sari's carved wooden lobby"),
  logo: photo("home-story-logo.svg", "Tandjung Sari coral emblem"),
  earlyHouse: photo("1960c-1jpg.jpeg", "Archival photograph of the early Tandjung Sari house"),
  wija: photo("pak-wija-1-1jpg.jpeg", "Archival photograph of Wija at a table"),
  shore: photo("1960b-1jpg.jpeg", "Archival Sanur shoreline with boats"),
  construction: photo("timeline-interior.jpg", "Archival Tandjung Sari interior with staff beneath the lamps"),
  bungalow: photo("resize-2jpg.jpeg", "Early Tandjung Sari bungalow among palms"),
  beachfront: photo("resize-3jpg.jpeg", "Tandjung Sari's beachfront terrace"),
  sanur: photo("frame-38608png.png", "Archival view of Sanur's tourism development"),
  redHouse: photo("resize-1jpg.jpeg", "Red-toned photograph of traditional Balinese architecture"),
  architecture: photo("15-1png.png", "Two archival photographs of Tandjung Sari architecture"),
  dancers: photo("snapinstaapp27269686895319103558308643829194325254783n1080-1png.png", "Young Balinese dancers in gold performance dress"),
  vehicle: photo("20220726133315-1jpg.jpeg", "Vintage vehicle outside Tandjung Sari"),
  carving: photo("pillar-ornamentsjpg.jpeg", "Carved Balinese architectural pillar"),
  book: photo("dsc06901-1png.png", "Tandjung Sari: A Magical Door to Bali book"),
  documentary: photo("documentary-still-clean.jpg", "Elder in the Tandjung Sari documentary"),
  next: photo("hero-image-bungalow-resizedjpg.jpeg", "Black-and-white view over Tandjung Sari bungalows"),
};

export const referenceStory: NonNullable<VillaContent["signatureStory"]> = {
  sections: [
    { id: "story-opener", enabled: true, layout: "opener", title: "Our Story", image: media.opener },
    { id: "the-1960s", enabled: true, layout: "intro", eyebrow: "Initiated in the", date: "1960’s,", logo: media.logo, body: "Tandjung Sari's logo evolved from a coral shot in front of Tandjung Sari beach, which Hans Hoefer presented to Wija as a full-page ad in the first guidebook to Bali printed in 1970. The logo practically \"designed itself\" as an extension of that shot" },
    { id: "sanur-timeline", enabled: true, layout: "timeline", leadImage: media.earlyHouse, entries: [
      { id: "pax-neerlandica", image: media.wija, body: "Tourism in Bali started during the Pax Neerlandica (1908–1942) under the strict control of the Dutch colonial government after their final conquest of the island." },
      { id: "sanur-hotels", image: media.shore, body: "In time, Sanur evolved into a prominent tourist destination with the construction of the Segara Beach Hotel (which became the Segara Village) and later with the building of the InterContinental’s Bali Beach Hotel with Japanese war reparations." },
      { id: "early-1960s", image: media.construction, body: "If you conjure Sanur in the early 1960s when the Tandjung Sari was born, the vision you get will be a quiet one. The beach then was nearly deserted during the day, except for the coming and going of fishermen in their bright little boats and, at low tide, the harvesting of coral from the lagoon's protective reef." },
    ], finalImage: media.bungalow },
    { id: "founding", enabled: true, layout: "founding", heading: "The Tandjung Sari did not intend to become the seminal boutique hotel of tropical Asia.", body: [
      "It began as a place to spend the night for its owner, Wija Wawo-Runtu (1926 - 2001), and his family when they visited Bali from Jakarta on shopping trips for their antique business.",
      "The Wawo-Runtu's little paradise attracted friends from Jakarta, and by 1962, they had four small bungalows for friends who wished to visit Bali.",
      "Within a few years, Tandjung Sari was internationally renowned among smart people as the place to stay if you could get in.",
    ], image: media.beachfront, rightHeading: "Bali's tourism industry began to flourish, leading to the expansion of the island's international airport, which was officially inaugurated as Bali International Airport Ngurah Rai in August 1969.", insetImage: media.sanur, rightCaption: "As tourism continued to grow, Sanur became the most prestigious address on the island." },
    { id: "intimacy-with-bali", enabled: true, layout: "redEditorial", alignment: "low", image: media.redHouse, heading: "Wija understood that visitors wanted intimacy with Bali.", body: ["They wanted to feel the air of Bali on their skin and to live in what they imagined was a Balinese way but more comfortably."] },
    { id: "batujimbar-estate", enabled: true, layout: "architecture", image: media.architecture, heading: "The success of the Tandjung Sari convinced him that the concept could be taken to a larger scale.", caption: "That inspired the development of the Batujimbar Estate.", body: [
      "In February 1974, Indonesia hosted the Pacific Asia Travel Association (PATA) conference, and a few months earlier, in October 1973, Bali Hyatt was completed.",
      "On a par with the expanded Tandjung Sari, with its sixteen new bungalows normally full, the restaurant was a powerful magnet, too. The Tandjung Sari's famous cuisine captivated Craig Claiborne, a food writer and former editor of The New York Times, who devoted a chapter to Tatie Wawo-Runtu's recipe for Soto Ayam.",
      "When the structures were still new and the hotel was doing very well, there were lots of celebrated guests: Calvin Klein, Kirk Douglas, David Bowie, Mick Jagger, Queen Ingrid of Denmark, Margaret Mead, Ingrid Bergman, Annie Lennox, Ringo Starr, Yoko Ono, Paul Getty Jr. and his wife Talitha, and Lionel Poilâne.",
    ] },
    { id: "cultural-performance", enabled: true, layout: "redEditorial", alignment: "high", image: media.dancers, heading: "The Tandjung Sari cultural performance has significantly contributed to the place's legend.", body: [
      "Numerous cultural activities were initiated, and the Tandjung Sari Foundation was established in September 1987 to formalize the commitment to preserve classical dance and other aspects of Balinese culture.",
      "Dance lessons are still regularly scheduled on Friday and Sunday afternoons to tutor children from the local banjar, and their performances take place on stage every first and third Saturday evening of the month.",
    ] },
    { id: "gentle-renaissance", enabled: true, layout: "laterHistory", image: media.vehicle, decoration: photo("later-emblem.svg", "Coral motif"), heading: "For years, the hotel had been coasting from the boom years of the 1970s and '80s, shocked by the impact of the 1991 Gulf War, the 1997 financial crisis, Wija Wawo-Runtu's passing, and the 2003 SARS epidemic.", note: "Then came the gentle renaissance. In 2005, the Tandjung Sari underwent its first renovations", detailImage: media.carving, bookHeading: "At the age of fifty in 2012, the hotel was deeply rejuvenated from within. To celebrate the golden anniversary of Tandjung Sari, the remarkable book Tandjung Sari—A Magical Door to Bali was launched.", body: [
      "The book tells how the hotel grew, the challenges and triumphs, and the people who made it happen. The book has become known for telling the early '60s tourism story in Sanur and enticing readers to dig more into Balinese architecture.",
      "Another step of the 55-year milestone (2017) was celebrated with the Tandjung Sari documentary film, which portrayed the journey from its early days.",
    ] },
    { id: "a-magical-door", enabled: true, layout: "bookClosing", image: media.book, body: [
      "What drew people was the Tandjung Sari's judicious blend of the lowkey and luxurious. The architecture was simple, using local materials and Balinese building techniques, yet the location was on a prime beachfront with wonderful gardens. The rooms were furnished with Balinese antiques, and the hospitality was warm and sophisticated.",
      "Guests felt they were experiencing a highly refined version of \"the real Bali\" with all its sounds and silences, deep perfumes, bare-handedness and hilarity, and powerful enchantment at the edge of a spangled sea.",
    ], heading: "The Tandjung Sari remains a treasure today, still run by the Wawo-Runtu family, discreet and elegantly modest, an ageless beauty." },
    { id: "documentary-still", enabled: false, layout: "video", source: "", poster: null },
  ],
  railEmblem: photo("rail-emblem.svg", "Tandjung Sari coral emblem"),
  nextPageTitle: "Our Rooms",
  video: { enabled: false, source: "", poster: null },
};

export const referenceDemoContent: VillaContent = {
  ...demoContent,
  signatureLocation:referenceLocation,
  signatureTerms:referenceTerms,
  signatureGallery:referenceGallery,
  signaturePackages:referencePackagePage,
  packages:referencePackages,
  name: "Tandjung Sari",
  heroTitle: "Our Story",
  hero: media.opener,
  signatureStory: referenceStory,
  signatureMenu: { introBrand: {emblem: photo("intro-emblem.svg", "Brand coral emblem"), wordmark: photo("intro-wordmark.svg", "Tandjung Sari wordmark"), aspectRatio:76/75, emblemBounds:{x:.4605,y:32.4,width:66.0526,height:66.9333}}, logo: photo("menu-logo.svg", "Tandjung Sari — cape of flowers"), photo: media.opener, referenceLabels: true, contactTitle: "Get in Touch", social: [], legal: "© 2026 Sodai. Reference comparison demo.", credit: "Website by Sodai" },
  rooms: referenceRooms,
  signatureRooms: referenceRoomPage,
  culture: referenceCulture,
  foundation: referenceFoundation,
  dining: { ...referenceDining, bookingUrl: "https://example.com/dining" },
};
