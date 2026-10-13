import "server-only";
import { and, eq, inArray, desc } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../db/schema";
import { contentSchema, type VillaContent } from "../schemas/content";
import {atPath} from "./editor-path";
import {removedEntries} from './removed-entries';
import { demoContent } from "./demo";
import { accountSettings, type deploymentScope } from "../security/settings";
import { validPrincipal } from "../auth/options";
import type { Principal } from "../security/roles";
import { HttpError } from "../security/errors";
export type Scope = ReturnType<typeof deploymentScope>;
export function mediaIds(content: VillaContent): string[] {
  return [
    ...new Set(
      (JSON.stringify(content).match(/\/api\/media\/[0-9a-f-]{36}/g) || []).map(
        (x) => x.slice(11),
      ),
    ),
  ];
}
/** Disabled Signature gallery entries cannot authorize an otherwise unpublished asset. */
export function publicMediaIds(content: VillaContent): string[] {
  function enabled(value:unknown):unknown{if(Array.isArray(value))return value.filter(v=>!(v&&typeof v==='object'&&'enabled'in v&&v.enabled===false)).map(enabled);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([,v])=>!(v&&typeof v==='object'&&!Array.isArray(v)&&'enabled'in v&&v.enabled===false)).map(([k,v])=>[k,enabled(v)]));return value;}
  return mediaIds(enabled(content) as VillaContent);
}
export function contentRepository(
  database: NodePgDatabase<typeof schema>,
  scope: Scope,
) {
  function authorize(principal: Principal) {
    if (
      !validPrincipal(principal, accountSettings()) ||
      principal.scope !== scope.key
    )
      throw new HttpError(403, "Deployment scope rejected.");
  }
  async function row() {
    const result = await database.query.sites.findFirst({
      where: eq(schema.sites.id, scope.key),
    });
    if (!result) throw new HttpError(404, "Content has not been seeded.");
    return result;
  }
  return {
    async published() {
      const [result] = await database
        .select({ published: schema.sites.published })
        .from(schema.sites)
        .where(eq(schema.sites.id, scope.key));
      if (!result) throw new HttpError(404, "Content has not been seeded.");
      return contentSchema.parse(result.published);
    },
    async draft(principal: Principal) {
      authorize(principal);
      const state=await row();return {...state,draft:contentSchema.parse(state.draft)};
    },
    async history(principal:Principal){authorize(principal);return database.select({id:schema.revisions.id,revision:schema.revisions.revision,actor:schema.revisions.actor,action:schema.revisions.action,createdAt:schema.revisions.createdAt}).from(schema.revisions).where(eq(schema.revisions.siteId,scope.key)).orderBy(desc(schema.revisions.createdAt)).limit(100);},
    async archives(principal:Principal){authorize(principal);return database.select().from(schema.archivedContent).where(and(eq(schema.archivedContent.siteId,scope.key),eq(schema.archivedContent.restored,false))).orderBy(desc(schema.archivedContent.createdAt)).limit(100);},
    async mutate(
      principal: Principal,
      action: "save" | "publish" | "restore" | "archive" | "unarchive",
      expected: number,
      input?: unknown,
    ) {
      authorize(principal);
      if (
        !["save", "publish","restore","archive","unarchive"].includes(action) ||
        !Number.isSafeInteger(expected) ||
        expected < 1
      )
        throw new HttpError(422, "Invalid content operation.");
      // Validate before taking the lock; publishing always uses the database draft.
      const validated =
        action === "save" ? contentSchema.parse(input) : undefined;
      return database.transaction(async (tx) => {
        authorize(principal);
        const [state] = await tx
          .select()
          .from(schema.sites)
          .where(eq(schema.sites.id, scope.key))
          .for("update");
        if (!state) throw new HttpError(404, "Content has not been seeded.");
        if (state.revision !== expected)
          throw new HttpError(
            409,
            "A newer draft exists. Reload before saving.",
          );
        let next=validated||contentSchema.parse(structuredClone(state.draft));
        if(action==='restore'){
          const [r]=await tx.select().from(schema.revisions).where(and(eq(schema.revisions.id,String(input)),eq(schema.revisions.siteId,scope.key)));
          if(!r)throw new HttpError(404,'Revision unavailable.');next=r.content;
        }
        if(action==='archive'){
          const payload=input as {path:string[];index:number};
          if(!Array.isArray(payload?.path)||payload.path.length>12||!payload.path.every(p=>typeof p==='string')||!Number.isSafeInteger(payload.index))throw new HttpError(422,'Invalid archive operation.');
          const collection=atPath(next,payload.path);
          if(!Array.isArray(collection)||payload.index<0||payload.index>=collection.length)throw new HttpError(422,'Collection moved.');
          const value=collection[payload.index];
          if(value?.layout==='opener'||payload.path.includes('navigation')||payload.path.includes('pages'))throw new HttpError(422,'Core singleton cannot be archived.');
          collection.splice(payload.index,1);
          await tx.insert(schema.archivedContent).values({siteId:scope.key,path:payload.path,position:payload.index,value,actor:principal.id});
        }
        if(action==='unarchive'){
          const [a]=await tx.select().from(schema.archivedContent).where(and(eq(schema.archivedContent.id,String(input)),eq(schema.archivedContent.siteId,scope.key),eq(schema.archivedContent.restored,false))).for('update');
          if(!a)throw new HttpError(404,'Archive unavailable.');
          const collection=atPath(next,a.path);if(!Array.isArray(collection))throw new HttpError(409,'Parent collection changed. Restore a revision instead.');collection.splice(Math.min(a.position,collection.length),0,a.value);
          await tx.update(schema.archivedContent).set({restored:true}).where(eq(schema.archivedContent.id,a.id));
        }
        const content = contentSchema.parse(next);
        if(action==='save'){
          const old=state.draft.signatureMenu?.introBrand,newBrand=content.signatureMenu?.introBrand;
          if(old&&(!newBrand||newBrand.aspectRatio!==old.aspectRatio||JSON.stringify(newBrand.emblemBounds)!==JSON.stringify(old.emblemBounds)))throw new HttpError(422,'Loading composition geometry is operator-controlled.');
          const opener=state.draft.signatureStory?.sections.find(s=>s.layout==='opener');
          if(opener&&!content.signatureStory?.sections.some(s=>s.id===opener.id&&s.layout==='opener'&&s.enabled))throw new HttpError(422,'Story opener must remain enabled.');
        }
        if(action==='publish'){
          const videos=[content.signatureStory?.video,...(content.signatureStory?.sections||[]).filter(s=>s.layout==='video')];
          if(videos.some(v=>v?.enabled))throw new HttpError(422,'Video playback is planned. Disable video blocks before publishing.');
        }
        const ids = mediaIds(content);
        if (ids.length) {
          const available = await tx
            .select()
            .from(schema.media)
            .where(
              and(
                eq(schema.media.siteId, scope.key),
                eq(schema.media.namespace, scope.namespace),
                eq(schema.media.ready, true),
                inArray(schema.media.id, ids),
              ),
            );
          if (available.length !== ids.length)
            throw new HttpError(422, "Content references unavailable images.");
        }
        const revision = state.revision + (action !== "publish" ? 1 : 0);
        if(action==='save')for(const removed of removedEntries(state.draft,content))await tx.insert(schema.archivedContent).values({siteId:scope.key,...removed,actor:principal.id});
        await tx
          .update(schema.sites)
          .set(
            action !== "publish"
              ? { draft: content, revision, updatedAt: new Date() }
              : {
                  published: content,
                  publishedRevision: revision,
                  publishedAt: new Date(),
                  updatedAt: new Date(),
                },
          )
          .where(eq(schema.sites.id, scope.key));
        if (action === "publish" && ids.length)
          await tx
            .update(schema.media)
            .set({ everPublished: true })
            .where(
              and(
                eq(schema.media.siteId, scope.key),
                inArray(schema.media.id, ids),
              ),
            );
        await tx.insert(schema.revisions).values({
          siteId: scope.key,
          revision,
          content,
          actor: principal.id,
          action,
        });
        await tx.insert(schema.audit).values({
          siteId: scope.key,
          actor: principal.id,
          action,
          details: { revision },
        });
        return {
          revision,
          publishedRevision:
            action === "publish" ? revision : state.publishedRevision,
        };
      });
    },
  };
}
export async function seedContent(
  database: NodePgDatabase<typeof schema>,
  scope: Scope,
  seed: VillaContent = demoContent,
) {
  const content = contentSchema.parse(seed);
  await database.transaction(async (tx) => {
    const inserted = await tx
      .insert(schema.sites)
      .values({
        id: scope.key,
        villaId: scope.villa,
        environment: scope.environment,
        draft: content,
        published: content,
      })
      .onConflictDoNothing()
      .returning();
    if (inserted.length) {
      await tx.insert(schema.revisions).values({
        siteId: scope.key,
        revision: 1,
        content,
        actor: "operator",
        action: "seed",
      });
      await tx
        .insert(schema.audit)
        .values({ siteId: scope.key, actor: "operator", action: "seed" });
    }
  });
}
