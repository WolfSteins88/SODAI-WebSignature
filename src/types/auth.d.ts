import type { DefaultSession } from "next-auth";
import type { Role } from "../lib/security/roles";
declare module "next-auth" {
  interface User {
    role: Role;
    scope: string;
    version: string;
  }
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: Role;
      scope: string;
      version: string;
    };
  }
}
