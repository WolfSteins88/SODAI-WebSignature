import type {VillaContent,VillaImage} from '@/lib/schemas/content';
import {Photo} from '../standard/photo';
import {SignatureNavigation} from './navigation';
import {FoundationStrip} from './foundation-strip';
type Section=NonNullable<VillaContent['foundation']>['sections'][number];
function Photograph({image,className,main=false,sizes='(max-width:900px) 85vw,55vw'}:{image:VillaImage;className:string;main?:boolean;sizes?:string}){return <div className={className}><Photo mainPhoto={main} image={image} sizes={sizes}/></div>;}
function Composition({section:s}:{section:Section}){
 switch(s.layout){
 case 'heritage':return <section className="sg-foundation-heritage" data-foundation-section={s.id}><h2>{s.heading}</h2><div className="sf-archive"><Photograph image={s.archive} className="sf-archive-photo" sizes="(max-width:900px) 48vw,14vw"/><p>{s.caption}</p></div><h3>{s.statement}</h3><p className="sf-body-one">{s.body[0]}</p><p className="sf-body-two">{s.body[1]}</p><Photograph main image={s.teacher} className="sf-teacher"/></section>;
 case 'commitment':return <section className="sg-foundation-commitment" data-foundation-section={s.id}><h2>{s.heading}</h2><Photograph image={s.small} className="sf-small" sizes="(max-width:900px) 52vw,18vw"/><div className="sf-commit-portrait"><Photograph main image={s.portrait} className="sf-portrait" sizes="(max-width:900px) 78vw,32vw"/><p>{s.statement}</p></div></section>;
 case 'aims':return <section className="sg-foundation-aims" data-foundation-section={s.id}><h2>{s.heading}</h2><ol>{s.entries.filter(e=>e.enabled).map((e,i)=><li key={e.id} data-foundation-entry={e.id}><span aria-hidden="true">{String(i+1).padStart(2,'0')}</span><p>{e.body}</p></li>)}</ol></section>;
 case 'widePhoto':return <section className="sg-foundation-wide" data-foundation-section={s.id}><Photo mainPhoto image={s.image} sizes="110vw"/></section>;
 case 'programs':return <section className="sg-foundation-programs" data-foundation-section={s.id}>{s.decoration&&<Photograph image={s.decoration} className="sf-coral" sizes="23vw"/>}<div className="sf-program-heading"><h2>{s.heading}</h2><h3>{s.statement}</h3></div><FoundationStrip><ol tabIndex={0} aria-label="Foundation programs; drag, scroll horizontally, or use arrow keys">{s.entries.filter(e=>e.enabled).map(e=><li key={e.id} data-foundation-entry={e.id} data-placement={e.placement}><Photograph main image={e.image} className="sf-program-photo" sizes="(max-width:900px) 78vw,26vw"/><p>{e.description}</p></li>)}</ol></FoundationStrip></section>;
 case 'initiatives':return <section className="sg-foundation-initiatives" data-foundation-section={s.id}><h2>{s.heading}</h2><Photograph main image={s.wide} className="sf-initiative-wide"/><Photograph image={s.small} className="sf-initiative-small" sizes="(max-width:900px) 52vw,18vw"/><Photograph main image={s.portrait} className="sf-initiative-portrait" sizes="(max-width:900px) 78vw,30vw"/><div className="sf-initiative-copy"><h3>{s.statement}</h3><p>{s.body}</p></div><p className="sf-closing">{s.closing}</p></section>;
 }
}
export function Foundation({content,prefix,preview}:{content:VillaContent;prefix:string;preview:boolean}){
 const f=content.foundation!;
 return <div className="sg-site sg-reference-site sg-foundation-site" data-signature-transition="hero" data-signature-background="#f1ecde" data-signature-route={`${prefix}/foundation`}><SignatureNavigation content={content} prefix={prefix}/>{preview&&<div className="sg-preview">Private draft preview · unpublished content</div>}<main id="signature-main" className="sg-foundation"><section className="sg-foundation-hero"><Photo image={f.hero} mainPhoto hero sizes="100vw"/><div className="sf-hero-shade"/><h1>{f.title}</h1></section>{f.sections.filter(s=>s.enabled).map(s=><Composition key={s.id} section={s}/>)}</main></div>;
}
