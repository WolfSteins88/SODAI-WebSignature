import fs from "node:fs/promises";
import sharp from "sharp";
const rows = JSON.parse(
  await fs.readFile("docs/reference-gallery/asset-map.json"),
);
for (let p = 0; p < 4; p++) {
  const list = rows.slice(p * 25, p * 25 + 25),
    com = [];
  for (let j = 0; j < list.length; j++) {
    com.push({
      input: await sharp("public" + list[j].image.src)
        .resize(220, 140, { fit: "contain", background: "#222" })
        .toBuffer(),
      left: (j % 5) * 230,
      top: Math.floor(j / 5) * 170 + 25,
    });
    com.push({
      input: Buffer.from(
        `<svg width="230" height="25"><text x="10" y="18" fill="white" font-size="15">${p * 25 + j + 1}</text></svg>`,
      ),
      left: (j % 5) * 230,
      top: Math.floor(j / 5) * 170,
    });
  }
  await sharp({
    create: { width: 1150, height: 850, channels: 3, background: "#222" },
  })
    .composite(com)
    .png()
    .toFile("docs/reference-gallery/assets-contact-" + p + ".png");
}
