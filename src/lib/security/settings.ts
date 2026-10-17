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
// Vercel names its contexts differently; map them onto Netlify's so a
// production deploy shares one scope and each preview gets its own.
function vercelContext(env: NodeJS.ProcessEnv) {
  if (!env.VERCEL || !env.VERCEL_ENV) return {};
  return env.VERCEL_ENV === "production"
    ? { CONTEXT: "production" }
    : { CONTEXT: "deploy-preview", DEPLOY_ID: env.VERCEL_DEPLOYMENT_ID };
}
// Netlify sets CONTEXT and DEPLOY_ID for the build only; next.config.ts inlines
// them so hosted functions resolve the same scope the operator seeded.
function hostedEnv(env: NodeJS.ProcessEnv = process.env): NodeJS.ProcessEnv {
  const vercel = vercelContext(env);
  return {
    ...env,
    CONTEXT: process.env.SODAI_BUILD_CONTEXT || vercel.CONTEXT || env.CONTEXT,
    DEPLOY_ID: process.env.SODAI_BUILD_DEPLOY_ID || vercel.DEPLOY_ID || env.DEPLOY_ID,
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
export class SettingError extends Error {}
// Names (never values) of the variable at fault, so the login page can say what to fix.
function read<T>(name: string, schema: z.ZodType<T>, value: unknown): T {
  const parsed = schema.safeParse(value);
  if (!parsed.success) throw new SettingError(`${name} is ${value === undefined || value === "" ? "missing" : "invalid"}.`);
  return parsed.data;
}
export function accountSettings(env: NodeJS.ProcessEnv = hostedEnv()) {
  const identifier = z
    .string()
    .trim()
    .min(1)
    .max(120)
    .transform((x) => x.toLowerCase());
  const hash = z.string().regex(/^\$2[aby]\$(1[2-6])\$[./A-Za-z0-9]{53}$/);
  const secret = read("AUTH_SECRET", z.string().min(32), env.AUTH_SECRET);
  const version = read("AUTH_SESSION_VERSION", z.string().min(1).max(64), env.AUTH_SESSION_VERSION);
  const scope = deploymentScope(env);
  const localDemo = Boolean(localDemoConfig(env));
  // ADMIN_TOTP=off is the operator's explicit choice of password-only sign-in.
  const passwordOnly = !localDemo && env.ADMIN_TOTP === "off";
  const totp = passwordOnly ? z.unknown().transform(() => "") : z.string().regex(/^[A-Z2-7]{32,128}$/);
  const accounts = localDemo ? [{id:"admin",role:"super_admin" as const,hash:read("LOCAL_DEMO_PASSWORD_HASH", hash, env.LOCAL_DEMO_PASSWORD_HASH),totp:""}] : [
    {
      id: read("OWNER_IDENTIFIER", identifier, env.OWNER_IDENTIFIER),
      role: "owner" as const,
      hash: read("OWNER_PASSWORD_HASH", hash, env.OWNER_PASSWORD_HASH),
      totp:read("OWNER_TOTP_SECRET", totp, env.OWNER_TOTP_SECRET),
    },
    {
      id: read("SUPER_ADMIN_IDENTIFIER", identifier, env.SUPER_ADMIN_IDENTIFIER),
      role: "super_admin" as const,
      hash: read("SUPER_ADMIN_PASSWORD_HASH", hash, env.SUPER_ADMIN_PASSWORD_HASH),
      totp:read("SUPER_ADMIN_TOTP_SECRET", totp, env.SUPER_ADMIN_TOTP_SECRET),
    },
  ];
  if (accounts.length > 1 && accounts[0].id === accounts[1].id)
    throw new SettingError("OWNER_IDENTIFIER and SUPER_ADMIN_IDENTIFIER must differ.");
  const fingerprint = createHmac("sha256", secret)
    .update(JSON.stringify([scope.key, version, accounts, localDemo, passwordOnly]))
    .digest("hex");
  return { secret, accounts, scope, version: fingerprint, localDemo, passwordOnly };
}
