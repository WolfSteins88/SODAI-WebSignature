import { redirect } from "next/navigation";
import { requireAccess } from "@/lib/security/access";
import { LivePreviewSurface } from "@/components/admin/live-surface";
import { renderLivePreview } from "./actions";
import { z } from "zod";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Private live preview",
  robots: { index: false, follow: false },
};
export default async function Live({
  searchParams,
}: {
  searchParams: Promise<{ channel?: string }>;
}) {
  let principal;
  try {
    principal = await requireAccess();
  } catch {
    redirect("/admin/login");
  }
  const { channel } = await searchParams;
  const parsed = z.uuid().safeParse(channel);
  if (!parsed.success) return <p>Open live preview from the CMS editor.</p>;
  const binding = {
    channel: parsed.data,
    scope: principal.scope,
    version: principal.version,
    id: principal.id,
  };
  return (
    <LivePreviewSurface
      binding={binding}
      render={renderLivePreview.bind(null, binding)}
    />
  );
}
