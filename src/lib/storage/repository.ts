import 'server-only';
import {and,eq,desc} from 'drizzle-orm';
import {db} from '../db';import * as schema from '../db/schema';
import {scope} from '../config';import {HttpError} from '../security/errors';
import type {Principal} from '../security/roles';
import {mediaIds} from '../content/repository';
export async function mediaReferences(id:string,database:Pick<ReturnType<typeof db>,'query'|'select'>=db()){
 const state=await database.query.sites.findFirst({where:eq(schema.sites.id,scope.key)});
 const revisions=await database.select({content:schema.revisions.content}).from(schema.revisions).where(eq(schema.revisions.siteId,scope.key));
 const archives=await database.select().from(schema.archivedContent).where(eq(schema.archivedContent.siteId,scope.key));
 return {draft:!!state&&mediaIds(state.draft).includes(id),published:!!state&&mediaIds(state.published).includes(id),revisions:revisions.filter(r=>mediaIds(r.content).includes(id)).length,archives:archives.filter(a=>JSON.stringify(a.value).includes('/api/media/'+id)).length};
}
export async function scopedMedia(id:string){
 if(!/^[0-9a-f-]{36}$/.test(id))throw new HttpError(404,'Image unavailable.');
 const item=await db().query.media.findFirst({where:and(eq(schema.media.id,id),eq(schema.media.siteId,scope.key),eq(schema.media.namespace,scope.namespace))});
 if(!item)throw new HttpError(404,'Image unavailable.');return item;
}
export async function listMedia(){return db().select().from(schema.media).where(and(eq(schema.media.siteId,scope.key),eq(schema.media.namespace,scope.namespace))).orderBy(desc(schema.media.createdAt)).limit(500);}
export async function mediaAudit(principal:Principal,action:string,id:string){await db().insert(schema.audit).values({siteId:scope.key,actor:principal.id,action,details:{id}});}
