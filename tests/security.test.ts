import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { normalizeImage } from "../src/lib/storage/validate-image";
import { enforceRole } from "../src/lib/security/roles";
test("only the two fixed roles are accepted", () => {
  for (const role of [undefined, "editor", "viewer", "admin"])
    assert.throws(() => enforceRole(role));
  assert.doesNotThrow(() => enforceRole("owner"));
  assert.doesNotThrow(() => enforceRole("super_admin"));
});
test("image validator rejects SVG, HTML, corrupt bytes and oversized input", async () => {
  for (const input of [
    '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"></svg>',
    "<html>hello</html>",
    "garbage",
  ])
    await assert.rejects(normalizeImage(Buffer.from(input)));
  await assert.rejects(normalizeImage(Buffer.alloc(4 * 1024 * 1024 + 1)));
});
test("validated image bytes are re-encoded as bounded WebP", async () => {
  const png = await sharp({
    create: { width: 64, height: 48, channels: 3, background: "#aabbcc" },
  })
    .png()
    .toBuffer();
  const result = await normalizeImage(png);
  assert.equal(result.mime, "image/webp");
  assert.equal(result.width, 64);
  assert.equal(result.height, 48);
  const meta = await sharp(result.bytes).metadata();
  assert.equal(meta.format, "webp");
  assert.equal(meta.exif, undefined);
});
test("image validator rejects excessive decoded dimensions", async () => {
  const png = await sharp({
    create: { width: 6001, height: 2, channels: 3, background: "#000" },
  })
    .png()
    .toBuffer();
  await assert.rejects(normalizeImage(png));
});
