// Split existing comparison-seed vector paths; no brand asset is invented.
import {readFile,writeFile} from 'node:fs/promises';
import sharp from 'sharp';
const svg=await readFile('public/reference-story/menu-logo.svg','utf8');
const paths=svg.match(/<path\b[^>]*><\/path>/g)||[];
const emblem=[],wordmark=[];
for(const path of paths){
 const {info}=await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="760" height="750" viewBox="0 0 76 75">${path}</svg>`)).trim().png().toBuffer({resolveWithObject:true});
 const x=-info.trimOffsetLeft/10,y=-info.trimOffsetTop/10;
 // Original paths within the coral's lower-left square, separate from lettering.
 (x+info.width/10<50.5&&y>23?emblem:wordmark).push(path.replaceAll('#F1ECDE','#7d2441'));
}
await writeFile('public/reference-story/intro-emblem.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.35 24.3 50.2 50.2">${emblem.join('')}</svg>`);
await writeFile('public/reference-story/intro-wordmark.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 76 75">${wordmark.join('')}</svg>`);
