import "server-only";
import {loginChallengeRepository} from "./totp";
import NextAuth from "next-auth";
import { accountSettings } from "../security/settings";
import { consumeLoginAttempt, loginClient } from "../security/login-limit";
import { db } from "../db";
import { siteUrl } from "../config";
import { authOptions } from "./options";
export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  const settings = accountSettings();
  return authOptions(settings, new URL(siteUrl).origin, (identifier, request) =>
    consumeLoginAttempt(
      db(),
      settings.secret,
      settings.scope.key,
      identifier,
      loginClient(request),
    ),
    (token,code,request)=>loginChallengeRepository(db(),settings).verify(token,code,request),
  );
});
