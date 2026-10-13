import { HttpError } from "./errors";
export type Role = "owner" | "super_admin";
export type Principal = {
  id: string;
  role: Role;
  scope: string;
  version: string;
};
export function enforceRole(role: unknown): asserts role is Role {
  if (role !== "owner" && role !== "super_admin")
    throw new HttpError(403, "You do not have permission for this action.");
}
