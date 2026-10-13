import type {VillaContent} from '@/lib/schemas/content';
import {SignatureNavigation} from './navigation';
import {TermsIndex} from './terms-index';
export function Terms({content,prefix,preview}:{content:VillaContent;prefix:string;preview:boolean}){
 const page=content.signatureTerms!,sections=page.sections.filter(s=>s.enabled);
 return <div className="sg-site sg-reference-site" data-signature-transition="none" data-signature-background="#f1ecde" data-signature-route={`${prefix}/terms`}><SignatureNavigation content={content} prefix={prefix}/>{preview&&<div className="sg-preview">Private draft preview · unpublished content</div>}<main id="signature-main" className="st-page"><h1>{page.title}</h1><TermsIndex sections={sections.map(({id,title})=>({id,title}))}/><article className="st-reading" aria-label={page.title}>{sections.map(s=><section key={s.id} data-terms-section={s.id} className={s.compactIntroduction?'st-compact':''}><h2 id={s.id} tabIndex={-1}>{s.title}</h2>{s.body.map((b,i)=>b.type==='paragraph'?<p key={i}>{b.text}</p>:b.ordered?<ol key={i}>{b.items.map((t,j)=><li key={j}>{t}</li>)}</ol>:<ul key={i}>{b.items.map((t,j)=><li key={j}>{t}</li>)}</ul>)}</section>)}</article></main></div>;
}
