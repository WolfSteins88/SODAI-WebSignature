import "server-only";
import { auth } from "../auth";
import { accountSettings } from "./settings";
import { validPrincipal } from "../auth/options";
import { siteUrl } from "../config";
import { HttpError } from "./errors";
import { ZodError } from "zod";
export { HttpError } from "./errors";
export async function requireAccess() {
  try {
    accountSettings();
  } catch {
    throw new HttpError(503, "Server authentication is not configured.");
  }
  const session = await auth();
  if (!session?.user) throw new HttpError(401, "Please sign in.");
  if (!validPrincipal(session.user, accountSettings()))
    throw new HttpError(403, "Session scope rejected.");
  return session.user;
}
export function requireOrigin(request: Request) {
  if (request.headers.get("origin") !== new URL(siteUrl).origin)
    throw new HttpError(403, "Request origin rejected.");
}
export function apiError(error: unknown) {
  const headers = { "Cache-Control": "private, no-store" };
  if (error instanceof HttpError)
    return Response.json(
      { error: error.message },
      { status: error.status, headers },
    );
  if (error instanceof ZodError)
    return Response.json(
      { error: "Validation failed", issues:error.issues.map(i=>({path:i.path.join("."),message:i.message})) },
      { status: 422, headers },
    );
  console.error(
    "Server operation failed",
    error instanceof Error ? error.name : "Unknown",
  );
  return Response.json(
    { error: "The operation failed. Contact your operator." },
    { status: 500, headers },
  );
}
