import "server-only";
import { deploymentScope } from "./security/settings";
export const scope = deploymentScope();
export const siteId = scope.key;
const configuredVariant = process.env.TEMPLATE_VARIANT || "standard";
if (!["standard", "signature"].includes(configuredVariant))
  throw new Error("Invalid TEMPLATE_VARIANT");
export const variant = configuredVariant as "standard" | "signature";
export const isDemo = process.env.CONTENT_MODE !== "live";
// On Vercel, fall back to the deployment's own address when AUTH_URL is unset.
const vercelHost =
  process.env.VERCEL_ENV === "production"
    ? process.env.VERCEL_PROJECT_PRODUCTION_URL
    : process.env.VERCEL_URL;
export const siteUrl =
  process.env.AUTH_URL || (vercelHost ? `https://${vercelHost}` : "http://localhost:3000");
