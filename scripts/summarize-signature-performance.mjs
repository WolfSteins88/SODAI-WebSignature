import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
const directory = path.resolve('docs/reference-2026-10-06-evening');
const summaries = [];
for (const file of (await readdir(directory)).filter(name => /^performance-(before|after)-.*\.json$/.test(name) && !name.endsWith('.trace.json'))) {
  const data = JSON.parse(await readFile(path.join(directory, file), 'utf8'));
  const intervals = data.frames.slice(1).map((frame, index) => ({ interval: frame.time - data.frames[index].time, moving: frame.scroll !== data.frames[index].scroll }));
  const values = intervals.map(item => item.interval).sort((a,b) => a-b);
  const median = values[Math.floor(values.length * .5)];
  const summary = { file, viewport: data.viewport, dpr: data.dpr, userAgent: data.userAgent, durationMs: data.end-data.start, frames: values.length, movingFrames: intervals.filter(item => item.moving).length, medianMs: median, p95Ms: values[Math.floor(values.length*.95)], maxMs: values.at(-1), intervalsOver16_7ms: values.filter(value => value > 16.7).length, estimatedMissedRafOpportunities: values.reduce((sum,value) => sum + Math.max(0,Math.round(value / median)-1),0), longTasks: data.entries.filter(entry => entry.entryType === 'longtask').length, longAnimationFrames: data.entries.filter(entry => entry.entryType === 'long-animation-frame').length };
  summaries.push(summary);
  // Trace-event container for actual observed callbacks/PerformanceEntries. No synthetic GPU frames.
  const traceEvents = data.frames.map(frame => ({ name: 'Observed rAF callback', cat: 'browser-observer', ph:'i', s:'t', ts:frame.time*1000, pid:1, tid:1, args:{scrollY:frame.scroll} }));
  for (const entry of data.entries) traceEvents.push({name:entry.entryType,cat:'PerformanceObserver',ph:'X',ts:entry.startTime*1000,dur:entry.duration*1000,pid:1,tid:1,args:entry});
  await writeFile(path.join(directory,file.replace('.json','.trace.json')),JSON.stringify({traceEvents,metadata:{source:'Production browser rAF/PerformanceObserver; not DevTools compositor trace',conditions:summary}},null,2));
}
await writeFile(path.join(directory,'performance-summary.json'),JSON.stringify(summaries,null,2));
console.log(summaries.map(item => ({file:item.file,frames:item.frames,moving:item.movingFrames,median:item.medianMs,p95:item.p95Ms,max:item.maxMs,over16_7:item.intervalsOver16_7ms,estimatedMissed:item.estimatedMissedRafOpportunities,longTasks:item.longTasks})));
