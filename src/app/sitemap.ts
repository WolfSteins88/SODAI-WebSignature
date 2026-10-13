import { publishedContent } from "@/lib/content/service";
import { variant, siteUrl } from "@/lib/config";
import { publicPaths } from "@/lib/content/public-routes";
export const dynamic = "force-dynamic";
export default async function sitemap() {
  const c = await publishedContent();
  return publicPaths(c, variant).map((p) => ({ url: siteUrl + p }));
}
