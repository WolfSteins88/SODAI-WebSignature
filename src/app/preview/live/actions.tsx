"use server";
import { headers } from "next/headers";
import { Template } from "@/components/template";
import { requireAccess, requireOrigin } from "@/lib/security/access";
import { draftState } from "@/lib/content/service";
import { previewInput, previewSnapshot } from "@/lib/content/live-preview";
import { resolveBranding } from "@/lib/content/branding";
import { publicPaths } from "@/lib/content/public-routes";
import { variant } from "@/lib/config";
import { scopedMedia } from "@/lib/storage/repository";
import { mediaIds } from "@/lib/content/repository";
export async function renderLivePreview(
  binding: { channel: string; scope: string; version: string; id: string },
  input: unknown,
) {
  const principal = await requireAccess();
  const h = await headers();
  requireOrigin(new Request("http://preview.invalid", { headers: h }));
  const envelope = previewInput(input);
  if (
    principal.scope !== binding.scope ||
    principal.version !== binding.version ||
    principal.id !== binding.id ||
    envelope.scope !== binding.scope ||
    envelope.version !== binding.version ||
    envelope.channel !== binding.channel
  )
    throw Error("Preview session changed. Reload the editor.");
  const state = await draftState(),
    snapshot = previewSnapshot(envelope.content, state.draft);
  await Promise.all(
    mediaIds(snapshot.content).map(async (id) => {
      const image = await scopedMedia(id);
      if (!image.ready)
        throw Error("Selected image is not ready. Choose a completed upload.");
    }),
  );
  const allowed = publicPaths(snapshot.content, variant).includes(
    envelope.route,
  );
  const content = JSON.parse(
    JSON.stringify(resolveBranding(snapshot.content)).replaceAll(
      /\/api\/media\/[0-9a-f-]{36}/g,
      (m) => m + "?draft=1",
    ),
  );
  return {
    sequence: envelope.sequence,
    warnings: snapshot.warnings,
    node: allowed ? (
      <Template
        content={content}
        path={envelope.route.split("/").filter(Boolean)}
        preview
      />
    ) : (
      <section className="live-route-unavailable">
        <h1>Page unavailable</h1>
        <p>
          This route is disabled or absent in the current unsaved content. It
          will return404 publicly after publication.
        </p>
      </section>
    ),
  };
}
