import sharp, { type Metadata } from "sharp";
import { HttpError } from "../security/errors";
export async function normalizeImage(bytes: Buffer) {
  if (bytes.length > 4 * 1024 * 1024)
    throw new HttpError(413, "Images must be 4 MB or less.");
  let meta: Metadata;
  try {
    meta = await sharp(bytes, {
      limitInputPixels: 24_000_000,
      animated: false,
    }).metadata();
  } catch {
    throw new HttpError(422, "Image could not be decoded.");
  }
  if (
    !meta.format ||
    !["jpeg", "png", "webp"].includes(meta.format) ||
    !meta.width ||
    !meta.height ||
    meta.width > 6000 ||
    meta.height > 6000 ||
    (meta.pages || 1) > 1
  )
    throw new HttpError(
      422,
      "Use a still JPEG, PNG, or WebP up to 6000 px and 24 megapixels.",
    );
  const data = await sharp(bytes, { limitInputPixels: 24_000_000 })
    .rotate()
    .webp({ quality: 85 })
    .toBuffer({ resolveWithObject: true });
  return {
    bytes: data.data,
    width: data.info.width,
    height: data.info.height,
    mime: "image/webp",
  };
}
