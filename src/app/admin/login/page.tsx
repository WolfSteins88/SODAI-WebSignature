import { Login } from "@/components/admin/login";
import {publishedContent} from "@/lib/content/service";
import { accountSettings } from "@/lib/security/settings";
export const dynamic = "force-dynamic";
export default async function LoginPage() {
  let configured = true;let localDemo=false;
  try {
    localDemo=accountSettings().localDemo;
  } catch {
    configured = false;
  }
  let name = "Villa management";
  try { name = (await publishedContent()).name; } catch { /* Login remains available when content storage is unavailable. */ }
  return (
    <main className="login-page login-redesign">
      <Login configured={configured} localDemo={localDemo} name={name} />
    </main>
  );
}
