import sharp from 'sharp';
const dir='docs/reference-gallery';
for(const [name,reference,after,label] of [
 ['01-gallery','frame-0.jpg','01-updated-desktop.png','Recording 0s; guest-comment removal intentionally changes All content'],
 ['02-portrait','frame-18.jpg','02-updated-portrait.png','Recording 18s; same ceremonial portrait'],
 ['03-landscape','frame-20.jpg','03-updated-landscape.png','Recording 20s; same sunset and literal caption']
]){
 const left=await sharp(`${dir}/${reference}`).resize(1279,700).toBuffer(),right=await sharp(`${dir}/${after}`).resize(1279,700).toBuffer();
 const banner=Buffer.from(`<svg width="2558" height="42"><rect width="2558" height="42" fill="#222"/><text x="12" y="26" font-size="15" fill="white">${label}</text><text x="1291" y="26" font-size="15" fill="white">Updated production 1279×700; source CSS viewport/DPR unknown</text></svg>`);
 await sharp({create:{width:2558,height:742,channels:3,background:'#222'}}).composite([{input:banner,left:0,top:0},{input:left,left:0,top:42},{input:right,left:1279,top:42}]).png().toFile(`${dir}/${name}-comparison.png`);
}
