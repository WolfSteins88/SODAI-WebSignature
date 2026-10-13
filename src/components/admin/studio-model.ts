/** Content differences, independent of revision numbers and object key order. */
export function changeCount(a: unknown, b: unknown): number {
  if (Object.is(a, b)) return 0;
  if (Array.isArray(a) && Array.isArray(b))
    return Array.from({ length: Math.max(a.length, b.length) }, (_, i) =>
      changeCount(a[i], b[i]),
    ).reduce((x, y) => x + y, 0);
  if (a && b && typeof a === "object" && typeof b === "object")
    return [...new Set([...Object.keys(a), ...Object.keys(b)])].reduce(
      (sum, k) =>
        sum +
        changeCount(
          (a as Record<string, unknown>)[k],
          (b as Record<string, unknown>)[k],
        ),
      0,
    );
  return 1;
}
export function itemLabel(item: any, fallback: string): string {
  if (item?.layout) {
    const known: Record<string, string> = {
      opener: "Opening",
      intro: item.date || "Introduction",
      timeline: "Timeline",
      founding: "Founding",
      architecture: "Architecture",
      redEditorial: "Balinese culture",
      laterHistory: "Later history",
      bookClosing: "A magical door",
      still: "Closing photograph",
      video: "Video",
    };
    return known[item.layout] || item.layout.replace(/([A-Z])/g, " $1");
  }
  return item?.title || item?.label || item?.name || item?.route || fallback;
}
export function fieldTab(key: string, room: boolean, image: boolean): string {
  if (room) {
    if (["facilities", "inclusions"].includes(key)) return "Amenities";
    if (["gallery", "photoGrid", "showcase"].includes(key)) return "Photos";
    return "Content";
  }
  if (["source", "poster"].includes(key)) return "Video";
  return image ? "Image" : "Content";
}
export function studioSearch(
  content: any,
  sections: { key: string; label: string }[],
  query: string,
) {
  const q = query.trim().toLocaleLowerCase();
  if (!q) return [];
  const rows: {
    key: string;
    label: string;
    detail: string;
    path?: string;
    index?: number;
  }[] = sections.map((s) => ({ ...s, detail: "Section" }));
  const collections = [
    ["story", content.signatureStory?.sections || content.storyPanels],
    ["rooms", content.rooms],
    ["pages", content.pages],
    ["culture", content.culture?.entries],
    ["packages", content.packages],
  ] as const;
  for (const [key, items] of collections)
    if (sections.some((s) => s.key === key) && Array.isArray(items))
      items.forEach((item: any, i: number) =>
        rows.push({
          key,
          label: itemLabel(item, "Entry " + (i + 1)),
          detail: item.route || item.slug || "Content",
          path:
            key === "story"
              ? "signatureStory.sections"
              : key === "culture"
                ? "culture.entries"
                : key,
          index: i,
        }),
      );
  return rows
    .filter((r) => (r.label + " " + r.detail).toLocaleLowerCase().includes(q))
    .slice(0, 10);
}
