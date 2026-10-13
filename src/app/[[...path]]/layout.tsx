import { publishedContent } from "@/lib/content/service";
import { publicPaths } from "@/lib/content/public-routes";
import { variant } from "@/lib/config";
import { notFound, redirect } from "next/navigation";
export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ path?: string[] }>;
}) {
  const { path = [] } = await params;
  if (variant === "signature" && path.length === 1 && path[0] === "story")
    redirect("/");
  let content;
  try {
    content = await publishedContent();
  } catch {
    return children;
  } // The page error boundary handles database unavailability.
  // Resolve 404 before the page's loading boundary starts streaming a 200 response.
  if (!publicPaths(content, variant).includes("/" + path.join("/"))) notFound();
  return children;
}
