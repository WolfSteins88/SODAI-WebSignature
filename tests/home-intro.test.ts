import {test} from 'node:test';
import assert from 'node:assert/strict';
import {runInNewContext} from 'node:vm';
import {homeIntroBootstrap} from '../src/components/signature/home-intro-bootstrap';

function boot(path:string,type='navigate'){
 const dataset:Record<string,string>={},timers:{fn:()=>void;ms:number}[]=[],events:string[]=[];
 runInNewContext(homeIntroBootstrap,{document:{documentElement:{dataset}},location:{pathname:path},performance:{getEntriesByType:()=>[{type}]},setTimeout:(fn:()=>void,ms:number)=>timers.push({fn,ms}),dispatchEvent:(e:Event)=>events.push(e.type),addEventListener:()=>{},removeEventListener:()=>{},Event});
 return {dataset,timers,events};
}
test('Homepage intro eligibility excludes admin, preview, deep links and history restoration',()=>{
 for(const path of ['/admin','/preview','/preview/','/dining','/cultures'])assert.equal(boot(path).dataset.signatureIntro,undefined);
 assert.equal(boot('/','back_forward').dataset.signatureIntro,undefined);
 for(const type of ['navigate','reload'])assert.equal(boot('/',type).dataset.signatureIntro,'pending');
});
test('Bootstrap releases the overlay when hydration/assets never finish and preserves completed marker',()=>{
 const pending=boot('/');assert.equal(pending.timers[0].ms,10000);pending.timers[0].fn();
 assert.equal(pending.dataset.signatureIntro,'done');assert.deepEqual(pending.events,['sodai:signature-intro-expired']);
 const complete=boot('/');complete.dataset.signatureIntro='done';complete.timers[0].fn();assert.deepEqual(complete.events,[]);
 // Returning Home in the same document retains done; SPA routing never reruns bootstrap.
 assert.equal(complete.dataset.signatureIntro,'done');
});
