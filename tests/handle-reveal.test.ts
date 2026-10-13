import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readyImage} from '../src/components/signature/handle-reveal';

class ImageFixture extends EventTarget {
  complete=false;
  naturalWidth=0;
  decode=()=>Promise.resolve();
  get image(){return this as unknown as HTMLImageElement;}
}

test('hero preparation waits for both load and decode before releasing the source',async()=>{
  const fixture=new ImageFixture(),abort=new AbortController();
  let decode!:()=>void,settled=false;
  fixture.decode=()=>new Promise<void>(resolve=>{decode=resolve;});
  const ready=readyImage(fixture.image,abort.signal).then(value=>{settled=true;return value;});
  await Promise.resolve();assert.equal(settled,false);
  fixture.naturalWidth=1800;fixture.dispatchEvent(new Event('load'));
  await Promise.resolve();assert.equal(settled,false);
  decode();assert.equal(await ready,true);
});

test('interrupted or broken image preparation resolves without a stale reveal',async()=>{
  const fixture=new ImageFixture(),abort=new AbortController();
  const pending=readyImage(fixture.image,abort.signal);abort.abort();assert.equal(await pending,false);
  fixture.complete=true;assert.equal(await readyImage(fixture.image,new AbortController().signal),false);
  fixture.complete=false;
  const failed=readyImage(fixture.image,new AbortController().signal);fixture.dispatchEvent(new Event('error'));assert.equal(await failed,false);
});

test('a decode rejection and a bounded stalled image are recoverable',async()=>{
  const fixture=new ImageFixture();fixture.complete=true;fixture.naturalWidth=1200;fixture.decode=()=>Promise.reject(new Error('broken'));
  assert.equal(await readyImage(fixture.image,new AbortController().signal),false);
  fixture.complete=false;
  assert.equal(await readyImage(fixture.image,new AbortController().signal,1),false);
});
