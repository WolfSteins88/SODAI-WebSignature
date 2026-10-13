import {requireAccess,requireOrigin,apiError,HttpError} from '@/lib/security/access';
import {boundedBytes,boundedJSON} from '@/lib/security/body';
import {normalizeImage,mediaStore} from '@/lib/storage/media';
import {scopedMedia,listMedia,mediaReferences,mediaAudit} from '@/lib/storage/repository';
import {db} from '@/lib/db';import {media,sites} from '@/lib/db/schema';import {scope} from '@/lib/config';import {and,eq} from 'drizzle-orm';import {z} from 'zod';
export const runtime='nodejs';export const dynamic='force-dynamic';
const headers={'Cache-Control':'private, no-store'};
export async function GET(){try{await requireAccess();return Response.json({items:await listMedia()},{headers});}catch(e){return apiError(e);}}
export async function POST(request:Request){try{
 const principal=await requireAccess();requireOrigin(request);
 const image=await normalizeImage(await boundedBytes(request,4*1024*1024));
 const id=crypto.randomUUID(),key=id+'.webp';
 let filename=request.headers.get('x-file-name')||'Uploaded image';try{filename=decodeURIComponent(filename);}catch{}
 const name=filename.replace(/[^\w .-]/g,'').slice(0,160)||'Uploaded image';
 await db().insert(media).values({id,key,namespace:scope.namespace,siteId:scope.key,name,mime:image.mime,width:image.width,height:image.height,bytes:image.bytes.length});
 try{await mediaStore().set(key,new Uint8Array(image.bytes).buffer,{metadata:{scope:scope.key,mime:image.mime,width:image.width,height:image.height}});}
 catch{throw new HttpError(503,'Image storage unavailable. Upload was not marked ready; retry or clean up the pending item.');}
 await db().update(media).set({ready:true}).where(and(eq(media.id,id),eq(media.siteId,scope.key)));
 await mediaAudit(principal,'media-upload',id);return Response.json({item:await scopedMedia(id)},{headers,status:201});
}catch(e){return apiError(e);}}
export async function PATCH(request:Request){try{
 const principal=await requireAccess();requireOrigin(request);
 const b=z.object({id:z.uuid(),alt:z.string().max(300),caption:z.string().max(600),focalPoint:z.object({x:z.number().min(0).max(100),y:z.number().min(0).max(100)}),archived:z.boolean()}).partial().required({id:true}).strict().parse(await boundedJSON(request,4096));await scopedMedia(b.id);
 await db().transaction(async tx=>{await tx.update(media).set({...b,id:undefined}).where(and(eq(media.id,b.id),eq(media.siteId,scope.key)));await tx.insert((await import('@/lib/db/schema')).audit).values({siteId:scope.key,actor:principal.id,action:b.archived?'media-archive':'media-update',details:{id:b.id}});});return Response.json({item:await scopedMedia(b.id)},{headers});
}catch(e){return apiError(e);}}
export async function DELETE(request:Request){try{
 const principal=await requireAccess();requireOrigin(request);const b=z.object({id:z.uuid()}).strict().parse(await boundedJSON(request,1024));let item;try{item=await scopedMedia(b.id);}catch(e){if(e instanceof HttpError&&e.status===404)return Response.json({deleted:true},{headers});throw e;}
 if(!item.ready&&Date.now()-item.createdAt.getTime()<900000)throw new HttpError(409,'Wait fifteen minutes before cleaning up an incomplete upload. It may still be in progress.');
 await db().transaction(async tx=>{
  await tx.select().from(sites).where(eq(sites.id,scope.key)).for('update');
  const refs=await mediaReferences(b.id,tx);if(refs.draft||refs.published||refs.revisions||refs.archives)throw new HttpError(409,'Referenced image cannot be deleted. Archive it instead.');
  await tx.update(media).set({ready:false,archived:true}).where(and(eq(media.id,b.id),eq(media.siteId,scope.key)));
 });
 await mediaStore().delete(item.key);
 await db().delete(media).where(and(eq(media.id,b.id),eq(media.siteId,scope.key)));await mediaAudit(principal,'media-delete',b.id);return Response.json({deleted:true},{headers});
}catch(e){return apiError(e);}}
