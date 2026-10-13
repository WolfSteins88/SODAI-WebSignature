import {requireAccess,apiError} from '@/lib/security/access';import {contentRepository} from '@/lib/content/repository';import {db} from '@/lib/db';import {scope} from '@/lib/config';
export const dynamic='force-dynamic';
export async function GET(){try{const p=await requireAccess(),r=contentRepository(db(),scope);return Response.json({revisions:await r.history(p),archives:await r.archives(p)},{headers:{'Cache-Control':'private, no-store'}});}catch(e){return apiError(e);}}
