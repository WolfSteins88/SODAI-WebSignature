import {PGlite} from '@electric-sql/pglite';
import {PGLiteSocketServer} from '@electric-sql/pglite-socket';
import {drizzle} from 'drizzle-orm/pglite';
import {migrate} from 'drizzle-orm/pglite/migrator';
import {mkdir,readFile,writeFile,cp,access} from 'node:fs/promises';
import path from 'node:path';
import {randomBytes} from 'node:crypto';
import {hash} from 'bcryptjs';
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {pathToFileURL} from 'node:url';
import {eq} from 'drizzle-orm';
import {deploymentScope} from '../src/lib/security/settings';
import {rejectHostedDemo} from '../src/lib/security/local-demo';
import * as schema from '../src/lib/db/schema';
import {seedContent} from '../src/lib/content/repository';
import {referenceDemoContent} from '../src/lib/content/signature-reference-demo';
import {demoContent} from '../src/lib/content/demo';
import {acquireDemoLock,announceDemo} from './local-demo-lifecycle';

export async function startLocalDemo({port=3112,variant='signature',dataset,adopt=true}:{port?:number;variant?:'signature'|'standard';dataset?:string;adopt?:boolean}={}) {
  rejectHostedDemo();
  if(!Number.isSafeInteger(port)||port<1024||port>65535)throw Error('LOCAL_DEMO_PORT must be an integer from 1024 to 65535.');
  try{await access(path.resolve('.next','BUILD_ID'));}catch{throw Error('Production build missing. Complete online setup: npm ci, then npm run build. Normal launch never installs or builds.');}
  if(dataset&&!/^[a-z0-9-]{1,60}$/.test(dataset))throw Error('Invalid isolated dataset name');
  for(const [key,value] of Object.entries({LOCAL_DEMO:'1',LOCAL_DEMO_RUNNER:'loopback-v1',MEDIA_PROVIDER:'filesystem',CONTENT_ENV:'local-demo'})) {
    if(process.env[key]&&process.env[key]!==value)throw Error('Incompatible '+key+'; remove the conflicting environment setting.');
  }
  await new Promise<void>((resolve,reject)=>{const probe=createServer();probe.once('error',()=>reject(Error(`Port ${port} is occupied; stop the existing review server first.`)));probe.listen(port,'127.0.0.1',()=>probe.close(()=>resolve()));});
  const root=path.resolve('local-data',dataset||variant),directory=path.join(root,'database');
  await mkdir(root,{recursive:true});
  let fresh=false;try{await access(directory);}catch{fresh=true;}
  const legacy=path.resolve('test-results','standard','cms-'+variant);
  if(fresh&&adopt&&!dataset){try{await access(legacy);await cp(legacy,directory,{recursive:true,errorOnExist:true,force:false});console.log('Adopted a copy of previous local CMS data; original store retained.');}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}}
  const secretsFile=path.join(root,'runtime-secrets.json');
  let secrets:{secret:string;hash:string};
  try{secrets=JSON.parse(await readFile(secretsFile,'utf8'));}
  catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;secrets={secret:randomBytes(32).toString('base64url'),hash:await hash('admin',12)};await writeFile(secretsFile,JSON.stringify(secrets),{flag:'wx',mode:0o600});}
  const env:NodeJS.ProcessEnv={...process.env,NODE_ENV:'production',NETLIFY:'false',CONTEXT:'local',CONTENT_ENV:'local-demo',SITE_ID:'local-demo-'+variant,TEMPLATE_VARIANT:variant,CONTENT_MODE:'live',LOCAL_DEMO:'1',LOCAL_DEMO_RUNNER:'loopback-v1',MEDIA_PROVIDER:'filesystem',LOCAL_DEMO_DATA_DIR:root,LOCAL_DEMO_PASSWORD_HASH:secrets.hash,AUTH_SECRET:secrets.secret,AUTH_SESSION_VERSION:'local-demo-v1',AUTH_URL:`http://localhost:${port}`,DATABASE_URL:'postgresql://postgres@127.0.0.1:1/postgres',SIGNATURE_REFERENCE_COMPARISON:'0'};
  delete env.NEXT_DIST_DIR;
  const lock=path.join(root,'running.lock'),releaseLock=await acquireDemoLock(lock);
  let engine:PGlite|undefined,socket:PGLiteSocketServer|undefined,child:ReturnType<typeof spawn>|undefined,unannounce:(()=>Promise<void>)|undefined,stopped:Promise<void>|undefined;
  const stop=()=>stopped ||= (async()=>{
    try{await unannounce?.();}
    finally{
      try{if(child&&child.exitCode===null&&child.signalCode===null){const exited=new Promise(r=>child!.once('exit',r));child.kill();await exited;}}
      finally{try{await socket?.stop();}finally{try{await engine?.close();}finally{await releaseLock();}}}
    }
    if(process.connected)process.send?.({type:'stopped'});
  })();
  try {
  const scope=deploymentScope(env);engine=new PGlite(directory);const database=drizzle(engine,{schema});
  await migrate(database,{migrationsFolder:'drizzle'});
  if(fresh&&adopt&&!dataset){
    const oldScope=deploymentScope({NODE_ENV:'production',SITE_ID:variant+'-fixture',CONTENT_ENV:'test',CONTEXT:'local'});
    const old=await database.query.sites.findFirst({where:eq(schema.sites.id,oldScope.key)});
    if(old)await database.transaction(async tx=>{
      await tx.insert(schema.sites).values({...old,id:scope.key,villaId:scope.villa,environment:scope.environment}).onConflictDoNothing();
      for(const table of [schema.revisions,schema.audit,schema.archivedContent])await tx.update(table).set({siteId:scope.key}).where(eq(table.siteId,oldScope.key));
      await tx.update(schema.media).set({siteId:scope.key,namespace:scope.namespace}).where(eq(schema.media.siteId,oldScope.key));
    });
  }
  await seedContent(database as any,scope,variant==='signature'?referenceDemoContent:demoContent);
  socket=new PGLiteSocketServer({db:engine,port:0,host:'127.0.0.1',maxConnections:10});await socket.start();
  env.DATABASE_URL=`postgresql://postgres@${socket.getServerConn()}/postgres?sslmode=disable`;
  child=spawn(process.execPath,[path.resolve('node_modules/next/dist/bin/next'),'start','--hostname','127.0.0.1','--port',String(port)],{env,windowsHide:true,stdio:['ignore','pipe','pipe']});
  let logs='',spawnError:Error|undefined;child.on('error',error=>{spawnError=error;});
  child.stdout!.on('data',v=>{logs=(logs+v).slice(-65536);if(process.env.LOCAL_DEMO_VISIBLE_LOGS==='1')process.stdout.write(v);});child.stderr!.on('data',v=>{logs=(logs+v).slice(-65536);if(process.env.LOCAL_DEMO_VISIBLE_LOGS==='1')process.stderr.write(v);});
  const origin=`http://localhost:${port}`;let ready=false;
  for(let i=0;i<150;i++){if(spawnError)throw spawnError;if(child.exitCode!==null)throw Error('Local server exited: '+logs);try{if((await fetch(origin+'/admin/login',{signal:AbortSignal.timeout(1000)})).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}
  if(!ready){await stop();throw Error('Local server unavailable: '+logs);}
  unannounce=await announceDemo(root,port,stop);
  child.once('exit',code=>{if(!stopped){console.error(`Local website exited unexpectedly (${code}). Restart the demo after reviewing its logs.`);process.exitCode=1;void stop().catch(console.error);}});
  return {origin,root,scope,database,env,stop,logs:()=>logs};
  } catch(error){await stop();throw error;}
}
async function main(){
  let fixture:Awaited<ReturnType<typeof startLocalDemo>>|undefined,requested=false;
  const shutdown=async()=>{requested=true;if(!fixture)return;await fixture.stop();process.exit(process.exitCode||0);};
  process.on('SIGINT',()=>void shutdown());process.on('SIGTERM',()=>void shutdown());
  process.on('message',message=>{if(message&&typeof message==='object'&&'type' in message&&message.type==='stop')void shutdown();});
  if(process.connected)process.on('disconnect',()=>void shutdown());
  fixture=await startLocalDemo({dataset:process.env.LOCAL_DEMO_DATASET,port:Number(process.env.LOCAL_DEMO_PORT||3112)});
  if(requested){await shutdown();return;}
  console.log(`Offline local demo: ${fixture.origin}/admin/login — persistent PostgreSQL + filesystem images. Ctrl+C to stop.`);
  process.send?.({type:'ready',origin:fixture.origin});
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)void main().catch(e=>{console.error(e instanceof Error?e.message:'Local demo failed');process.exitCode=1;if(process.connected)process.disconnect?.();});
