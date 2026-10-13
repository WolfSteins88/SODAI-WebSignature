// Run: node docs/reference-hero-continuity/verify-capture.mjs
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const folder=new URL('./final/',import.meta.url),results=[];
for(const name of ['forward','reverse','slow','failure']){
 const profile=JSON.parse(readFileSync(new URL(`${name}-profile.json`,folder),'utf8'));
 const marks=profile.entries.filter(e=>e.entryType==='mark');
 const at=n=>marks.find(e=>e.name===`hero-morph:${n}`)?.startTime;
 const first=at('intent'),last=at('cleanup');
 assert.ok(Number.isFinite(first)&&Number.isFinite(last),`${name}: complete lifecycle`);
 assert.equal(marks.filter(e=>e.name==='hero-morph:commit').length,1,`${name}: one route commit`);
 const frames=profile.frames.filter(f=>f.time>=first&&f.time<=last&&f.hero);
 const width=f=>{const s=f.hero.frame||'';return parseFloat(s.match(/width: ([+\deE.-]+)px/)?.[1])-parseFloat(s.match(/clip-path: inset\(0px ([+\deE.-]+)px/)?.[1]);};
 const shrunk=frames.filter(f=>f.time>=at('shrink-end'));
 for(const f of shrunk){assert.equal(f.hero.copy,null,`${name}: source snapshot never restored`);assert.equal(f.hero.background,'1',`${name}: background retained`);assert.ok(f.hero.images.length>0,`${name}: frame is never empty`);}
 let previous=Infinity;for(const f of frames.filter(f=>f.heroPhase==='shrink')){const w=width(f);assert.ok(w<=previous+.05,`${name}: source never expands during shrink`);previous=w;}
 if(name!=='failure'){
  assert.equal(marks.filter(e=>e.name.startsWith('hero-morph:fallback:')).length,0,`${name}: full choreography`);
  const blends=frames.filter(f=>f.heroPhase==='blend');assert.ok(blends.length>0,`${name}: swap rendered`);
  const swapWidth=width(blends[0]);for(const f of blends){assert.equal(f.hero.images.length,2,`${name}: two images in one plane`);assert.ok(Math.abs(width(f)-swapWidth)<.05,`${name}: identical blend geometry`);}
  previous=0;for(const f of frames.filter(f=>f.heroPhase==='expand')){const w=width(f);assert.ok(w>=previous-.05,`${name}: destination expands continuously`);previous=w;}
  assert.ok(at('aligned')>at('expand'),`${name}: final alignment precedes cleanup`);
 }else{
  assert.ok(marks.some(e=>e.name==='hero-morph:fallback:destination-image-unavailable'));
  for(const f of shrunk)assert.ok(width(f)<profile.viewport[0]*.31,`${name}: failed source never returns fullscreen`);
 }
 results.push({name,capturedFrames:frames.length,intentToCleanup:last-first,passed:true});
}
writeFileSync(new URL('invariants.json',folder),JSON.stringify(results,null,2));console.log(results);
