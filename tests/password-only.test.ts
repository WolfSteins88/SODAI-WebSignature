import test from "node:test";
import assert from "node:assert/strict";
import { hash } from "bcryptjs";
import { accountSettings } from "../src/lib/security/settings";
import { authOptions } from "../src/lib/auth/options";

test("ADMIN_TOTP=off signs in with password only and keeps TOTP required otherwise", async () => {
  const password = crypto.randomUUID();
  const env: NodeJS.ProcessEnv = {
    NODE_ENV: "test", SITE_ID: "password-only-test", CONTENT_ENV: "local", CONTEXT: "local", NETLIFY: "false",
    AUTH_SECRET: crypto.randomUUID() + crypto.randomUUID(), AUTH_SESSION_VERSION: "1",
    OWNER_IDENTIFIER: "Owner-Test", OWNER_PASSWORD_HASH: await hash(password, 12),
    SUPER_ADMIN_IDENTIFIER: "super-test", SUPER_ADMIN_PASSWORD_HASH: await hash(crypto.randomUUID(), 12),
  };
  assert.throws(() => accountSettings(env));
  const settings = accountSettings({ ...env, ADMIN_TOTP: "off" });
  assert.equal(settings.passwordOnly, true);
  let limited = false;
  const provider = authOptions(settings, "https://villa.example", async () => !limited).providers[0] as any;
  const authorize = provider.options?.authorize ?? provider.authorize;
  const request = new Request("https://villa.example");
  assert.equal((await authorize({ identifier: "OWNER-TEST", password }, request))?.role, "owner");
  assert.equal(await authorize({ identifier: "owner-test", password: "wrong" }, request), null);
  assert.equal(await authorize({ identifier: "nobody", password }, request), null);
  limited = true;
  assert.equal(await authorize({ identifier: "owner-test", password }, request), null);
});
