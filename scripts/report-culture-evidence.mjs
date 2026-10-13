import sharp from 'sharp';
import {readFile,writeFile} from 'node:fs/promises';
const dir='docs/reference-culture';
for(const [n,ref,after,label] of [[1,'frame-000.jpg','after-listing-hero.jpg','Listing hero / reference 0s'],[2,'frame-008.jpg','after-listing.jpg','Listing / reference 8s (scroll offset differs)'],[3,'frame-040.jpg','after-kuningan-cream.png','Kuningan cream / reference 40s']]) {
const inputs=[];
for (const f of [ref,after]) {const m=await sharp(`${dir}/${f}`).metadata(); inputs.push(await sharp(`${dir}/${f}`).extract({left:0,top:0,width:Math.min(1688,m.width),height:1080}).resize(844,540).toBuffer());}
const header=Buffer.from(`<svg width="1688" height="40"><rect width="1688" height="40" fill="#222"/><text x="12" y="27" fill="white" font-size="20">${n}. ${label} | Reference left; implementation right; common left 1688px crop</text></svg>`);
await sharp({create:{width:1688,height:580,channels:3,background:'#222'}}).composite([{input:header,left:0,top:0},{input:inputs[0],left:0,top:40},{input:inputs[1],left:844,top:40}]).png().toFile(`${dir}/comparison-0${n}.png`);
}
const summaries=[];
for(const name of ['scroll','menu']) {const d=JSON.parse(await readFile(`${dir}/performance-${name}.json`,'utf8')); const values=d.frames.slice(1).map((f,i)=>f.time-d.frames[i].time).sort((a,b)=>a-b);const s={name,durationMs:d.end-d.start,frames:values.length,medianMs:values[Math.floor(values.length*.5)],p95Ms:values[Math.floor(values.length*.95)],maxMs:values.at(-1),over16_7:values.filter(x=>x>16.7).length,longTasks:d.entries.filter(e=>e.entryType==='longtask').length,longAnimationFrames:d.entries.filter(e=>e.entryType==='long-animation-frame').length,viewport:d.viewport};summaries.push(s);await writeFile(`${dir}/performance-${name}.trace.json`,JSON.stringify({metadata:{source:'Actual browser observer data; not native GPU trace',conditions:s},traceEvents:d.frames.map(f=>({name:'Observed rAF',ph:'i',s:'t',ts:f.time*1000,pid:1,tid:1,args:{scroll:f.scroll}})).concat(d.entries.map(e=>({name:e.entryType,ph:'X',ts:e.startTime*1000,dur:e.duration*1000,pid:1,tid:1,args:e})))},null,2));}
await writeFile(`${dir}/performance-summary.json`,JSON.stringify(summaries,null,2));console.log(summaries);
