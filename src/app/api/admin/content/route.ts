import {z} from 'zod';
import {requireAccess,requireOrigin,apiError} from '@/lib/security/access';
import {boundedJSON} from '@/lib/security/body';
import {draftState,mutateContent} from '@/lib/content/service';
import {revalidatePath} from 'next/cache';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(){try{return Response.json(await draftState(),{headers:{'Cache-Control':'private, no-store'}});}catch(e){return apiError(e);}}
export async function POST(request:Request){try{
 await requireAccess();requireOrigin(request);
 const input=z.object({action:z.enum(['save','publish','restore','archive','unarchive','refresh']),expected:z.number().int().positive(),content:z.unknown().optional()}).strict().parse(await boundedJSON(request));
 let result;
 if(input.action==='refresh'){const state=await draftState();result={revision:state.revision,publishedRevision:state.publishedRevision};}
 else result=await mutateContent(input.action,input.expected,input.content);
 let cacheRefreshPending=false;
 if(input.action==='publish'||input.action==='refresh')try{revalidatePath('/','layout');}catch{cacheRefreshPending=true;}
 return Response.json({...result,cacheRefreshPending},{headers:{'Cache-Control':'private, no-store'}});
}catch(e){return apiError(e);}}
