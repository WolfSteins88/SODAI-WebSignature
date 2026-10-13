import "server-only";
import { deploymentScope } from "./security/settings";
export const scope = deploymentScope();
export const siteId = scope.key;
const configuredVariant = process.env.TEMPLATE_VARIANT || "standard";
if (!["standard", "signature"].includes(configuredVariant))
  throw new Error("Invalid TEMPLATE_VARIANT");
export const variant = configuredVariant as "standard" | "signature";
export const isDemo = process.env.CONTENT_MODE !== "live";
export const siteUrl = process.env.AUTH_URL || "http://localhost:3000";
