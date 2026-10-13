import sharp from 'sharp';
const dir='docs/reference-terms';
for(const [name,reference,after,label]of [
 ['01-opener','frame-0.jpg','01-after-opener.png','Recording 0s, normalized1279x700 (recording CSS/DPR unknown)'],
 ['02-guaranteed','source-guaranteed.png','02-after-guaranteed.png','Live source1279x700, Guaranteed anchor (recording around8s is a different scroll position)'],
 ['03-children','frame-16.7.jpg','03-after-children.png','Recording16.7s normalized1279x700, Children anchor']
]){const left=await sharp(`${dir}/${reference}`).resize(1279,700).toBuffer(),right=await sharp(`${dir}/${after}`).resize(1279,700).toBuffer(),banner=Buffer.from(`<svg width="2558" height="40"><rect width="2558" height="40" fill="#222"/><text x="12" y="25" font-size="16" fill="white">${label}</text><text x="1291" y="25" font-size="16" fill="white">Updated production1279x700</text></svg>`);await sharp({create:{width:2558,height:740,channels:3,background:'#222'}}).composite([{input:banner,left:0,top:0},{input:left,left:0,top:40},{input:right,left:1279,top:40}]).png().toFile(`${dir}/${name}-comparison.png`);}
