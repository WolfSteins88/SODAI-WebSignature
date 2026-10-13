import {requireAccess,apiError} from '@/lib/security/access';import {scopedMedia,mediaReferences} from '@/lib/storage/repository';
export const dynamic='force-dynamic';
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){try{await requireAccess();const {id}=await params;await scopedMedia(id);return Response.json(await mediaReferences(id),{headers:{'Cache-Control':'private, no-store'}});}catch(e){return apiError(e);}}
