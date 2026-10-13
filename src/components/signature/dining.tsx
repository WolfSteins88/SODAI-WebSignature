import {culinaryTitle} from "@/lib/content/signature-labels";
import type { VillaContent } from '@/lib/schemas/content';
import { Photo } from '../standard/photo';
import { MotionLink as Link } from './motion';
import { SignatureNavigation } from './navigation';
import { DiningInteractions, MenuNavigation } from './dining-interactive';
export function DiningHero({content}:{content:VillaContent}) {return <section className="sg-hero sg-rooms-hero sg-dining-hero"><Photo image={content.dining.image} mainPhoto hero sizes="100vw"/><div className="sg-hero-shade"/><h1>{culinaryTitle(content.dining.title)}</h1></section>;}
export function Dining({content:c,prefix}:{content:VillaContent;prefix:string}) {
 const s=c.dining.signature, categories=s?.categories.filter(x=>x.enabled)||[],offers=s?.offers.filter(x=>x.enabled)||[];
 if(!s)return <section className="sg-section"><h2>{culinaryTitle(c.dining.title)}</h2><p>{c.dining.description}</p></section>;
 const menuAvailable=categories.some(x=>x.menuPages.length);
 return <div className="sg-dining">
 <section className="sg-dining-intro"><h2>{s.introTitle}</h2><p>{c.dining.description}</p><div>{menuAvailable&&<Link href={`${prefix}/restaurant-menu`}>View All Menu</Link>}<Link href={`${prefix}/gallery#dining`}>Dining Gallery</Link></div></section>
 {categories.length>0&&<ol className="sg-dining-categories">{categories.map(category=><li key={category.id} data-dining-category={category.id}>
 <div className="sg-dining-category-photo"><Photo mainPhoto image={category.image} sizes="(max-width:900px) 88vw,44vw"/></div><div className="sg-dining-category-copy"><h2>{category.title}</h2><p>{category.description}</p>{category.menuPages.length>0&&<Link className="sg-dining-view" href={`${prefix}/restaurant-menu#${category.id}`}>View Menu</Link>}</div></li>)}</ol>}
 {offers.length>0&&<section className="sg-dining-offers" aria-labelledby="dining-offers"><h2 id="dining-offers">Dining Offers</h2><DiningInteractions><ol className="sg-dining-offer-track" tabIndex={0} aria-label="Dining offers; scroll horizontally or use arrow keys">{offers.map(o=><li key={o.id} data-dining-offer={o.id}><div className="sg-dining-offer-photo"><Photo mainPhoto image={o.image} sizes="(max-width:900px) 82vw,25vw"/></div><h3>{o.title}</h3><div className="sg-dining-offer-body">{o.description.map((p,i)=><p key={i}>{p}</p>)}</div></li>)}</ol></DiningInteractions></section>}
 </div>;
}
export function RestaurantMenus({content:c,prefix,preview}:{content:VillaContent;prefix:string;preview:boolean}) {
 const s=c.dining.signature!,categories=s.categories.filter(x=>x.enabled&&x.menuPages.length);
 return <div className="sg-site sg-reference-site sg-dining-menu-site" data-signature-transition="none" data-signature-background="#a62a23" data-signature-route={`${prefix}/restaurant-menu`}><SignatureNavigation content={c} prefix={prefix}/>{preview&&<div className="sg-preview">Private draft preview · unpublished content</div>}<main id="signature-main" className="sg-dining-menus"><MenuNavigation pageTitle={culinaryTitle(c.dining.title)} categories={categories.map(({id,title,downloadUrl})=>({id,title,downloadUrl}))} prefix={prefix}/><div className="sg-dining-documents">{categories.map(category=><section key={category.id} aria-labelledby={category.id}><h1 id={category.id}>{category.title}</h1><p className="sg-menu-subtitle">Menu</p><div className={`sg-menu-pages ${category.mobileMenuPages?.length ? "sg-menu-desktop-pages" : ""}`}>{category.menuPages.map(page=><div key={page.id} className="sg-menu-page" style={{aspectRatio:`${page.width}/${page.height}`}} data-menu-page={page.id}><Photo image={page.image} sizes="(max-width:900px) 82vw,51vw"/></div>)}</div>{!!category.mobileMenuPages?.length&&<div className="sg-menu-pages sg-menu-mobile-pages">{category.mobileMenuPages.map(page=><div key={page.id} className="sg-menu-page" style={{aspectRatio:`${page.width}/${page.height}`}} data-menu-page={page.id}><Photo image={page.image} sizes="82vw"/></div>)}</div>}</section>)}</div><aside className="sg-menu-notes">{s.notes.map((note,i)=><p key={i}>{note}</p>)}</aside></main></div>;
}
