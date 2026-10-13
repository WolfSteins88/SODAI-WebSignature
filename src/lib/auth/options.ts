import "server-only";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {compare} from "bcryptjs";
import { accountSettings } from "../security/settings";
import { enforceRole, type Principal } from "../security/roles";
export function validPrincipal(
  value: unknown,
  settings: ReturnType<typeof accountSettings>,
): value is Principal {
  if (!value || typeof value !== "object") return false;
  const p = value as Principal;
  try {
    enforceRole(p.role);
  } catch {
    return false;
  }
  return (
    p.scope === settings.scope.key &&
    p.version === settings.version &&
    settings.accounts.some((a) => a.id === p.id && a.role === p.role)
  );
}
export function authOptions(
  settings: ReturnType<typeof accountSettings>,
  origin: string,
  limit: (identifier: string, request: Request) => Promise<boolean>,
  verify:(token:string,code:string,request:Request)=>Promise<ReturnType<typeof accountSettings>['accounts'][number]|null>=async()=>null,
): NextAuthConfig {
  const secure = new URL(origin).protocol === "https:";
  const hosted =
    process.env.NETLIFY === "true" ||
    (process.env.VERCEL === "1" && process.env.VERCEL_ENV !== "development");
  if (hosted && !secure)
    throw new Error("Hosted authentication requires HTTPS");
  return {
    secret: settings.secret,
    trustHost: true,
    basePath: "/api/auth",
    useSecureCookies: secure,
    pages: { signIn: "/admin/login", error: "/admin/login" },
    session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
    providers: [
      Credentials({
        credentials: {
          identifier: { label: "Account" },
          code: { label: "Authenticator code" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials, request) {
          if (settings.localDemo) {
            if (!(await limit("admin", request))) return null;
            const password = typeof credentials.password === 'string' ? credentials.password : '';
            const account = settings.accounts[0];
            if (!password || Buffer.byteLength(password) > 72 || !await compare(password, account.hash) || credentials.identifier !== account.id) return null;
            return {id:account.id,name:'Local Demo Admin',role:account.role,scope:settings.scope.key,version:settings.version};
          }
          if (!(await limit("totp",request))) return null;
          const cookie=request.headers.get('cookie')?.split(';').map(v=>v.trim()).find(v=>v.startsWith('sodai-login-challenge='))?.split('=')[1]||'';
          const account=await verify(cookie,typeof credentials.code==='string'?credentials.code:'',request);
          if(!account)return null;
          return {
            id: account.id,
            name: account.role === "owner" ? "Owner" : "Super Admin",
            role: account.role,
            scope: settings.scope.key,
            version: settings.version,
          };
        },
      }),
    ],
    callbacks: {
      jwt({ token, user }) {
        if (user)
          Object.assign(token, {
            id: user.id,
            role: user.role,
            scope: user.scope,
            version: user.version,
          });
        if (!validPrincipal(token, accountSettings())) return null;
        return token;
      },
      session({ session, token }) {
        Object.assign(session.user, {
          id: token.id,
          role: token.role,
          scope: token.scope,
          version: token.version,
        });
        return session;
      },
      redirect({ url }) {
        return url.startsWith("/")
          ? `${origin}${url}`
          : new URL(url).origin === origin
            ? url
            : `${origin}/admin`;
      },
    },
    logger: {
      error(error) {
        console.error("Authentication operation failed", error.name);
      },
    },
  };
}
