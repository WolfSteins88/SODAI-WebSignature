import { test } from "node:test";
import assert from "node:assert/strict";
import { contentSchema, bookingLinks } from "../src/lib/schemas/content";
import { demoContent } from "../src/lib/content/demo";
import { publicPaths } from "../src/lib/content/public-routes";
import { referenceDemoContent } from "../src/lib/content/signature-reference-demo";
test("demo content validates and external booking excludes WhatsApp", () => {
  assert.ok(contentSchema.safeParse(demoContent).success);
  assert.equal(bookingLinks(demoContent).whatsapp, null);
});
test("Signature room metadata preserves order and rejects ambiguous photo IDs or unsafe sources", () => {
  const c = structuredClone(referenceDemoContent);
  c.rooms.reverse();
  c.rooms[0].signature!.gallery.reverse();
  const parsed = contentSchema.parse(c);
  assert.equal(parsed.rooms[0].slug, "family-bungalow");
  assert.equal(parsed.rooms[0].signature!.gallery[0].id, "photograph-4");
  c.rooms[0].signature!.gallery[1].id = c.rooms[0].signature!.gallery[0].id;
  assert.equal(contentSchema.safeParse(c).success, false);
  c.rooms[0].signature!.gallery = [];
  assert.equal(contentSchema.safeParse(c).success, true);
  c.signatureRooms!.hero.src = "/reference-rooms/../secret";
  assert.equal(contentSchema.safeParse(c).success, false);
});
test("booking rejects dangerous schemes and invalid phone numbers", () => {
  const c = structuredClone(demoContent);
  c.booking.mode = "both";
  c.booking.url = "javascript:alert(1)";
  c.booking.whatsapp = "123";
  assert.equal(contentSchema.safeParse(c).success, false);
});
test("WhatsApp context is encoded without automatic transmission", () => {
  const c = structuredClone(demoContent);
  c.booking.mode = "whatsapp";
  c.booking.whatsapp = "628123456789";
  const href = bookingLinks(c, "Garden & Pool").whatsapp!;
  assert.ok(href.startsWith("https://wa.me/628123456789?text="));
  assert.ok(href.includes("Garden%20%26%20Pool"));
});
test("duplicate slugs and arbitrary image destinations are rejected", () => {
  const c = structuredClone(demoContent);
  c.rooms[1].slug = c.rooms[0].slug;
  c.hero.src = "https://attacker.example/image.svg";
  assert.equal(contentSchema.safeParse(c).success, false);
});

test("Signature collections keep stable unique IDs and omit disabled culture routes", () => {
  const c = structuredClone(demoContent);
  assert.equal(c.storyPanels.length, 9);
  assert.equal(c.culture?.entries.length, 10);
  c.storyPanels[1].id = c.storyPanels[0].id;
  assert.equal(contentSchema.safeParse(c).success, false);
  c.storyPanels[1].id = "reordered-panel";
  c.storyPanels.reverse();
  assert.equal(contentSchema.safeParse(c).success, true);
  assert.equal(c.storyPanels[0].id, "a-moment-between");
  c.culture!.entries[0].enabled = false;
  assert.ok(!publicPaths(c, "signature").includes("/culture/galungan"));
  c.culture!.enabled = false;
  assert.ok(!publicPaths(c, "signature").includes("/cultures"));
  assert.ok(!publicPaths(c, "standard").includes("/cultures"));
});

test("Reference Story accepts variable ordered compositions and rejects ambiguous IDs", () => {
  const c = structuredClone(referenceDemoContent);
  const story = c.signatureStory!;
  assert.ok(contentSchema.safeParse(c).success);
  story.sections.reverse();
  story.sections[0].enabled = false;
  assert.ok(contentSchema.safeParse(c).success);
  story.sections.push(structuredClone(story.sections[0]));
  assert.equal(contentSchema.safeParse(c).success, false);
  story.sections = [];
  assert.ok(contentSchema.safeParse(c).success);
});

test("Future video defaults disabled and enabling requires supported source and poster", () => {
  const c = structuredClone(referenceDemoContent);
  const video = c.signatureStory!.video;
  assert.equal(video.enabled, false);
  video.enabled = true;
  assert.equal(contentSchema.safeParse(c).success, false);
  video.source = "https://example.com/story.mp4";
  assert.equal(contentSchema.safeParse(c).success, false);
  video.poster = c.hero;
  assert.ok(contentSchema.safeParse(c).success);
  video.source = "https://example.com/story.html";
  assert.equal(contentSchema.safeParse(c).success, false);
});

test("Culture reference sections support reorder/disable/empty and reject duplicate IDs or self handoffs", () => {
  const c = structuredClone(referenceDemoContent);
  assert.equal(c.culture!.entries.length, 10);
  const entry = c.culture!.entries[0];
  assert.deepEqual(entry.signature!.sections.map(section=>section.layout), ["portraitEditorial", "redOverlay"]);
  entry.signature!.sections.reverse();
  entry.signature!.sections[0].enabled = false;
  assert.ok(contentSchema.safeParse(c).success);
  entry.signature!.sections.push(structuredClone(entry.signature!.sections[0]));
  assert.equal(contentSchema.safeParse(c).success, false);
  entry.signature!.sections = [];
  assert.ok(contentSchema.safeParse(c).success);
  entry.signature!.nextSlug = entry.slug;
  assert.equal(contentSchema.safeParse(c).success, false);
});
test('Dining validates ordered collections and isolates menu availability',()=>{
 const c=structuredClone(referenceDemoContent);assert.ok(contentSchema.safeParse(c).success);
 assert.ok(publicPaths(c,'signature').includes('/restaurant-menu'));assert.ok(!publicPaths(c,'standard').includes('/restaurant-menu'));
 c.dining.signature!.offers=[];c.dining.signature!.categories.reverse();assert.ok(contentSchema.safeParse(c).success);
 c.dining.signature!.categories[0].menuPages.push(c.dining.signature!.categories[0].menuPages[0]);assert.ok(!contentSchema.safeParse(c).success);
 c.modules.dining=false;assert.ok(!publicPaths(c,'signature').includes('/restaurant-menu'));
});
test("Signature menu remains optional and validates published destinations and assets", () => {
  const c = structuredClone(referenceDemoContent);
  assert.ok(contentSchema.safeParse(c).success);
  c.signatureMenu!.social = [{id:"instagram",platform:"instagram",order:0,enabled:true,url:"javascript:alert(1)"}];
  assert.equal(contentSchema.safeParse(c).success,false);
  c.signatureMenu!.social = [];
  c.signatureMenu!.logo.src = "/reference-story/../secret";
  assert.equal(contentSchema.safeParse(c).success,false);
  delete c.signatureMenu;
  assert.ok(contentSchema.safeParse(c).success);
});
test("Foundation sections and programs preserve order, disablement and safe stable IDs", () => {
 const c=structuredClone(referenceDemoContent);
 assert.ok(contentSchema.safeParse(c).success);
 assert.ok(publicPaths(c,'signature').includes('/foundation'));
 assert.ok(!publicPaths(c,'standard').includes('/foundation'));
 c.foundation!.sections.reverse();
 assert.equal(contentSchema.parse(c).foundation!.sections[0].layout,'initiatives');
 const programs=c.foundation!.sections.find(s=>s.layout==='programs')!;
 if(programs.layout==='programs'){programs.entries.reverse();assert.equal(contentSchema.parse(c).foundation!.sections.find(s=>s.layout==='programs')?.entries[0].id,'student-performances');programs.entries[1].id=programs.entries[0].id;assert.equal(contentSchema.safeParse(c).success,false);programs.entries=[];assert.ok(contentSchema.safeParse(c).success);}
 c.foundation!.sections=c.foundation!.sections.slice(0,1);
 assert.ok(contentSchema.safeParse(c).success);
 c.foundation!.sections[0].enabled=false;
 assert.ok(!publicPaths(c,'signature').includes('/foundation'));
 c.foundation!.enabled=false;
 assert.ok(!publicPaths(c,'signature').includes('/foundation'));
 c.foundation!.sections=[];
 assert.ok(contentSchema.safeParse(c).success);
});
import {packageEnquiry} from '../src/lib/content/packages';

test('Packages preserve enabled ordering, complete inclusions and validated contextual enquiry',()=>{
 const c=structuredClone(referenceDemoContent);assert.ok(contentSchema.safeParse(c).success);assert.equal(c.packages.length,5);
 assert.ok(publicPaths(c,'signature').includes('/packages/seaside-wedding-and-honeymoon'));assert.ok(!publicPaths(c,'signature').includes('/packages/cooking-class'));
 const wedding=c.packages[0],rows=wedding.signature!.sections.find(s=>s.layout==='inclusions')!;if('entries'in rows)assert.equal(rows.entries.length,19);
 assert.equal(new URL(packageEnquiry(c,wedding)!).searchParams.get('package'),wedding.title);
 wedding.signature!.enquiry={type:'whatsapp',phone:'628123456789'};assert.ok(decodeURIComponent(packageEnquiry(c,wedding)!).includes(wedding.title));
 wedding.signature!.enquiry={type:'external',url:'javascript:alert(1)'};assert.equal(contentSchema.safeParse(c).success,false);wedding.signature!.enquiry=undefined;
 c.packages.reverse();assert.equal(contentSchema.parse(c).packages[0].slug,'kado-gift-shop');c.packages[0].enabled=false;assert.ok(!publicPaths(c,'signature').includes('/packages/kado-gift-shop'));
 c.packages=c.packages.slice(0,1);c.packages[0].enabled=true;assert.ok(contentSchema.safeParse(c).success);c.packages[0].signature!.sections=[];assert.ok(contentSchema.safeParse(c).success);
 c.packages=[];assert.ok(!publicPaths(c,'signature').includes('/packages'));assert.ok(contentSchema.safeParse(c).success);
});


test('Getting Here keeps optional compatible content, unique ordered rows and inactive newsletter',()=>{
 const c=structuredClone(referenceDemoContent),page=c.signatureLocation!;assert.ok(contentSchema.safeParse(c).success);assert.equal(page.destinations.length,6);assert.equal(page.notes.length,5);assert.equal(page.newsletter!.enabled,false);
 assert.equal(contentSchema.parse({...c,signatureLocation:{...page,newsletter:{...page.newsletter,enabled:undefined}}}).signatureLocation!.newsletter!.enabled,false);
 page.destinations.reverse();assert.equal(contentSchema.parse(c).signatureLocation!.destinations[0].id,'destination-6');page.destinations[1].id=page.destinations[0].id;assert.equal(contentSchema.safeParse(c).success,false);page.destinations=[];page.notes=[];assert.ok(contentSchema.safeParse(c).success);
 page.directionsUrl='javascript:alert(1)';assert.equal(contentSchema.safeParse(c).success,false);page.directionsUrl='';page.enabled=false;assert.ok(!publicPaths(c,'signature').includes('/location'));assert.ok(publicPaths(c,'standard').includes('/location'));delete c.signatureLocation;assert.ok(contentSchema.safeParse(c).success);assert.ok(publicPaths(c,'signature').includes('/location'));
});

test('Signature terms validate safe blocks and keep enabled anchor order separate from Standard',()=>{
 const c=structuredClone(referenceDemoContent),p=c.signatureTerms!;
 assert.equal(p.sections.length,10);assert.equal(contentSchema.safeParse(c).success,true);
 p.sections.reverse();p.sections[1].enabled=false;
 assert.equal(contentSchema.parse(c).signatureTerms!.sections[0].id,'children-policy');
 p.sections[1].id=p.sections[0].id;assert.equal(contentSchema.safeParse(c).success,false);
 p.sections=p.sections.slice(0,1);assert.equal(contentSchema.safeParse(c).success,true);
 assert.ok(publicPaths(c,'signature').includes('/terms'));
 p.sections=[];assert.ok(!publicPaths(c,'signature').includes('/terms'));assert.ok(publicPaths(c,'standard').includes('/terms'));
 p.sections=referenceDemoContent.signatureTerms!.sections;p.enabled=false;assert.ok(!publicPaths(c,'signature').includes('/terms'));
 const unsafe=structuredClone(referenceDemoContent) as any;unsafe.signatureTerms.sections[0].body=[{type:'html',html:'<script>alert(1)</script>'}];assert.equal(contentSchema.safeParse(unsafe).success,false);
 delete c.signatureTerms;assert.ok(contentSchema.safeParse(c).success);assert.ok(publicPaths(c,'signature').includes('/terms'));
});

test('Signature gallery validates ordered photos, dimensions, categories and disabled routing',()=>{const c=structuredClone(referenceDemoContent),g=c.signatureGallery!;assert.equal(g.items.length,94);assert.equal(contentSchema.safeParse(c).success,true);g.items.reverse();assert.equal(contentSchema.parse(c).signatureGallery!.items[0].id,g.items[0].id);g.items[1].id=g.items[0].id;assert.equal(contentSchema.safeParse(c).success,false);g.items=g.items.slice(0,1);g.items[0].width=0;assert.equal(contentSchema.safeParse(c).success,false);g.items[0].width=800;g.items[0].categories=['unknown'];assert.equal(contentSchema.safeParse(c).success,false);g.items=[];assert.equal(contentSchema.safeParse(c).success,true);assert.ok(publicPaths(c,'signature').includes('/gallery'));g.enabled=false;assert.ok(!publicPaths(c,'signature').includes('/gallery'));assert.ok(publicPaths(c,'standard').includes('/gallery'));delete c.signatureGallery;assert.equal(contentSchema.safeParse(c).success,true);});

import {publicMediaIds,mediaIds} from '../src/lib/content/repository';
test('Disabled gallery-only media cannot authorize public Blob access',()=>{const c=structuredClone(referenceDemoContent),i=c.signatureGallery!.items[0],id='11111111-1111-4111-8111-111111111111';i.image.src='/api/media/'+id;i.mediaId=id;assert.ok(mediaIds(c).includes(id));assert.ok(publicMediaIds(c).includes(id));i.enabled=false;assert.ok(!publicMediaIds(c).includes(id));assert.ok(mediaIds(c).includes(id));i.enabled=true;c.signatureGallery!.enabled=false;assert.ok(!publicMediaIds(c).includes(id));});

test('Social contract validates platform accounts and unique IDs without inventing accounts',()=>{
 const c=structuredClone(referenceDemoContent);
 c.signatureMenu!.social=[{id:'configured-instagram',platform:'instagram',url:'https://www.instagram.com/configured-account/',order:2,enabled:true}];
 assert.equal(contentSchema.safeParse(c).success,true);
 for(const url of ['not a url','https://instagram.com.evil.test/account','https://user:password@instagram.com/account']){c.signatureMenu!.social[0].url=url;assert.equal(contentSchema.safeParse(c).success,false);}
 c.signatureMenu!.social=[];assert.equal(contentSchema.safeParse(c).success,true);
 const legacy=structuredClone(referenceDemoContent) as any;
 legacy.signatureStory.sections=legacy.signatureStory.sections.filter((s:any)=>s.id!=='documentary-still');
 legacy.signatureStory.sections.push({id:'documentary-still',layout:'still',enabled:true,image:legacy.hero});
 const upgraded=contentSchema.parse(legacy).signatureStory!.sections.find(s=>s.id==='documentary-still');
 assert.equal(upgraded?.layout,'video');assert.equal(upgraded?.enabled,false);
 assert.equal(legacy.signatureStory.sections.at(-1).layout,'still');
});

test('Room grid preserves legacy photos and validates zero to nine ordered enabled images',async()=>{
 const {roomPhotoGrid}=await import('../src/lib/content/room-photo-grid');
 const c=structuredClone(referenceDemoContent),r=c.rooms[0],s=r.signature!;
 assert.equal(roomPhotoGrid(r).length,3);
 const original=s.gallery.map(p=>p.image.src);
 const images=[s.showcase!.wide,s.showcase!.small,s.showcase!.tall,...s.gallery.map(p=>p.image)];
 for(const count of [0,1,3,6,9]){
  s.photoGrid=images.slice(0,count).map((image,i)=>({id:`grid-${i}`,enabled:true,image,caption:'Room photograph'}));
  const parsed=contentSchema.parse(c).rooms[0];assert.equal(roomPhotoGrid(parsed).length,count);
  assert.deepEqual(parsed.signature!.gallery.map(p=>p.image.src),original);
 }
 s.photoGrid!.reverse();s.photoGrid![0].enabled=false;
 const parsed=contentSchema.parse(c).rooms[0];assert.equal(roomPhotoGrid(parsed).length,8);assert.equal(roomPhotoGrid(parsed)[0].id,'grid-7');
 s.photoGrid![1].id=s.photoGrid![0].id;assert.equal(contentSchema.safeParse(c).success,false);
 s.photoGrid!.forEach((p,i)=>p.id=`grid-${i}`);s.photoGrid!.push({...s.photoGrid![0],id:'grid-10',enabled:true});assert.equal(contentSchema.safeParse(c).success,true);s.photoGrid![0].enabled=true;assert.equal(contentSchema.safeParse(c).success,false);
});


test('Culinary label upgrades only Signature Dining and preserves category names and routes',async()=>{
 const {culinaryTitle}=await import('../src/lib/content/signature-labels');
 const {standardPage}=await import('../src/lib/content/public-routes');
 const c=structuredClone(referenceDemoContent);c.dining.title='Dining';
 assert.equal(culinaryTitle(c.dining.title),'Culinary');
 assert.equal(standardPage(c,['dining'],'signature')!.title,'Culinary');
 assert.equal(standardPage(c,['dining'],'standard')!.title,'Dining');
 assert.equal(culinaryTitle('All Day Dining'),'All Day Dining');
 assert.equal(culinaryTitle('Published custom title'),'Published custom title');
 assert.ok(publicPaths(c,'signature').includes('/dining'));
 assert.ok(!publicPaths(c,'signature').includes('/culinary'));
 assert.ok(c.dining.signature!.categories.some(x=>x.title==='All Day Dining'));
});

test("Intro split branding remains optional and emblem bounds cannot escape its frame",()=>{
 const c=structuredClone(referenceDemoContent);
 assert.ok(contentSchema.safeParse(c).success);
 c.signatureMenu!.introBrand!.emblemBounds.x=80;
 assert.equal(contentSchema.safeParse(c).success,false);
 delete c.signatureMenu!.introBrand;
 assert.ok(contentSchema.safeParse(c).success);
});

test('M5 registered page visibility, core landing and content-version validation',()=>{
 const c=structuredClone(referenceDemoContent);c.pages=[{id:'rooms-page',route:'/rooms',enabled:false,title:'Rooms',description:''}];
 const paths=publicPaths(c,'signature');assert.ok(!paths.some(p=>p==='/rooms'||p.startsWith('/rooms/')));
 c.pages=[{id:'bad',route:'/admin',enabled:true,title:'',description:''}];assert.equal(contentSchema.safeParse(c).success,false);
 c.pages=[{id:'home',route:'/',enabled:false,title:'',description:''}];assert.equal(contentSchema.safeParse(c).success,false);
 c.pages=[];assert.equal(contentSchema.safeParse({...c,contentVersion:2}).success,false);
 c.booking={...c.booking,controlsEnabled:false,whatsapp:'',url:''};assert.ok(contentSchema.safeParse(c).success);
});
