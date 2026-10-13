import "server-only";
import {randomBytes,createHmac} from 'node:crypto';
import {compare} from 'bcryptjs';
import {TOTP} from 'otpauth';
import {and,eq,lt,sql} from 'drizzle-orm';
import type {NodePgDatabase} from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import {accountSettings} from '../security/settings';
import {consumeLoginAttempt,loginClient} from '../security/login-limit';
export const CHALLENGE_COOKIE='sodai-login-challenge';
export function authenticator(secret:string){return new TOTP({secret,algorithm:'SHA1',digits:6,period:30});}
export function loginChallengeRepository(database:NodePgDatabase<typeof schema>,settings:ReturnType<typeof accountSettings>){
 const digest=(s:string)=>createHmac('sha256',settings.secret).update(s).digest('hex');
 return {
 async begin(identifier:string,password:string,request:Request,now=new Date()){
  const account=settings.accounts.find(a=>a.id===identifier.trim().toLowerCase());
  if(!await consumeLoginAttempt(database,settings.secret,settings.scope.key,account?.id||'unknown','password:'+loginClient(request),now))return null;
  if(!password||Buffer.byteLength(password)>72||!await compare(password,account?.hash||settings.accounts[0].hash)||!account)return null;
  const token=randomBytes(32).toString('base64url');
  await database.transaction(async tx=>{
   await tx.delete(schema.loginChallenges).where(lt(schema.loginChallenges.expiresAt,now));
   await tx.insert(schema.loginChallenges).values({id:digest(token),siteId:settings.scope.key,account:account.id,version:settings.version,client:digest(loginClient(request)),expiresAt:new Date(now.getTime()+300000)});
  });return token;
 },
 async verify(token:string,code:string,request:Request,now=new Date()){
  if(!/^[A-Za-z0-9_-]{43}$/.test(token)||!/^\d{6}$/.test(code))return null;
  return database.transaction(async tx=>{
   const [c]=await tx.select().from(schema.loginChallenges).where(and(eq(schema.loginChallenges.id,digest(token)),eq(schema.loginChallenges.siteId,settings.scope.key))).for('update');
   if(!c||c.consumed||c.attempts>=5||c.expiresAt<=now||c.version!==settings.version||c.client!==digest(loginClient(request)))return null;
   await tx.update(schema.loginChallenges).set({attempts:c.attempts+1}).where(eq(schema.loginChallenges.id,c.id));
   const account=settings.accounts.find(a=>a.id===c.account);if(!account)return null;
   const otp=authenticator(account.totp),delta=otp.validate({token:code,timestamp:now.getTime(),window:1});
   if(delta===null)return null;
   const counter=Math.floor(now.getTime()/30000)+delta;
   const counterId=digest(JSON.stringify([settings.scope.key,account.id,account.totp]));
   const accepted=await tx.insert(schema.otpCounters).values({id:counterId,counter}).onConflictDoUpdate({target:schema.otpCounters.id,set:{counter},setWhere:sql`${schema.otpCounters.counter} < ${counter}`}).returning();
   if(!accepted.length)return null;
   await tx.update(schema.loginChallenges).set({consumed:true}).where(eq(schema.loginChallenges.id,c.id));return account;
  });
 }
 };
}
