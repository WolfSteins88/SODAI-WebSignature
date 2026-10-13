import { z } from "zod";
import { contentSchema, type VillaContent } from "../schemas/content";
export const previewEnvelope = z
  .object({
    type: z.literal("villa-preview:update"),
    channel: z.uuid(),
    scope: z.string().regex(/^[a-f0-9]{64}$/),
    version: z.string().max(128),
    sequence: z.number().int().nonnegative(),
    route: z
      .string()
      .max(240)
      .regex(/^\/(?:[a-z0-9/-]*)$/),
    content: z.unknown(),
    focus: z.string().max(180).optional(),
  })
  .strict();
export const PREVIEW_LIMIT = 768 * 1024;
export function previewInput(input: unknown) {
  if (new TextEncoder().encode(JSON.stringify(input)).length > PREVIEW_LIMIT)
    throw Error("Preview content exceeds the size limit");
  return previewEnvelope.parse(input);
}
/** Empty required fields retain their last saved value, clearly reported to the owner. */
export function previewSnapshot(input: unknown, base: VillaContent) {
  const result = contentSchema.safeParse(input);
  if (result.success) return { content: result.data, warnings: [] as string[] };
  const content = structuredClone(input) as any;
  const warnings = result.error.issues.map(
    (i) => i.path.join(".") + ": " + i.message,
  );
  for (const issue of result.error.issues) {
    const keys = issue.path.map(String);
    if (
      !keys.length ||
      keys.some((k) => ["__proto__", "constructor", "prototype"].includes(k))
    )
      continue;
    let target = content,
      fallback: any = base;
    for (const k of keys.slice(0, -1)) {
      target = target?.[k];
      fallback = fallback?.[k];
    }
    if (target && typeof target === "object")
      target[keys.at(-1)!] = structuredClone(fallback?.[keys.at(-1)!]);
  }
  const repaired = contentSchema.safeParse(content);
  if (!repaired.success)
    throw Error(
      "Preview paused: incomplete fields or collection limits need attention. Saved content was not changed.",
    );
  return { content: repaired.data, warnings };
}
