import {Secret} from "otpauth";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { mkdir } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { hash } from "bcryptjs";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { deploymentScope } from "../src/lib/security/settings";
import { demoContent } from "../src/lib/content/demo";
import { referenceDemoContent } from "../src/lib/content/signature-reference-demo";
import { sites } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
import { contentSchema, type VillaContent } from "../src/lib/schemas/content";
export async function startStandardFixture(
  port = 3110,
  variant: "standard" | "signature" = "standard",
  cms = false,
) {
  const directory = path.resolve(
    "test-results",
    "standard",
    cms ? `cms-${variant}` : crypto.randomUUID(),
  );
  await mkdir(directory, { recursive: true });
  const engine = new PGlite(directory),
    database = drizzle(engine);
  await migrate(database, { migrationsFolder: "drizzle" });
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    NODE_ENV: "production",
    NETLIFY: "false",
    CONTEXT: "local",
    CONTENT_ENV: "test",
    SIGNATURE_REFERENCE_COMPARISON: process.argv[2]==="review" && variant==="signature" ? "1" : "0",
    SITE_ID: `${variant}-fixture`,
    AUTH_URL: `http://localhost:${port}`,
    TEMPLATE_VARIANT: variant,
    CONTENT_MODE: "live",
    AUTH_SECRET: randomBytes(32).toString("base64url"),
    AUTH_SESSION_VERSION: "1",
    OWNER_TOTP_SECRET:new Secret().base32,
    SUPER_ADMIN_TOTP_SECRET:new Secret().base32,
    OWNER_IDENTIFIER: "fixture-owner",
    SUPER_ADMIN_IDENTIFIER: "fixture-super",
    OWNER_PASSWORD_HASH: await hash(randomBytes(32).toString("base64url"), 12),
    SUPER_ADMIN_PASSWORD_HASH: await hash(
      randomBytes(32).toString("base64url"),
      12,
    ),
  };
  if(cms){for(const key of ['AUTH_SECRET','AUTH_SESSION_VERSION','OWNER_IDENTIFIER','OWNER_PASSWORD_HASH','OWNER_TOTP_SECRET','SUPER_ADMIN_IDENTIFIER','SUPER_ADMIN_PASSWORD_HASH','SUPER_ADMIN_TOTP_SECRET']){if(!process.env[key])throw Error('Provision local CMS accounts first: npm run accounts:provision');env[key]=process.env[key];}}
  const scope = deploymentScope(env);
  const fixtureContent = variant === "signature" ? referenceDemoContent : demoContent;
  await database.insert(sites).values({
    id: scope.key,
    villaId: scope.villa,
    environment: scope.environment,
    published: fixtureContent,
    draft: cms ? fixtureContent : { ...fixtureContent, name: "DRAFT NEVER PUBLIC" },
  }).onConflictDoNothing();
  const otherScope = deploymentScope({ ...env, SITE_ID: "other-fixture" });
  await database.insert(sites).values({
    id: otherScope.key,
    villaId: otherScope.villa,
    environment: otherScope.environment,
    published: { ...fixtureContent, name: "OTHER SITE NEVER PUBLIC" },
    draft: fixtureContent,
  }).onConflictDoNothing();
  const socket = new PGLiteSocketServer({
    db: engine,
    port: 0,
    host: "127.0.0.1",
    maxConnections: 10,
  });
  await socket.start();
  const connection = socket.getServerConn();
  const childEnv: NodeJS.ProcessEnv = {
    ...env,
    DATABASE_URL: `postgresql://postgres@${connection}/postgres?sslmode=disable`,
  };
  delete childEnv.NEXT_DIST_DIR;
  const child = spawn(
    process.execPath,
    [
      path.resolve("node_modules/next/dist/bin/next"),
      "start",
      "--hostname",
      "127.0.0.1",
      "--port",
      String(port),
    ],
    { env: childEnv, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] },
  );
  let log = "";
  child.stdout.on("data", (value) => {
    log += value;
  });
  child.stderr.on("data", (value) => {
    log += value;
  });
  const origin = `http://localhost:${port}`;
  let ready = false;
  for (let attempt = 0; attempt < 150; attempt++) {
    if (child.exitCode !== null)
      throw new Error("Next.js fixture exited: " + log);
    try {
      if ((await fetch(origin + "/admin/login")).status === 200) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  if (!ready) throw new Error("Fixture not ready: " + log);
  return {
    origin,
    scope,
    database,
    logs: () => log,
    async publish(content: VillaContent) {
      await database
        .update(sites)
        .set({ published: contentSchema.parse(content) })
        .where(eq(sites.id, scope.key));
    },
    async stop() {
      child.kill();
      await new Promise((resolve) =>
        child.exitCode !== null ? resolve(null) : child.once("exit", resolve),
      );
      await socket.stop();
      await engine.close();
    },
  };
}
if (process.argv[2] === "review") {
  startStandardFixture(
    process.argv[3] === "signature" ? 3112 : 3110,
    process.argv[3] === "signature" ? "signature" : "standard",
  )
    .then((fixture) => {
      console.log(
        `Villa review: ${fixture.origin} — published local PostgreSQL fixture, not Netlify.`,
      );
      const input = createInterface({ input: process.stdin });
      input.on("line", async (command) => {
        if (
          ![
            "default", "culinary-empty", "culinary-single", "culinary-even", "culinary-disabled", "culinary-reordered", "culinary-long", "room-grid-empty", "room-grid-single", "room-grid-nine", "room-grid-six", "room-grid-missing", "room-grid-long",
            "empty",
            "single",
            "missing-media", "intro-logo-missing",
            "disabled",
            "long",
            "one-room",
            "two-rooms",
            "story-one",
            "story-reordered",
            "story-long",
            "story-timeline-one",
            "gallery-long", "gallery-reordered", "gallery-empty", "gallery-single", "gallery-disabled", "gallery-missing",
            "terms-long", "terms-reordered", "terms-single", "terms-empty", "terms-disabled",
            "location-long",
            "location-reordered",
            "location-empty",
            "location-single",
            "location-disabled",
            "location-newsletter-off",
            "packages-single",
            "packages-empty",
            "packages-reordered",
            "packages-long",
            "foundation-disabled",
            "foundation-reordered",
            "foundation-single",
            "foundation-long",
            "culture-disabled",
            "culture-reordered",
          ].includes(command)
        )
          return;
        const content = structuredClone(process.argv[3] === "signature" ? referenceDemoContent : demoContent);
        if(command.startsWith('culinary-')&&content.dining.signature){const cats=content.dining.signature.categories;
          if(command==='culinary-empty')content.dining.signature.categories=[];
          if(command==='culinary-single')content.dining.signature.categories=cats.slice(0,1);
          if(command==='culinary-even')content.dining.signature.categories=cats.slice(0,2);
          if(command==='culinary-disabled')cats.forEach(c=>c.enabled=false);
          if(command==='culinary-reordered')cats.reverse();
          if(command==='culinary-long')cats[0].description=cats[0].description.repeat(5).slice(0,5800);
        }
        if (command === "long") {
          content.name =
            "An exceptionally long villa name for responsive layout verification in Bali";
          content.heroTitle =
            "A slower chapter begins in a very special corner of the island, with room for everyone to discover their own rhythm";
          content.story = (content.story + "\n\n").repeat(8).slice(0, 5900);
          content.rooms[0].title =
            "An expansive garden residence with a particularly descriptive name for an unhurried stay together";
          content.rooms[0].description =
            content.rooms[0].description.repeat(12);
        }
        if (command === "one-room") content.rooms = content.rooms.slice(0, 1);
        if (command === "two-rooms") content.rooms = content.rooms.slice(0, 2);
        if (command === "story-one") {
          if (content.signatureStory) content.signatureStory.sections = content.signatureStory.sections.slice(0, 1);
          else content.storyPanels = content.storyPanels.slice(0, 1);
        }
        if (command === "story-reordered") {
          if (content.signatureStory) content.signatureStory.sections = content.signatureStory.sections.slice().reverse();
          else content.storyPanels = content.storyPanels.slice().reverse();
        }
        if (command === "story-long") {
          if (content.signatureStory) {
            const intro = content.signatureStory.sections.find((section) => section.layout === "intro");
            if (intro?.layout === "intro") intro.body = intro.body.repeat(10).slice(0, 5900);
            const timeline = content.signatureStory.sections.find((section) => section.layout === "timeline");
            if (timeline?.layout === "timeline") timeline.entries.forEach((entry) => { entry.body = entry.body.repeat(10).slice(0, 5900); });
          } else content.storyPanels[2].body = [content.storyPanels[2].body[0].repeat(10), content.storyPanels[2].body[1].repeat(10)];
        }
        if (command === "story-timeline-one" && content.signatureStory) {
          const timeline = content.signatureStory.sections.find((section) => section.layout === "timeline");
          if (timeline?.layout === "timeline") timeline.entries = timeline.entries.slice(0, 1);
        }
        if(content.signatureGallery){if(command==='gallery-long'){content.signatureGallery.items[0].caption='A detailed description of the photograph and its setting. '.repeat(10).slice(0,600);}if(command==='gallery-disabled')content.signatureGallery.enabled=false;if(command==='gallery-empty'||command==='empty')content.signatureGallery.items=[];if(command==='gallery-single'||command==='single')content.signatureGallery.items=content.signatureGallery.items.slice(0,1);if(command==='gallery-reordered'){content.signatureGallery.items.reverse();content.signatureGallery.items.forEach(i=>delete i.viewerOrder);}if(command==='gallery-missing')content.signatureGallery.items[0].image.src='/images/missing-test.jpg';}
        if(command==='terms-disabled')content.signatureTerms!.enabled=false;
        if(command==='terms-single')content.signatureTerms!.sections=content.signatureTerms!.sections.slice(-1);
        if(command==='terms-empty')content.signatureTerms!.sections=[];
        if(command==='terms-reordered')content.signatureTerms!.sections.reverse();
        if(command==='terms-long')content.signatureTerms!.sections.forEach(s=>s.body.forEach(b=>{if(b.type==='paragraph')b.text=b.text.repeat(4).slice(0,5800);}));
        if(command==='location-long' && content.signatureLocation){content.signatureLocation.heading=(content.signatureLocation.heading+' ').repeat(3);content.signatureLocation.destinations.forEach(r=>r.name=(r.name+' ').repeat(5));}
        if(command==='location-reordered')content.signatureLocation?.destinations.reverse();
        if(command==='location-empty' && content.signatureLocation){content.signatureLocation.destinations=[];content.signatureLocation.notes=[];}
        if(command==='location-single' && content.signatureLocation)content.signatureLocation.destinations=content.signatureLocation.destinations.slice(0,1);
        if(command==='location-disabled' && content.signatureLocation)content.signatureLocation.enabled=false;
        if(command==='location-newsletter-off' && content.signatureLocation?.newsletter)content.signatureLocation.newsletter.referenceDemoVisual=false;
        if(command==='packages-single')content.packages=content.packages.slice(0,1);
        if(command==='packages-empty')content.packages=[];
        if(command==='packages-reordered')content.packages.reverse();
        if(command==='packages-long'){content.packages[0].title=(content.packages[0].title+' ').repeat(4).slice(0,155);content.packages[0].signature?.sections.forEach(s=>{if('entries'in s)s.entries.forEach(e=>e.text=e.text.repeat(6).slice(0,5800));});}
        if (command === "foundation-disabled") content.foundation!.enabled=false;
        if (command === "foundation-reordered") content.foundation!.sections.reverse();
        if (command === "foundation-single") content.foundation!.sections=content.foundation!.sections.filter(s=>s.layout==='programs');
        if (command === "foundation-long") content.foundation!.sections.forEach(s=>{if('heading' in s)s.heading=s.heading.repeat(3).slice(0,5800);if(s.layout==='heritage')s.body=s.body.map(p=>p.repeat(4).slice(0,5800));});
        if (command === "culture-disabled") content.culture!.enabled = false;
        if (command === "culture-reordered") content.culture!.entries = content.culture!.entries.slice().reverse();
        if (command === "empty") content.gallery = [];
        if (command === "single") content.gallery = content.gallery.slice(0, 1);
        if(command.startsWith('room-grid-')){
          const room=content.rooms[0],s=room.signature!;
          const media=[s.showcase!.wide,s.showcase!.small,s.showcase!.tall,...s.gallery.map(p=>p.image)];
          const unique=[...new Map(media.map(image=>[image.src,image])).values()];
          s.photoGrid=unique.slice(0,command==='room-grid-empty'?0:command==='room-grid-single'?1:command==='room-grid-six'?6:9).map((image,i)=>({id:`qa-grid-${i}`,enabled:true,image,caption:i===0?'A view of this bungalow':undefined}));
        }
        if(command==='room-grid-missing')content.rooms[0].signature!.photoGrid![0].image={...content.rooms[0].signature!.photoGrid![0].image,src:'/images/missing-room-grid.jpg'};
        if(command==='room-grid-long'){const r=content.rooms[0];r.signature!.body=r.signature!.body.map(text=>text.repeat(4).slice(0,5800));r.signature!.photoGrid!.forEach(p=>p.caption='A detailed view of the bungalow and its architecture. '.repeat(10).slice(0,590));}
        if(command==='intro-logo-missing' && content.signatureMenu){
          content.signatureMenu.logo={...content.signatureMenu.logo,src:'/images/missing-intro-logo.svg'};
          if(content.signatureMenu.introBrand)content.signatureMenu.introBrand.emblem.src='/images/missing-intro-emblem.svg';
        }
        if (command === "missing-media") {
          content.hero = { ...content.hero, src: "/images/missing-test.jpg" };
          const opener = content.signatureStory?.sections.find((section) => section.layout === "opener");
          if (opener?.layout === "opener") opener.image = content.hero;
        }
        if (command === "disabled")
          content.modules = {
            dining: false,
            experiences: false,
            packages: false,
            terms: false,
          };
        await fixture.publish(content);
        console.log(`Published local QA case: ${command}`);
      });
      process.on("SIGINT", async () => {
        await fixture.stop();
        process.exit(0);
      });
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
