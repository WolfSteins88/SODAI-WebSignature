import {authenticator,loginChallengeRepository} from "../src/lib/auth/totp";
import {Secret} from "otpauth";
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Auth } from "@auth/core";
import { hash } from "bcryptjs";
import * as schema from "../src/lib/db/schema";
import { accountSettings, deploymentScope } from "../src/lib/security/settings";
import { authOptions, validPrincipal } from "../src/lib/auth/options";
import {
  consumeLoginAttempt,
  loginClient,
} from "../src/lib/security/login-limit";
import { contentRepository, seedContent } from "../src/lib/content/repository";
import { demoContent } from "../src/lib/content/demo";
import type { Principal } from "../src/lib/security/roles";

test("M1: real Auth.js flows and persistent scoped PostgreSQL content", async (t) => {
  const directory = path.join(
    process.cwd(),
    "test-results",
    "m1",
    crypto.randomUUID(),
  );
  await mkdir(directory, { recursive: true });
  let engine = new PGlite(directory);
  // PGlite runs PostgreSQL locally. This cast adapts the test driver to the same Drizzle SQL repository.
  const database = () =>
    drizzle(engine, { schema }) as unknown as NodePgDatabase<typeof schema>;
  await migrate(drizzle(engine, { schema }), { migrationsFolder: "drizzle" });
  await migrate(drizzle(engine, { schema }), { migrationsFolder: "drizzle" });
  const previous = { ...process.env };
  const ownerPassword = crypto.randomUUID();
  const superPassword = crypto.randomUUID();
  Object.assign(process.env, {
    SITE_ID: "m1-test",
    CONTENT_ENV: "local",
    CONTEXT: "local",
    NETLIFY: "false",
    AUTH_SECRET: crypto.randomUUID() + crypto.randomUUID(),
    AUTH_SESSION_VERSION: "1",
    OWNER_TOTP_SECRET:new Secret().base32,
    SUPER_ADMIN_TOTP_SECRET:new Secret().base32,
    OWNER_IDENTIFIER: "owner-test",
    SUPER_ADMIN_IDENTIFIER: "super-test",
    OWNER_PASSWORD_HASH: await hash(ownerPassword, 12),
    SUPER_ADMIN_PASSWORD_HASH: await hash(superPassword, 12),
  });
  const settings = accountSettings();
  const principal = (role: "owner" | "super_admin"): Principal => ({
    id: settings.accounts.find((a) => a.role === role)!.id,
    role,
    scope: settings.scope.key,
    version: settings.version,
  });
  try {
    await t.test(
      "idempotent seed, both roles, validation, drafts and publish",
      async () => {
        await seedContent(database(), settings.scope);
        await seedContent(database(), settings.scope);
        const repository = contentRepository(database(), settings.scope);
        assert.equal((await repository.draft(principal("owner"))).revision, 1);
        const draft = { ...demoContent, name: "Unpublished fictional villa" };
        await repository.mutate(principal("owner"), "save", 1, draft);
        assert.equal((await repository.published()).name, demoContent.name);
        await assert.rejects(
          repository.mutate(principal("owner"), "save", 1, draft),
          { status: 409 },
        );
        await assert.rejects(
          repository.mutate(principal("owner"), "save", 2, {
            ...draft,
            booking: {},
          }),
        );
        await repository.mutate(principal("owner"), "publish", 2);
        assert.equal((await repository.published()).name, draft.name);
        await repository.mutate(principal("super_admin"), "save", 2, {
          ...draft,
          name: "Super Admin revision",
        });
        await repository.mutate(principal("super_admin"), "publish", 3);
        await seedContent(database(), settings.scope);
        assert.equal(
          (await repository.published()).name,
          "Super Admin revision",
        );
        await assert.rejects(
          repository.draft({ ...principal("owner"), role: "editor" as never }),
          { status: 403 },
        );
        await assert.rejects(
          repository.draft({ ...principal("owner"), id: "unconfigured" }),
          { status: 403 },
        );
      },
    );
    await t.test(
      "site/environment/deploy isolation and foreign media rejection",
      async () => {
        const preview = deploymentScope({
          ...process.env,
          CONTENT_ENV: "preview",
          CONTEXT: "deploy-preview",
          DEPLOY_ID: "preview-one",
        });
        const second = deploymentScope({
          ...process.env,
          SITE_ID: "second-villa",
        });
        assert.notEqual(preview.key, settings.scope.key);
        assert.notEqual(second.namespace, settings.scope.namespace);
        assert.ok(Buffer.byteLength(preview.storeName) <= 64);
        assert.notEqual(second.storeName, settings.scope.storeName);
        assert.equal(
          deploymentScope({ ...process.env, VILLA_ID: "second-villa", SITE_ID: "netlify-uuid" }).key,
          second.key,
        );
        assert.notEqual(
          preview.namespace,
          deploymentScope({
            ...process.env,
            CONTENT_ENV: "preview",
            CONTEXT: "deploy-preview",
            DEPLOY_ID: "preview-two",
          }).namespace,
        );
        assert.throws(() =>
          deploymentScope({
            ...process.env,
            CONTEXT: "deploy-preview",
            DEPLOY_ID: undefined,
          }),
        );
        await seedContent(database(), preview);
        await seedContent(database(), second);
        assert.equal(
          (await contentRepository(database(), preview).published()).name,
          demoContent.name,
        );
        await assert.rejects(
          contentRepository(database(), preview).draft(
            principal("super_admin"),
          ),
          { status: 403 },
        );
        const foreignId = crypto.randomUUID();
        await database()
          .insert(schema.media)
          .values({
            id: foreignId,
            siteId: preview.key,
            namespace: preview.namespace,
            key: `${foreignId}.webp`,
            name: "Foreign",
            mime: "image/webp",
            width: 10,
            height: 10,
            bytes: 100,
            ready: true,
          });
        await assert.rejects(
          contentRepository(database(), settings.scope).mutate(
            principal("owner"),
            "save",
            3,
            {
              ...demoContent,
              hero: { ...demoContent.hero, src: `/api/media/${foreignId}` },
            },
          ),
          { status: 422 },
        );
      },
    );
    await t.test(
      "login/logout, invalid credentials, CSRF, secure JWT cookies and revocation",
      async () => {
        const origin = "https://villa.example";
        let authTime=new Date();
        const challenges=()=>loginChallengeRepository(database(),accountSettings());
        const options = () =>
          authOptions(accountSettings(), origin, (id, req) =>
            consumeLoginAttempt(
              database(),
              settings.secret,
              settings.scope.key,
              id,
              "otp:"+loginClient(req),
            ), (token,code,request)=>challenges().verify(token,code,request,authTime),
          );
        const jar = new Map<string, string>();
        const request = async (
          route: string,
          method = "GET",
          body?: URLSearchParams,
        ) => {
          const response = await Auth(
            new Request(origin + "/api/auth/" + route, {
              method,
              headers: {
                cookie: [...jar].map(([k, v]) => `${k}=${v}`).join("; "),
                ...(body
                  ? {
                      "Content-Type": "application/x-www-form-urlencoded",
                      origin,
                    }
                  : {}),
              },
              body,
            }),
            options(),
          );
          for (const cookie of response.headers.getSetCookie()) {
            const [part] = cookie.split(";");
            const separator = part.indexOf("=");
            jar.set(part.slice(0, separator), part.slice(separator + 1));
          }
          return response;
        };
        const login = async (identifier: string, password: string) => {
          authTime=new Date(authTime.getTime()+30000);
          const challenge=await challenges().begin(identifier,password,new Request(origin),authTime);
          jar.set('sodai-login-challenge',challenge||'');
          const secret=accountSettings().accounts.find(a=>a.id===identifier)?.totp;
          const code=secret?authenticator(secret).generate({timestamp:authTime.getTime()}):'000000';
          const { csrfToken } = await (await request("csrf")).json();
          return request(
            "callback/credentials",
            "POST",
            new URLSearchParams({
              csrfToken,
              identifier,
              code,
              callbackUrl: origin + "/admin",
            }),
          );
        };
        assert.deepEqual(await (await request("session")).json(), null);
        const csrfRejected = await request(
          "callback/credentials",
          "POST",
          new URLSearchParams({
            identifier: "owner-test",
            password: ownerPassword,
          }),
        );
        assert.match(csrfRejected.headers.get("location") || "", /MissingCSRF/);
        const invalid = await login("owner-test", "incorrect password");
        assert.match(
          invalid.headers.get("location") || "",
          /CredentialsSignin/,
        );
        for (const [id, password, role] of [
          ["owner-test", ownerPassword, "owner"],
          ["super-test", superPassword, "super_admin"],
        ]) {
          const response = await login(id, password);
          const cookie = response.headers
            .getSetCookie()
            .find((c) => c.startsWith("__Secure-authjs.session-token="));
          assert.ok(cookie);
          assert.match(cookie, /HttpOnly/i);
          assert.match(cookie, /Secure/i);
          assert.match(cookie, /SameSite=Lax/i);
          const session = await (await request("session")).json();
          assert.equal(session.user.role, role);
          assert.ok(validPrincipal(session.user, accountSettings()));
          const { csrfToken } = await (await request("csrf")).json();
          const logout = await request(
            "signout",
            "POST",
            new URLSearchParams({
              csrfToken,
              callbackUrl: origin + "/admin/login",
            }),
          );
          assert.ok(
            logout.headers
              .getSetCookie()
              .some(
                (c) => c.includes("session-token=;") && c.includes("Max-Age=0"),
              ),
          );
          assert.equal(await (await request("session")).json(), null);
        }
        await login("owner-test", ownerPassword);
        process.env.AUTH_SESSION_VERSION = "2";
        assert.equal(await (await request("session")).json(), null);
        process.env.AUTH_SESSION_VERSION = "1";
        await login("owner-test", ownerPassword);
        process.env.CONTENT_ENV = "other-env";
        assert.equal(await (await request("session")).json(), null);
        process.env.CONTENT_ENV = "local";
        assert.equal(
          validPrincipal(
            principal("owner"),
            accountSettings({
              ...process.env,
              OWNER_PASSWORD_HASH: process.env.SUPER_ADMIN_PASSWORD_HASH,
            }),
          ),
          false,
        );
      },
    );
    await t.test('M5 TOTP rejects invalid, expired, replayed and cross-account challenges atomically',async()=>{
      const c=loginChallengeRepository(database(),settings),req=new Request('https://villa.example');
      const now=new Date(Date.now()+3000000),otp=authenticator(settings.accounts[0].totp);
      const token=await c.begin('owner-test',ownerPassword,req,now);assert.ok(token);
      const code=otp.generate({timestamp:now.getTime()});
      assert.equal(await c.verify(token,'bad',req,now),null);
      assert.equal(await c.verify(token,otp.generate({timestamp:now.getTime()-600000}),req,now),null);
      assert.equal(await c.verify(token,authenticator(settings.accounts[1].totp).generate({timestamp:now.getTime()}),req,now),null);
      const result=await Promise.all([c.verify(token,code,req,now),c.verify(token,code,req,now)]);
      assert.equal(result.filter(Boolean).length,1);
      const token2=await c.begin('owner-test',ownerPassword,req,now);assert.ok(token2);
      assert.equal(await c.verify(token2,code,req,now),null);
      assert.equal(await c.verify(token2,code,req,new Date(now.getTime()+301000)),null);
      assert.equal(await c.verify('',code,req,now),null);
    });
    await t.test('M5 archive, restore, conflict and transaction history preserve publication',async()=>{
      const r=contentRepository(database(),settings.scope),owner=principal('owner');
      let state=await r.draft(owner);const before=await r.published();
      await r.mutate(owner,'archive',state.revision,{path:['experiences'],index:0});
      let archives=await r.archives(owner);assert.equal(archives.length,1);
      state=await r.draft(owner);assert.equal(state.draft.experiences.length,before.experiences.length-1);
      assert.deepEqual(await r.published(),before);
      await assert.rejects(r.mutate(owner,'unarchive',state.revision-1,archives[0].id),{status:409});
      await r.mutate(owner,'unarchive',state.revision,archives[0].id);
      state=await r.draft(owner);assert.equal(state.draft.experiences.length,before.experiences.length);assert.deepEqual(state.draft.experiences.map(e=>e.slug),before.experiences.map(e=>e.slug));
      const unsaved=structuredClone(state.draft);unsaved.experiences.splice(0,1);
      await assert.rejects(r.mutate(owner,'save',state.revision-1,unsaved),{status:409});
      assert.equal((await r.archives(owner)).length,0);
      await r.mutate(owner,'save',state.revision,unsaved);state=await r.draft(owner);
      const savedArchives=await r.archives(owner);assert.equal(savedArchives.length,1);
      await r.mutate(owner,'unarchive',state.revision,savedArchives.find(a=>!a.restored)!.id);state=await r.draft(owner);
      assert.deepEqual(state.draft.experiences.map(e=>e.slug),before.experiences.map(e=>e.slug));
      const history=await r.history(owner);assert.ok(history.length>=3);
      await r.mutate(owner,'restore',state.revision,history.at(-1)!.id);
      assert.deepEqual(await r.published(),before);
      state=await r.draft(owner);assert.equal(state.publishedRevision,3);
      await assert.rejects(r.mutate(owner,'restore',state.revision,crypto.randomUUID()),{status:404});
      assert.equal((await r.draft(owner)).revision,state.revision);
    });
    await t.test(
      "persistent atomic rate limiting, restart, expiry and content persistence",
      async () => {
        const now = new Date();
        const attempts = await Promise.all(
          Array.from({ length: 12 }, () =>
            consumeLoginAttempt(
              database(),
              settings.secret,
              settings.scope.key,
              "rate-account",
              "rate-ip",
              now,
            ),
          ),
        );
        assert.equal(attempts.filter(Boolean).length, 10);
        await engine.close();
        engine = new PGlite(directory);
        assert.equal(
          await consumeLoginAttempt(
            database(),
            settings.secret,
            settings.scope.key,
            "different-id",
            "rate-ip",
            now,
          ),
          false,
        );
        assert.equal(
          await consumeLoginAttempt(
            database(),
            settings.secret,
            "other-environment",
            "rate-account",
            "rate-ip",
            now,
          ),
          true,
        );
        assert.equal(
          await consumeLoginAttempt(
            database(),
            settings.secret,
            settings.scope.key,
            "rate-account",
            "rate-ip",
            new Date(now.getTime() + 901_000),
          ),
          true,
        );
        assert.equal(
          (await contentRepository(database(), settings.scope).published())
            .name,
          "Super Admin revision",
        );
        const tables = await engine.query<{ tablename: string }>(
          "select tablename from pg_tables where schemaname='public'",
        );
        assert.deepEqual(tables.rows.map((r) => r.tablename).sort(), [
          "archived_content",
          "audit",
          "login_challenges",
          "login_limits",
          "media",
          "otp_counters",
          "revisions",
          "sites",
        ]);
      },
    );
  } finally {
    await engine.close();
    for (const key of Object.keys(process.env))
      if (!(key in previous)) delete process.env[key];
    Object.assign(process.env, previous);
  }
});
