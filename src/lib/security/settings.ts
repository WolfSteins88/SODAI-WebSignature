import "server-only";
import { createHash, createHmac } from "node:crypto";
import { z } from "zod";
import {localDemoConfig} from "./local-demo";
const segment = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9_-]+$/);
// Name the variable so a hosted build log says what to set.
function setting(name: string, value: string | undefined) {
  const parsed = segment.safeParse(value);
  if (!parsed.success)
    throw new Error(`${name} must be set to letters, digits, "-" or "_" (got ${value === undefined ? "nothing" : JSON.stringify(value)}).`);
  return parsed.data;
}
// Netlify sets CONTEXT and DEPLOY_ID for the build only; next.config.ts inlines
// them so hosted functions resolve the same scope the operator seeded.
function hostedEnv(env: NodeJS.ProcessEnv = process.env): NodeJS.ProcessEnv {
  return {
    ...env,
    CONTEXT: process.env.SODAI_BUILD_CONTEXT || env.CONTEXT,
    DEPLOY_ID: process.env.SODAI_BUILD_DEPLOY_ID || env.DEPLOY_ID,
  };
}
export function deploymentScope(env: NodeJS.ProcessEnv = hostedEnv()) {
  localDemoConfig(env);
  const context = env.CONTEXT || "local";
  const villa = setting(
    "VILLA_ID",
    // Netlify's own SITE_ID is a UUID; VILLA_ID names the seeded villa.
    env.VILLA_ID || env.SITE_ID || (context === "local" ? "sodai-local" : undefined),
  );
  const environment = setting(
    "CONTENT_ENV",
    env.CONTENT_ENV || (context === "local" ? "local" : undefined),
  );
  const deploy =
    context === "production" || context === "local"
      ? ""
      : setting("DEPLOY_ID", env.DEPLOY_ID);
  const key = createHash("sha256")
    .update(JSON.stringify([villa, environment, context, deploy]))
    .digest("hex");
  return {
    villa,
    environment,
    context,
    deploy,
    key,
    namespace: `villa-${key}`,
    // Netlify Blobs store names are capped at 64 bytes.
    storeName: `villa-${key.slice(0, 48)}`,
  };
}
export function accountSettings(env: NodeJS.ProcessEnv = hostedEnv()) {
  const identifier = z
    .string()
    .trim()
    .min(1)
    .max(120)
    .transform((x) => x.toLowerCase());
  const hash = z.string().regex(/^\$2[aby]\$(1[2-6])\$[./A-Za-z0-9]{53}$/);
  const secret = z.string().min(32).parse(env.AUTH_SECRET);
  const version = z.string().min(1).max(64).parse(env.AUTH_SESSION_VERSION);
  const scope = deploymentScope(env);
  const localDemo = Boolean(localDemoConfig(env));
  // ADMIN_TOTP=off is the operator's explicit choice of password-only sign-in.
  const passwordOnly = !localDemo && env.ADMIN_TOTP === "off";
  const totp = passwordOnly ? z.unknown().transform(() => "") : z.string().regex(/^[A-Z2-7]{32,128}$/);
  const accounts = localDemo ? [{id:"admin",role:"super_admin" as const,hash:hash.parse(env.LOCAL_DEMO_PASSWORD_HASH),totp:""}] : [
    {
      id: identifier.parse(env.OWNER_IDENTIFIER),
      role: "owner" as const,
      hash: hash.parse(env.OWNER_PASSWORD_HASH),
      totp:totp.parse(env.OWNER_TOTP_SECRET),
    },
    {
      id: identifier.parse(env.SUPER_ADMIN_IDENTIFIER),
      role: "super_admin" as const,
      hash: hash.parse(env.SUPER_ADMIN_PASSWORD_HASH),
      totp:totp.parse(env.SUPER_ADMIN_TOTP_SECRET),
    },
  ];
  if (accounts.length > 1 && accounts[0].id === accounts[1].id)
    throw new Error("Account identifiers must differ");
  const fingerprint = createHmac("sha256", secret)
    .update(JSON.stringify([scope.key, version, accounts, localDemo, passwordOnly]))
    .digest("hex");
  return { secret, accounts, scope, version: fingerprint, localDemo, passwordOnly };
}
