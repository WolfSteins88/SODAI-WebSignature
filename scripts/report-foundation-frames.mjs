import fs from 'node:fs/promises';import sharp from 'sharp';
const times=[0,2,4,6,8,10,12,14,16,18,20,21.5,23,25,27,29.8],items=[];
for(let i=0;i<times.length;i++){let t=times[i],input=await sharp(`docs/reference-foundation/frame-${String(t)}.jpg`).resize(320,175).toBuffer();items.push({input,left:(i%4)*320,top:Math.floor(i/4)*200+25});items.push({input:Buffer.from(`<svg width="320" height="25"><rect width="320" height="25" fill="#222"/><text x="8" y="18" fill="white" font-size="14">Reference ${t}s</text></svg>`),left:(i%4)*320,top:Math.floor(i/4)*200});}
await sharp({create:{width:1280,height:800,channels:3,background:'#222'}}).composite(items).jpeg().toFile('docs/reference-foundation/chronological-sheet.jpg');
