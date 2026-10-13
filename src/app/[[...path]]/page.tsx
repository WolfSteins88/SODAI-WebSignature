import { Template } from "@/components/template";
import { publishedContent } from "@/lib/content/service";
import { variant, siteUrl } from "@/lib/config";
import { redirect, notFound } from "next/navigation";
import { standardPage, publicPaths } from "@/lib/content/public-routes";
import type { Metadata } from "next";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}): Promise<Metadata> {
  const { path = [] } = await params;
  const content = await publishedContent();
  const page = standardPage(content, path, variant);
  if (!publicPaths(content, variant).includes("/" + path.join("/"))) notFound();
  const title = page
    ? `${page.kind === "home" ? content.name : page.title + " · " + content.name}`
    : path.length
      ? path
          .at(-1)!
          .split("-")
          .map((w) => w[0].toUpperCase() + w.slice(1))
          .join(" ")
      : content.name;
  const seo=content.pages?.find(p=>p.route==='/' + path.join('/'));
  return {
    title:seo?.title||title,
    description: seo?.description || (page?.description || content.intro).slice(0, 160),
    alternates: { canonical: siteUrl + "/" + path.join("/") },
    openGraph: {
      title:seo?.title||title,
      description: seo?.description || (page?.description || content.intro).slice(0, 160),
      url: siteUrl + "/" + path.join("/"),
      type: "website",
      images: [
        {
          url: page?.image.src || content.hero.src,
          alt: page?.image.alt || content.hero.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title:seo?.title||title,
      description: seo?.description || (page?.description || content.intro).slice(0, 160),
      images: [page?.image.src || content.hero.src],
    },
  };
}
export default async function PublicPage({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  const { path = [] } = await params;
  if (variant === "signature" && path[0] === "story") redirect("/");
  const content = await publishedContent();
  return <Template content={content} path={path} />;
}
