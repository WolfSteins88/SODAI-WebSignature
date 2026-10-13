import { Login } from "@/components/admin/login";
import {publishedContent} from "@/lib/content/service";
import { accountSettings, SettingError } from "@/lib/security/settings";
export const dynamic = "force-dynamic";
export default async function LoginPage() {
  let configured = true;let localDemo=false;let passwordOnly=false;let problem="";
  try {
    ({localDemo,passwordOnly}=accountSettings());
  } catch (error) {
    configured = false;
    if (error instanceof SettingError) problem = error.message;
  }
  let name = "Villa management";
  try { name = (await publishedContent()).name; } catch { /* Login remains available when content storage is unavailable. */ }
  return (
    <main className="login-page login-redesign">
      <Login configured={configured} localDemo={localDemo} passwordOnly={passwordOnly} problem={problem} name={name} />
    </main>
  );
}
