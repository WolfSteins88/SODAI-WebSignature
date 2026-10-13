import {requireAccess,apiError,HttpError} from "@/lib/security/access";
import { and, eq } from "drizzle-orm";
import { mediaStore } from "@/lib/storage/media";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { scope } from "@/lib/config";
import { publishedContent } from "@/lib/content/service";
import { publicMediaIds } from "@/lib/content/repository";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const missing = () =>
    new Response("Photograph unavailable", {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)
  )
    return missing();
  try {
    // Only images referenced by the current site/environment publication are public.
    const privateDraft=new URL(_request.url).searchParams.get('draft')==='1';
    if(privateDraft)await requireAccess();
    else if (!publicMediaIds(await publishedContent()).includes(id)) return missing();
    const item = await db().query.media.findFirst({
      where: and(
        eq(media.id, id),
        eq(media.siteId, scope.key),
        eq(media.namespace, scope.namespace),
        eq(media.ready, true),
      ),
    });
    if (!item || item.mime !== "image/webp") return missing();
    const bytes = await mediaStore().get(item.key, { type: "arrayBuffer" });
    if (!bytes) return missing();
    return new Response(bytes, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": privateDraft ? "private, no-store" : "public, max-age=300",
        "Vary":"Cookie",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    if(e instanceof HttpError)return apiError(e);
    return new Response("Photograph temporarily unavailable", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
