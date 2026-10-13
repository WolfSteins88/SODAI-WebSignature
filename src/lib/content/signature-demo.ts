import type { VillaContent, VillaImage } from "../schemas/content";

// Original fictional villa copy follows the reference's composition, not its historical text.
export function signatureDemoCollections(p: Record<string, VillaImage>): Pick<VillaContent, "storyPanels" | "culture"> {
  const storyPanels: VillaContent["storyPanels"] = [
    { id: "beginning", enabled: true, layout: "intro", title: "A slower beginning", body: ["A place begins with a feeling. At Sodai, that feeling is the calm of arriving among palms, with the day still open before you."], images: [p.nature], caption: "An imagined retreat in Bali" },
    { id: "island-fragments", enabled: true, layout: "archive", title: "Collected moments", body: ["Morning light, familiar materials, and a path that turns toward the garden."], images: [p.beach, p.living, p.pool], caption: "Scenes from the fictional Sodai collection" },
    { id: "thoughtful-spaces", enabled: true, layout: "editorial", title: "Room to pause", body: ["We imagined spaces with generous openings and quiet corners. Each villa invites the outdoors in, while leaving enough privacy to feel entirely at home.", "The story is told in simple gestures: cool water after a warm day, a shaded seat, a table set for an unhurried meal."], images: [p.room], caption: "Soft light and natural textures" },
    { id: "unhurried-rhythm", enabled: true, layout: "quote", title: "Let the day unfold in its own time.", body: ["There is no prescribed way to be here. Follow the light, rest awhile, and discover your own rhythm."], images: [], caption: "" },
    { id: "shared-table", enabled: true, layout: "split", title: "Gather, then linger", body: ["Breakfast can stretch into conversation. Later, the garden becomes a place to return to before the evening begins.", "Our fictional hospitality is built around giving guests time and space, with thoughtful help close at hand."], images: [p.dining, p.nature], caption: "The pleasure of an open afternoon" },
    { id: "island-culture", enabled: true, layout: "culture", title: "A living island", body: ["Bali's traditions belong to its communities. We invite visitors to approach them with curiosity, respect, and guidance from local hosts.", "Its arts, ceremonies, and daily offerings make space for reflection beyond the villa walls."], images: [p.beach], caption: "Explore Culture Bali" },
    { id: "new-perspectives", enabled: true, layout: "collage", title: "Always becoming", body: ["The landscape changes with the hour. A familiar view feels new in rain, in morning haze, or just before dusk.", "Sodai is a fictional villa demonstration, yet its invitation is real: notice the details and stay a little longer."], images: [p.suite, p.pool, p.living], caption: "Different corners, one gentle pace" },
    { id: "stay-with-us", enabled: true, layout: "closing", title: "Come as you are. Leave with time to remember.", body: ["Whether you seek solitude or time together, this imagined place is here to show how a stay can feel personal.", "Turn the page and find your own space."], images: [p.hero], caption: "Sodai · an illustrative villa collection" },
    { id: "a-moment-between", enabled: true, layout: "cinematic", title: "A moment between places", body: ["Where the shore meets the light, let the story linger a little longer."], images: [p.beach], caption: "An image-led pause in the fictional villa story" },
  ];
  const details: Array<[string, string, string, VillaImage, string]> = [
    ["galungan", "Galungan", "A season of family, ceremony, and decorated streets.", p.nature, "The island's ceremonial calendar gives families time to gather. If a celebration coincides with your visit, ask a local guide how to observe respectfully."],
    ["kuningan-and-mekotek", "Kuningan & Mekotek", "Community traditions bring color and meaning to the day.", p.beach, "These observances have their own local rhythms. Their meaning is best shared by the communities who hold them."],
    ["nyepi", "Nyepi", "A day when the island becomes unusually still.", p.pool, "The Balinese New Year is marked by quiet. Visitors should plan ahead, respect local guidance, and make space for the slower pace."],
    ["melasti", "Melasti", "A ceremonial journey toward the water.", p.beach, "On days of purification, processions may move toward the sea. Watch only where welcomed and give worshippers room."],
    ["ogoh-ogoh", "Ogoh-ogoh", "Community-made figures fill the streets before Nyepi.", p.living, "Creative work can be seen in neighborhood processions. Local routes and viewing customs vary."],
    ["piodalan", "Piodalan", "A temple anniversary shaped by shared devotion.", p.nature, "Ceremonies belong first to the worshipping community. Dress and behave according to local guidance if invited to visit."],
    ["bali-art-festival", "Bali Arts Festival", "Performances and craft celebrate the island's artists.", p.dining, "Ask your host about current public programs and support the people who make the work."],
    ["perang-pandan-and-ayunan-jantra", "Perang Pandan & Ayunan Jantra", "Distinct traditions of an island community.", p.suite, "Ceremonies are rooted in place. Travel with a knowledgeable local guide and honor any limits on attendance or photography."],
    ["purnama-and-tilem", "Purnama & Tilem", "Moon phases mark recurring moments of reflection.", p.hero, "You may notice offerings and gatherings through the month. A local host can explain what is appropriate to observe."],
    ["offerings", "Offerings", "Small daily gestures are visible across Bali.", p.room, "Offerings are part of everyday practice. Leave them undisturbed and ask before photographing people at prayer."],
  ];
  return {
    storyPanels,
    culture: {
      enabled: true,
      title: "Culture Bali",
      hero: p.nature,
      introTitle: "Across the island, culture lives in everyday moments.",
      intro: ["Some traditions unfold close by; others ask for a longer journey. Each is part of a living community rather than an attraction arranged for visitors.", "The calendar changes from year to year. Ask a local host about current observances, and travel with care for the people and places you meet."],
      introImages: [p.beach, p.dining],
      entries: details.map(([slug, title, summary, image, body]) => ({ id: slug, slug, title, summary, image, heading: title, body: [body] , enabled: true })),
    },
  };
}
