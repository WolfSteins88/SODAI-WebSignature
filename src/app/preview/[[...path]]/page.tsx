import { Template } from "@/components/template";
import {resolveBranding} from '@/lib/content/branding';
import { draftState } from "@/lib/content/service";
import { requireAccess } from "@/lib/security/access";
import { variant } from "@/lib/config";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Private preview",
  robots: { index: false, follow: false },
};
export default async function Preview({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  try {
    await requireAccess();
  } catch {
    redirect("/admin/login");
  }
  const { path = [] } = await params;
  const state = await draftState();
  const privateContent=JSON.parse(JSON.stringify(resolveBranding(state.draft)).replaceAll(/\/api\/media\/[0-9a-f-]{36}/g,match=>match+'?draft=1'));
  return (
    <><aside className="cms-preview-indicator" style={{position:"fixed",top:8,right:8,zIndex:9999,background:"#fff7dc",color:"#252c29",padding:"8px 14px",borderRadius:6,font:"14px Arial"}}>Private draft preview · revision {state.revision} · <a href="/admin">Return to CMS</a></aside><Template content={privateContent} path={path} preview /></>
  );
}
