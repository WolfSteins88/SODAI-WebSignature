import type { VillaContent, VillaImage } from "../schemas/content";
import { signatureDemoCollections } from "./signature-demo";
const photo = (
  id: string,
  alt: string,
  category: VillaImage["category"] = "Spaces",
): VillaImage => ({ src: `/images/${id}.jpg`, alt, category });
export const photos = {
  hero: photo(
    "hero",
    "A palm-lined tropical resort with a turquoise swimming pool",
  ),
  room: photo(
    "room",
    "A spacious bedroom with soft linen and natural light",
    "Living",
  ),
  pool: photo("pool", "A tranquil blue swimming pool surrounded by palms"),
  living: photo(
    "living",
    "A warm, airy living room with natural materials",
    "Living",
  ),
  dining: photo(
    "dining",
    "Thoughtfully prepared food served in a restaurant",
    "Living",
  ),
  nature: photo("nature", "Sunlight over a Balinese landscape", "Nature"),
  beach: photo(
    "beach",
    "A quiet tropical shoreline under a blue sky",
    "Nature",
  ),
  suite: photo("suite", "A comfortable suite with a generous bed", "Living"),
};
export const demoContent: VillaContent = {
  contentVersion:1,
  ...signatureDemoCollections(photos),
  name: "Sodai",
  tagline: "A private retreat in Bali",
  heroTitle: "Somewhere to simply be.",
  intro:
    "Beyond the rush, beneath the palms. A small collection of private villas made for slow mornings, unhurried conversations, and the simple pleasure of feeling at home.",
  storyTitle: "Rooted in Bali. Made for you.",
  story:
    "Sodai began with a simple idea: make room for the things that matter. The sound of water. A meal shared slowly. A garden that changes with the light.\n\nOur fictional villa collection celebrates the island’s natural rhythm through open spaces, honest materials, and thoughtful hospitality. This is an illustrative website demo, rather than a real property listing.",
  address: "Ubud, Bali, Indonesia · illustrative location",
  email: "stay@example.com",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=Ubud+Bali",
  hero: photos.hero,
  gallery: Object.values(photos),
  amenities: [
    "Private pool",
    "Daily breakfast",
    "Garden living",
    "Thoughtful service",
    "Fast Wi-Fi",
    "Airport transfer",
  ],
  rooms: [
    {
      slug: "garden-villa",
      title: "Garden Villa",
      description:
        "Your own quiet corner of the island. Wake to birdsong, linger beside the pool, and let the day unfold at its own pace.",
      image: photos.pool,
      capacity: 2,
      area: 120,
      facilities: [
        "Private swimming pool",
        "King-size bed",
        "Outdoor terrace",
        "Air conditioning",
        "Wi-Fi",
        "Rain shower",
      ],
      inclusions: [
        "Daily breakfast for two",
        "Daily housekeeping",
        "Welcome refreshments",
      ],
    },
    {
      slug: "pool-suite",
      title: "Pool Suite",
      description:
        "Soft linens, sunlit spaces, and water just a few steps away. An intimate sanctuary designed for two.",
      image: photos.room,
      capacity: 2,
      area: 85,
      facilities: [
        "Pool access",
        "King-size bed",
        "Private terrace",
        "Air conditioning",
        "Wi-Fi",
      ],
      inclusions: ["Daily breakfast for two", "Daily housekeeping"],
    },
    {
      slug: "family-residence",
      title: "Family Residence",
      description:
        "A little more space to come together. Two bedrooms, a generous living room, and a private garden for memories in the making.",
      image: photos.living,
      capacity: 4,
      area: 210,
      facilities: [
        "Two bedrooms",
        "Private pool",
        "Kitchenette",
        "Garden",
        "Air conditioning",
        "Wi-Fi",
      ],
      inclusions: [
        "Daily breakfast for four",
        "Daily housekeeping",
        "Welcome refreshments",
      ],
    },
  ],
  modules: { dining: true, experiences: true, packages: true, terms: true },
  dining: {
    title: "At the table, together.",
    description:
      "Seasonal ingredients. Familiar flavours. A generous spirit. Enjoy a leisurely breakfast or gather for an intimate dinner inspired by the island.",
    image: photos.dining,
    bookingUrl: "",
  },
  experiences: [
    {
      slug: "island-mornings",
      title: "Island mornings",
      description:
        "Follow the paths through green rice fields and discover a quieter side of Bali. Ask your host about a personal itinerary.",
      image: photos.nature,
    },
    {
      slug: "by-the-sea",
      title: "A day by the sea",
      description:
        "Salt in the air, sand beneath your feet. Take the scenic route to the coast and leave the afternoon open.",
      image: photos.beach,
    },
  ],
  packages: [
    {
      slug: "slow-stay",
      title: "Stay a little longer",
      description:
        "Make time for a slower escape. Contact your host to discuss a tailored stay, breakfast, and transfers. Demo offer; no live pricing.",
      image: photos.pool,
    },
  ],
  terms:
    "This is a fictional villa website demonstration. Images are illustrative and do not represent an actual property. Reservations, rates, cancellation policies, and availability must be confirmed directly with your host. No payments are collected on this website.",
  booking: {
    controlsEnabled:false,
    mode: "external",
    whatsapp: "",
    url: "https://example.com",
    message: "Hello {villa}, I would like to enquire about {room}.",
  },
  showAdminLink: true,
  showCmsLinkInNavigation: true,
};
