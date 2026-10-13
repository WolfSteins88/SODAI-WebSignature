import { siteUrl } from "@/lib/config";
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/preview"],
    },
    sitemap: siteUrl + "/sitemap.xml",
  };
}
