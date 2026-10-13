import sharp from 'sharp';
const cells=[];for(let t=0;t<=36;t+=3){const input=await sharp(`docs/reference-dining/frame-${String(t).padStart(3,'0')}.jpg`).resize(511,280).toBuffer();cells.push({input,left:(t/3%3)*511,top:Math.floor(t/9)*300});}await sharp({create:{width:1533,height:1500,channels:3,background:'#222'}}).composite(cells).jpeg().toFile('docs/reference-dining/sequence.jpg');
