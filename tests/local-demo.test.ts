import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp} from 'node:fs/promises';
import path from 'node:path';
import {localDemoConfig} from '../src/lib/security/local-demo';
import {filesystemMediaStore} from '../src/lib/storage/local';
import {resolveBranding} from '../src/lib/content/branding';
import {referenceDemoContent} from '../src/lib/content/signature-reference-demo';
test('local demo configuration fails closed in hosted contexts and requires isolated loopback configuration',()=>{
 const env:NodeJS.ProcessEnv={NODE_ENV:'production',LOCAL_DEMO:'1',LOCAL_DEMO_RUNNER:'loopback-v1',NETLIFY:'false',CONTEXT:'local',SITE_ID:'local-demo-signature',CONTENT_ENV:'local-demo',MEDIA_PROVIDER:'filesystem',LOCAL_DEMO_DATA_DIR:path.resolve('local-data','guard-test'),AUTH_URL:'http://localhost:3112',DATABASE_URL:'postgresql://postgres@127.0.0.1:1234/postgres'};
 assert.ok(localDemoConfig(env));
 for(const override of [{NETLIFY:'true'},{CONTEXT:'production'},{CONTEXT:'deploy-preview'},{DEPLOY_ID:'hosted'},{AWS_LAMBDA_FUNCTION_NAME:'hosted'},{VERCEL:'1'},{LOCAL_DEMO_RUNNER:''},{AUTH_URL:'https://example.com'},{LOCAL_DEMO_DATA_DIR:path.resolve('test-results')},{LOCAL_DEMO:'0'}])assert.throws(()=>localDemoConfig({...env,...override}));
 assert.equal(localDemoConfig({NODE_ENV:'production'}),null);
});
test('filesystem images are immutable, namespaced and persistent across store instances',async()=>{
 const root=await mkdtemp(path.resolve('test-results','local-media-'));const ns='villa-'+'a'.repeat(64),key=crypto.randomUUID()+'.webp',bytes=Uint8Array.from([1,2,3]).buffer;
 const first=filesystemMediaStore(root,ns);await first.set(key,bytes);await assert.rejects(first.set(key,bytes));
 assert.deepEqual(await filesystemMediaStore(root,ns).get(key),bytes);
 assert.equal(await filesystemMediaStore(root,'villa-'+'b'.repeat(64)).get(key),null);
 await assert.rejects(first.get('../escape'));assert.throws(()=>filesystemMediaStore(root,'../escape'));
 await first.delete(key);await first.delete(key);assert.equal(await first.get(key),null);
});
test('shared branding resolves all identity slots without altering persisted content or fixed geometry',()=>{
 const raw=structuredClone(referenceDemoContent);raw.branding={useSharedSlots:true,logo:null,emblem:null,wordmark:null,useSharedHero:true};raw.name='Fictional Bay';raw.heroTitle='A new beginning';
 const resolved=resolveBranding(raw);assert.equal(resolved.signatureMenu?.logo.src,'/images/neutral-brand.svg');assert.equal(resolved.signatureMenu?.introBrand,undefined);assert.equal(resolved.signatureStory?.railEmblem,undefined);
 assert.equal(resolved.signatureStory?.sections.find(p=>p.layout==='opener')?.title,'A new beginning');assert.notEqual(raw.signatureMenu?.logo.src,resolved.signatureMenu?.logo.src);
});
