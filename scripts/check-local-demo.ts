import assert from 'node:assert/strict';
import sharp from 'sharp';
import {spawn} from 'node:child_process';
import path from 'node:path';
import {writeFile,access} from 'node:fs/promises';
import {startLocalDemo} from './demo-local';
async function main(){
const dataset='verification-'+Date.now(),port=3116;
let server=await startLocalDemo({dataset,port,adopt:false});
const jar=new Map<string,string>();
async function req(url:string,init:RequestInit={},authenticated=true){console.log((init.method||'GET')+' '+url);const r=await fetch(server.origin+url,{signal:AbortSignal.timeout(25000),...init,redirect:'manual',headers:{...init.headers,...(authenticated?{cookie:[...jar].map(([k,v])=>k+'='+v).join('; ')}:{}),origin:server.origin}});if(authenticated)for(const c of r.headers.getSetCookie()){const p=c.split(';')[0],i=p.indexOf('=');jar.set(p.slice(0,i),p.slice(i+1));}return r;}
async function login(password='admin'){const {csrfToken}=await(await req('/api/auth/csrf')).json();return req('/api/auth/callback/credentials',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({csrfToken,identifier:'admin',password,callbackUrl:server.origin+'/admin'})});}
async function mutate(action:string,expected:number,content?:unknown,status=200){const r=await req('/api/admin/content',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,expected,content})});const j=await r.json();assert.equal(r.status,status,JSON.stringify(j));return j;}
const completed:string[]=[];
try{
 assert.equal((await req('/api/admin/content',{},false)).status,401);await login('wrong');assert.equal((await req('/api/auth/session')).status,200);assert.equal((await(await req('/api/auth/session')).json())?.user,undefined);
 await login();assert.equal((await(await req('/api/auth/session')).json()).user.role,'super_admin');completed.push('Real Auth.js admin login, wrong password rejection, anonymous API rejection');
 const state=await(await req('/api/admin/content')).json(),original=await(await req('/')).text();
 const png=await sharp({create:{width:640,height:480,channels:3,background:'#789182'}}).png().toBuffer();
 const upload=await req('/api/admin/media',{method:'POST',headers:{'Content-Type':'image/png','X-File-Name':'offline-test.png'},body:new Uint8Array(png)});const uploaded=await upload.json();assert.equal(upload.status,201,JSON.stringify(uploaded));assert.equal(uploaded.item.ready,true);
 const url='/api/media/'+uploaded.item.id;
 assert.equal((await req(url,{},false)).status,404);assert.equal((await req(url+'?draft=1',{},false)).status,401);assert.equal((await req(url+'?draft=1')).status,200);
 const draft=structuredClone(state.draft),image={src:url,alt:'Fictional bay test photograph',category:'Spaces'};
 draft.name='Fictional Bay Retreat';draft.tagline='A locally published replacement';draft.heroTitle='Welcome to Fictional Bay';draft.hero=image;draft.branding={useSharedSlots:true,logo:image,emblem:image,wordmark:image,useSharedHero:true};
 draft.signatureMenu.legal='Fictional Bay Retreat';draft.signatureMenu.social=[{id:'local-instagram',platform:'instagram',order:0,enabled:false,url:'https://www.instagram.com/fictionalbay_demo/'}];
 draft.navigation ||= [{id:'nav-home',route:'/',label:'Our Story',visible:true,order:0},{id:'nav-rooms',route:'/rooms',label:'Bungalows',visible:true,order:1}];draft.pages ||= [{id:'page-home',route:'/',enabled:true,title:draft.name,description:'A local villa demonstration'}];
 const nav=draft.navigation.find((x:any)=>x.route==='/rooms');nav.label='Bay Cottages';
 const panel=structuredClone(draft.signatureStory.sections.find((x:any)=>x.layout==='editorial'))||structuredClone(draft.signatureStory.sections[1]);panel.id='local-added-panel';panel.enabled=false;draft.signatureStory.sections.splice(2,0,panel);const moved=draft.signatureStory.sections.pop();draft.signatureStory.sections.splice(3,0,moved);
 if(draft.rooms[0].signature?.gallery?.[0])draft.rooms[0].signature.gallery[0].image=image;
 if(draft.rooms[0].signature?.photoGrid?.[0])draft.rooms[0].signature.photoGrid[0].image=image;
 const home=draft.pages.find((x:any)=>x.route==='/');home.title='Fictional Bay Retreat';home.description='An offline replacement villa demonstration.';
 draft.culture.introTitle='Island rituals at Fictional Bay';
 const saved=await mutate('save',state.revision,draft);await mutate('save',state.revision,draft,409);
 assert.equal((await(await req('/api/admin/content')).json()).draft.name,draft.name);assert.ok((await(await req('/')).text()).includes(state.draft.heroTitle));assert.ok(!(await(await req('/')).text()).includes(draft.heroTitle));
 const preview=await(await req('/preview')).text();assert.ok(preview.includes(draft.name));assert.ok(preview.includes(draft.heroTitle));assert.equal((await req('/preview',{},false)).status,307);
 completed.push('Real PNG upload, private bytes, structured identity/hero/nav/Story/social/Culture draft, reload, private preview, public isolation and stale revision conflict');
 await mutate('publish',saved.revision);const html=await(await req('/')).text();assert.ok(html.includes(draft.name));assert.ok(html.includes(draft.heroTitle));assert.ok(html.includes('Bay Cottages'));assert.ok(html.includes(url));assert.ok(!html.includes('href="https://www.instagram.com/fictionalbay_demo/"'));assert.ok((await(await req('/cultures')).text()).includes(draft.culture.introTitle));const stored=(await(await req('/api/admin/content')).json()).draft;assert.deepEqual(stored.signatureStory.sections.map((x:any)=>[x.id,x.enabled]),draft.signatureStory.sections.map((x:any)=>[x.id,x.enabled]));assert.equal(stored.rooms[0].signature.gallery[0].image.src,url);
 const publishedBytes=Buffer.from(await(await req(url,{},false)).arrayBuffer());assert.ok(publishedBytes.length>0);
 const deletion=await req('/api/admin/media',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:uploaded.item.id})});assert.equal(deletion.status,409);
 const history=await(await req('/api/admin/history')).json();const restore=history.revisions.find((x:any)=>x.action==='save');assert.ok(restore);await mutate('restore',saved.revision,restore.id);assert.ok((await(await req('/')).text()).includes(draft.heroTitle));
 completed.push('Atomic publication, rendered replacement branding/hero/menu/metadata, public bytes, referenced image delete rejection, restore stays draft');
 await server.stop();jar.clear();
 if(process.env.LOCAL_DEMO_VERIFY_REBUILD==='1'){console.log('Rebuilding with the verification dataset stopped and preserved');await new Promise<void>((resolve,reject)=>{const child=spawn(process.execPath,[path.resolve('node_modules/next/dist/bin/next'),'build','--webpack'],{stdio:'inherit',windowsHide:true});child.once('exit',code=>code===0?resolve():reject(Error('Rebuild failed')));child.once('error',reject);});completed.push('Production rebuild with stored data retained');}
 server=await startLocalDemo({dataset,port,adopt:false});await login();assert.ok((await(await req('/')).text()).includes(draft.heroTitle));assert.deepEqual(Buffer.from(await(await req(url,{},false)).arrayBuffer()),publishedBytes);completed.push('Server restart and idempotent startup preserve content and exact uploaded bytes');
 const {csrfToken}=await(await req('/api/auth/csrf')).json();await req('/api/auth/signout',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({csrfToken})});assert.equal((await req('/api/admin/content')).status,401);completed.push('Logout invalidates browser session');
 await server.stop();
 const backupName='verification-'+Date.now(),restoredDataset=backupName+'-restored';
 const copy=async(action:string,datasetName:string)=>new Promise<void>((resolve,reject)=>{const child=spawn(process.execPath,['--import','tsx','scripts/demo-backup.ts',action,backupName],{env:{...process.env,LOCAL_DEMO_DATASET:datasetName},stdio:'inherit',windowsHide:true});child.once('exit',code=>code===0?resolve():reject(Error('Backup/restore failed')));});
 await copy('backup',dataset);await assert.rejects(access(path.resolve('local-data','backups',backupName,'runtime-secrets.json')));await copy('restore',restoredDataset);jar.clear();server=await startLocalDemo({dataset:restoredDataset,port,adopt:false});await login();assert.ok((await(await req('/')).text()).includes(draft.heroTitle));assert.deepEqual(Buffer.from(await(await req(url,{},false)).arrayBuffer()),publishedBytes);completed.push('Stopped-store backup/restore pairs real PostgreSQL content and bytes, excludes auth secrets and regenerates a valid local login');
 await writeFile('docs/m5-local-demo-checks.json',JSON.stringify({dataset,port,completed,limits:['Local API checks; not a Netlify integration or browser network-off test.','Production rebuild persistence checked separately.']},null,2));console.log(completed.join('\n'));
}catch(e){console.error(server.logs());throw e;}finally{await server.stop();}

}
void main().catch(e=>{console.error(e);process.exitCode=1;});

