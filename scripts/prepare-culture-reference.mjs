import fs from 'node:fs';
import crypto from 'node:crypto';
import sharp from 'sharp';
const dir='docs/reference-culture', listing=JSON.parse(fs.readFileSync(dir+'/listing-data.json'));
const assets=new Map();
for(const f of fs.readdirSync(dir).filter(f=>f.endsWith('-assets.json')))for(const a of JSON.parse(fs.readFileSync(dir+'/'+f)).assets)if(a.kind==='image')assets.set(a.url,a);
fs.mkdirSync('public/reference-culture',{recursive:true});const used=[];
async function photo(url,alt){const a=assets.get(url);if(!a)throw Error('Missing observed source '+url);const name=crypto.createHash('sha256').update(url).digest('hex').slice(0,20)+'.webp';await sharp(a.path).rotate().resize({width:2560,height:2560,fit:'inside',withoutEnlargement:true}).webp({quality:92}).toFile('public/reference-culture/'+name);used.push({url,output:name});return{src:'/reference-culture/'+name,alt,category:'Living'};}
const transitions=['galungan','kuningan-and-mekotek','melasti','ogoh-ogoh','nyepi','piodalan','bali-art-festival','perang-pandan-and-ayunan-jantra','purnama-and-tilem','offerings'];
const entries=[];
for(const e of listing.entries){const d=JSON.parse(fs.readFileSync(dir+'/'+e.slug+'-measured.json'));const sections=[];for(let i=0;i<d.sections.length;i++){const s=d.sections[i];sections.push({id:e.slug+'-'+(i?'red-editorial':'portrait-editorial'),enabled:true,layout:i?'redOverlay':'portraitEditorial',image:await photo(s.image,e.title+(i?' cultural ceremony':' editorial photograph')),heading:s.heading,body:s.body});if(s.ornament)fs.writeFileSync('public/reference-culture/coral-emblem.svg',s.ornament.replace(/ data-v-[\w]+=""/g,''));}entries.push({id:e.slug,enabled:true,slug:e.slug,title:e.title,summary:e.summary,image:await photo(e.image,e.title),heading:sections[0].heading,body:sections[0].body,signature:{hero:await photo(d.hero,e.title),nextSlug:transitions[transitions.indexOf(e.slug)+1],sections}});}
const data={enabled:true,title:listing.title,hero:await photo(listing.hero,'Balinese ceremonial procession'),introTitle:listing.introTitle.trim(),intro:listing.intro,introImages:[await photo(listing.introImages[0],'Map of Bali'),await photo(listing.introImages[1],'Balinese ceremonial carving')],entries};
fs.writeFileSync('src/lib/content/signature-culture-reference.ts','import type { VillaContent } from "@/lib/schemas/content";\n\n/** Replaceable private comparison seed; public rendering reads published snapshots. */\nexport const referenceCulture: NonNullable<VillaContent["culture"]> = '+JSON.stringify(data,null,2)+';\n');
fs.writeFileSync(dir+'/used-assets.json',JSON.stringify(used,null,2));console.log({entries:entries.length,images:new Set(used.map(x=>x.output)).size});
