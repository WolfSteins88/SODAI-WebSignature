import "server-only";
import { createHash, createHmac } from "node:crypto";
import { z } from "zod";
import {localDemoConfig} from "./local-demo";
const segment = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9_-]+$/);
export function deploymentScope(env: NodeJS.ProcessEnv = process.env) {
  localDemoConfig(env);
  const context = env.CONTEXT || "local";
  const villa = segment.parse(
    env.SITE_ID || (context === "local" ? "sodai-local" : undefined),
  );
  const environment = segment.parse(
    env.CONTENT_ENV || (context === "local" ? "local" : undefined),
  );
  const deploy =
    context === "production" || context === "local"
      ? ""
      : segment.parse(env.DEPLOY_ID);
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
  };
}
export function accountSettings(env: NodeJS.ProcessEnv = process.env) {
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
  const totp = z.string().regex(/^[A-Z2-7]{32,128}$/);
  const localDemo = Boolean(localDemoConfig(env));
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
    .update(JSON.stringify([scope.key, version, accounts, localDemo]))
    .digest("hex");
  return { secret, accounts, scope, version: fingerprint, localDemo };
}
