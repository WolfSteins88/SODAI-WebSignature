import type {VillaContent} from '@/lib/schemas/content';
import {packageEnquiry,type VillaPackage} from '@/lib/content/packages';
import {Photo} from '../standard/photo';
import {MotionLink} from './motion';
import {SignatureNavigation} from './navigation';
function Action({item,content,prefix,children,className}:{item:VillaPackage;content:VillaContent;prefix:string;children:React.ReactNode;className?:string}){
 if(item.signature?.destination!=='enquiry')return <MotionLink className={className} href={`${prefix}/packages/${item.slug}`}>{children}</MotionLink>;
 const href=packageEnquiry(content,item);return href?<a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}</a>:className==='sp-more'?null:<>{children}</>;
}
function Detail({item,content,prefix}:{item:VillaPackage;content:VillaContent;prefix:string}){
 const details=item.signature!,enquiry=packageEnquiry(content,item);
 return <article className="sp-detail">{details.sections.filter(s=>s.enabled).map(s=>s.layout==='intro'?<section key={s.id} data-package-section={s.id} className="sp-detail-intro">
   <aside><p className="sp-stay">{s.stayInfo}</p>{s.price?.display&&<><p className="sp-price-label">{s.price.label}</p><p className="sp-price" aria-label={`${details.referenceDemo?'Reference demo price: ':''}${s.price.display}`}>{s.price.display}</p></>}{details.referenceDemo&&<p className="sp-demo-label">Reference demo offer</p>}</aside>
   <div className="sp-detail-copy"><h2>{s.heading}</h2>{s.body.length>0&&<div className="sp-detail-paragraphs">{s.body.map((p,i)=><p key={i}>{p}</p>)}</div>}</div>
   <div className="sp-detail-wide"><Photo mainPhoto image={s.wide} sizes="(max-width:900px) 85vw,55vw"/></div><div className="sp-detail-small"><Photo image={s.small} sizes="(max-width:900px) 48vw,18vw"/></div>
 </section>:<section key={s.id} data-package-section={s.id} className={`sp-inclusions sp-${s.layout}`}><h2>{s.title}</h2><ol>{s.entries.filter(e=>e.enabled).map(e=><li key={e.id} data-package-inclusion={e.id}>{e.text}</li>)}</ol></section>)}
 {enquiry&&<div className="sp-enquiry"><a href={enquiry} target="_blank" rel="noopener noreferrer">Enquire Now</a></div>}
 <nav className="sp-return" aria-label="Package navigation"><MotionLink href={`${prefix}/packages`}>Packages &amp; Activities</MotionLink></nav>
 </article>;
}
export function Packages({content,slug,prefix,preview}:{content:VillaContent;slug?:string;prefix:string;preview:boolean}){
 const page=content.signaturePackages!,items=content.packages.filter(p=>p.enabled!==false),item=slug?items.find(p=>p.slug===slug):undefined;
 return <div className="sg-site sg-reference-site sg-packages-site" data-signature-transition="hero" data-signature-background="#f1ecde" data-signature-route={`${prefix}/packages${slug?'/'+slug:''}`}><SignatureNavigation content={content} prefix={prefix}/>{preview&&<div className="sg-preview">Private draft preview · unpublished content</div>}<main id="signature-main" className="sp-page"><section className="sp-hero"><Photo image={item?.image||page.hero} mainPhoto hero sizes="100vw"/><div className="sp-hero-shade"/><h1>{item?.title||page.title}</h1></section>
 {item&&item.signature?.destination==='detail'?<Detail item={item} content={content} prefix={prefix}/>:item?<section className="sp-fallback"><h2>{item.title}</h2><p>{item.description}</p></section>:<>
 {page.sections.filter(s=>s.enabled).map(s=><section className="sp-intro" key={s.id} data-package-section={s.id}><h2>{s.heading}</h2><div className="sp-intro-small"><Photo image={s.small} sizes="(max-width:900px) 50vw,18vw"/></div><div className="sp-intro-tall"><Photo mainPhoto image={s.tall} sizes="(max-width:900px) 75vw,32vw"/></div><p className="sp-intro-copy">{s.body}</p></section>)}
 <section className="sp-list" aria-label={page.title}><ol>{items.map(p=><li key={p.id||p.slug} data-package-slug={p.slug}><div className="sp-list-photo"><Action item={p} content={content} prefix={prefix}><Photo mainPhoto image={p.image} sizes="(max-width:900px) 85vw,40vw"/></Action></div><div className="sp-card-copy"><h2><Action item={p} content={content} prefix={prefix}>{p.title}</Action></h2><p>{p.description}</p><Action item={p} content={content} prefix={prefix} className="sp-more">More Details</Action></div></li>)}</ol></section>
 </>}
 </main></div>;
}
