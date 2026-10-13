import "server-only";
import { cache } from "react";
import { db } from "../db";
import { scope } from "../config";
import { requireAccess } from "../security/access";
import { contentRepository } from "./repository";
import {resolveBranding} from './branding';
// Request-local memoization only. Public pages never substitute fixture data.
export const publishedContent = cache(async () =>
  contentRepository(db(), scope).published().then(resolveBranding),
);
export async function draftState() {
  const principal = await requireAccess();
  return contentRepository(db(), scope).draft(principal);
}
export async function mutateContent(
  action: "save" | "publish" | "restore" | "archive" | "unarchive",
  expected: number,
  input?: unknown,
) {
  const principal = await requireAccess();
  return contentRepository(db(), scope).mutate(
    principal,
    action,
    expected,
    input,
  );
}
