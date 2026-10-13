import {z} from 'zod';
import {cookies} from 'next/headers';
import {requireOrigin,apiError,HttpError} from '@/lib/security/access';
import {boundedJSON} from '@/lib/security/body';
import {loginChallengeRepository,CHALLENGE_COOKIE} from '@/lib/auth/totp';
import {accountSettings} from '@/lib/security/settings';
import {db} from '@/lib/db';
import {siteUrl} from '@/lib/config';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function POST(request:Request){try{
 requireOrigin(request);
 if(accountSettings().localDemo||accountSettings().passwordOnly)throw new HttpError(409,"Use password sign-in.");
 const b=z.object({identifier:z.string().min(1).max(120),password:z.string().min(1).max(72)}).strict().parse(await boundedJSON(request,2048));
 const token=await loginChallengeRepository(db(),accountSettings()).begin(b.identifier,b.password,request);
 if(!token)throw new HttpError(401,'Sign-in failed. Check your credentials or try again later.');
 (await cookies()).set(CHALLENGE_COOKIE,token,{httpOnly:true,secure:new URL(siteUrl).protocol==='https:',sameSite:'strict',path:'/api/auth',maxAge:300});
 return Response.json({next:'authenticator'},{headers:{'Cache-Control':'private, no-store'}});
}catch(e){return apiError(e);}}
