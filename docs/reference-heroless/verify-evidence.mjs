import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const dir=fileURLToPath(new URL('./',import.meta.url));
const read=name=>JSON.parse(fs.readFileSync(dir+name,'utf8'));
const summary={};
for(const tag of ['gallery-story','story-gallery','gallery-terms','terms-gallery']){
 const shots=read(`final/${tag}-shots.json`),data=read(`final/${tag}-profile.json`);
 assert.equal(shots.at(-1).layers,0,tag+' cleanup');
 assert.ok(shots.every(s=>s.layers<=1&&!s.fallback),tag+' one layer/no fallback');
 if(tag==='gallery-terms'||tag==='terms-gallery')assert.ok(shots.every(s=>!s.frame),tag+' never creates photo frame');
 for(const shot of shots.filter(s=>s.phase==='await-ready')){
  if(tag.startsWith('gallery')||tag==='terms-gallery')assert.match(shot.copy,/opacity: 0\.15;/,tag+' outgoing coverage while waiting');
 }
 const frames=data.frames,intervals=frames.slice(1).flatMap((b,i)=>b.heroPhase&&frames[i].heroPhase&&!b.hidden&&!frames[i].hidden?[b.time-frames[i].time]:[]).sort((a,b)=>a-b);
 const marks=data.entries.filter(e=>e.name?.startsWith('hero-morph:'));
 const at=name=>marks.find(e=>e.name===`hero-morph:${name}`)?.startTime;
 assert.equal(marks.filter(e=>e.name==='hero-morph:commit').length,1,tag+' single commit');
 const round=n=>Math.round(n*100)/100;
 summary[tag]={viewport:data.viewport,dpr:data.dpr,userAgent:data.userAgent,totalMs:round(at('cleanup')-at('intent')),readinessWaitMs:round(Math.max(0,(at('blend')??at('dissolve')??at('content-reveal'))-at('shrink-end'))),activeIntervals:intervals.length,medianMs:round(intervals[Math.floor(intervals.length/2)]),p95Ms:round(intervals[Math.floor(intervals.length*.95)]),maxMs:round(Math.max(...intervals)),above16_7:intervals.filter(n=>n>16.7).length,longTasks:data.entries.filter(e=>e.entryType==='longtask'),longAnimationFrames:data.entries.filter(e=>e.entryType==='long-animation-frame'),phases:marks.map(e=>e.name)};
}
for(const row of read('matrix.json')){
 const final=row.samples.at(-1);
 assert.equal(final.layers,0,row.tag);assert.equal(final.owners,0,row.tag);
 assert.equal(final.lock,'',row.tag);assert.equal(final.mainInert,false,row.tag);
 assert.ok(row.samples.every(s=>s.layers<=1&&!s.fallback),row.tag);
}
fs.writeFileSync(dir+'final/performance-summary.json',JSON.stringify(summary,null,2));
console.log(JSON.stringify(summary,null,2));
