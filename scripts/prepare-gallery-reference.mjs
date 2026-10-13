import fs from "node:fs/promises";
import sharp from "sharp";
import crypto from "node:crypto";
const dir = "docs/reference-gallery";
const descriptions = JSON.parse(await fs.readFile(dir + "/descriptions.json"));
const slides = JSON.parse(await fs.readFile(dir + "/source-slides.json"));
const all = JSON.parse(await fs.readFile(dir + "/source-all-loaded.json")),
  dining = JSON.parse(await fs.readFile(dir + "/source-dining.json")),
  bungalows = JSON.parse(await fs.readFile(dir + "/source-bungalows.json"));
const bundled = JSON.parse(await fs.readFile(dir + "/assets.json"));
const cache = new Map(bundled.assets.map((a) => [a.url, a.path]));
const diningUrls = new Set(dining.items.map((i) => i.src)),
  bungalowUrls = new Set(bungalows.items.map((i) => i.src));
const rows = all.items
  .filter((i) => !i.src.includes("/guest-comments/"))
  .sort((a, b) => a.row * 5 + a.column - (b.row * 5 + b.column));
await fs.mkdir("public/reference-gallery", { recursive: true });
let done = 0;
const items = await Promise.all(
  rows.map(async (r, i) => {
    const hash = crypto
        .createHash("sha256")
        .update(r.src)
        .digest("hex")
        .slice(0, 20),
      file = hash + ".webp";
    let bytes;
    if (cache.has(r.src)) bytes = await fs.readFile(cache.get(r.src));
    else {
      const response = await fetch(r.src);
      if (!response.ok)
        throw Error("Reference asset failed " + response.status);
      bytes = Buffer.from(await response.arrayBuffer());
    }
    const metadata = await sharp(bytes).metadata();
    await sharp(bytes)
      .rotate()
      .webp({ quality: 94 })
      .toFile("public/reference-gallery/" + file);
    done++;
    if (done % 25 === 0) console.log("Prepared " + done + "/" + rows.length);
    const category = diningUrls.has(r.src)
      ? "dining"
      : bungalowUrls.has(r.src)
        ? "bungalows"
        : null;
    return {
      viewerOrder: slides.findIndex((s) => s.src === r.src),
      ...(i === 85 ? { caption: "description" } : {}),
      id: "photo-" + hash,
      enabled: true,
      image: {
        src: "/reference-gallery/" + file,
        alt:
          descriptions[i] ||
          (category === "dining"
            ? "Tandjung Sari dining photograph"
            : category === "bungalows"
              ? "Tandjung Sari bungalow photograph"
              : "Tandjung Sari gardens, architecture and island life") +
            " " +
            (i + 1),
        category: category === "dining" ? "Living" : "Spaces",
      },
      width: metadata.width,
      height: metadata.height,
      categories: category ? [category] : [],
    };
  }),
);
await fs.writeFile(
  "src/lib/content/signature-gallery-reference.ts",
  `import type {VillaContent} from '../schemas/content';\n/** Static comparison collection only; no guest-comment assets. */\nexport const referenceGallery:NonNullable<VillaContent['signatureGallery']>=${JSON.stringify(
    {
      enabled: true,
      title: "Gallery",
      description:
        "Photographs of Tandjung Sari bungalows, dining, gardens and island life.",
      categories: [
        { id: "bungalows", label: "Bungalows", enabled: true },
        { id: "dining", label: "Dining", enabled: true },
      ],
      items,
    },
    null,
    2,
  )};\n`,
);
await fs.writeFile(
  dir + "/asset-map.json",
  JSON.stringify(
    rows.map((r, i) => ({ source: r.src, ...items[i] })),
    null,
    2,
  ),
);
console.log("Prepared " + items.length + " genuine static photographs");
