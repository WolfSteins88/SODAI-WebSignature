import { handlers } from "@/lib/auth";
import { accountSettings } from "@/lib/security/settings";
import { requireOrigin } from "@/lib/security/access";
import { apiError, HttpError } from "@/lib/security/access";
import type { NextRequest } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  try {
    accountSettings();
    return await handlers.GET(request);
  } catch {
    return apiError(
      new HttpError(503, "Server authentication is not configured."),
    );
  }
}
export async function POST(request: NextRequest) {
  try {
    requireOrigin(request);
    accountSettings();
    return await handlers.POST(request);
  } catch (error) {
    return apiError(error);
  }
}
