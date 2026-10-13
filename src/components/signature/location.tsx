import type {VillaContent} from '@/lib/schemas/content';
import {Photo} from '../standard/photo';
import {SignatureNavigation} from './navigation';
/** No subscription integration exists. Only the isolated local comparison may show inert controls. */
export function Location({content,prefix,preview,referenceComparison=false}:{content:VillaContent;prefix:string;preview:boolean;referenceComparison?:boolean}){
 const page=content.signatureLocation!,contacts=page.contacts,n=page.newsletter;
 const map=<Photo image={page.map} sizes="(max-width:900px) 84vw,50vw"/>;
 return <div className="sg-site sg-reference-site sg-location-site" data-signature-transition="hero" data-signature-background="#f1ecde" data-signature-route={`${prefix}/location`}><SignatureNavigation content={content} prefix={prefix}/>{preview&&<div className="sg-preview">Private draft preview · unpublished content</div>}<main id="signature-main" className="sl-page">
 <section className="sl-hero"><Photo image={page.hero} mainPhoto hero sizes="100vw"/><div className="sl-shade"/><h1>{page.title}</h1></section>
 <section className="sl-editorial" data-location-section={page.id}>
 <div className="sl-small"><Photo image={page.small} sizes="(max-width:900px) 52vw,18vw"/></div>
 <div className="sl-right"><h2>{page.heading}</h2><dl className="sl-contacts">
 {contacts.phone?.enabled&&<div><dt>{contacts.phone.label}</dt><dd><a href={`tel:${contacts.phone.number}`}>{contacts.phone.display}</a></dd></div>}
 {contacts.email?.enabled&&<div><dt>{contacts.email.label}</dt><dd><a href={`mailto:${contacts.email.address}`}>{contacts.email.address}</a></dd></div>}
 {contacts.address.enabled&&<div className="sl-address"><dt>{contacts.address.label}</dt><dd>{contacts.address.lines.map((line,i)=><span key={i}>{line}{i<contacts.address.lines.length-1&&<br/>}</span>)}</dd></div>}
 </dl><div className="sl-map">{page.directionsUrl?<a href={page.directionsUrl} target="_blank" rel="noopener noreferrer" aria-label="Open external map and directions">{map}</a>:map}</div>
 {page.destinations.some(r=>r.enabled)&&<ul className="sl-destinations" aria-label="Nearby destinations — reference demo distances">{page.destinations.filter(r=>r.enabled).map(r=><li key={r.id} data-location-destination={r.id}><span>{r.name}</span><span>{r.distance}</span></li>)}</ul>}
 {page.notes.some(r=>r.enabled)&&<ul className="sl-notes" aria-label="Travel notes — reference demo estimates">{page.notes.filter(r=>r.enabled).map(r=><li key={r.id} data-location-note={r.id}>{r.text}</li>)}</ul>}
 </div></section>
 {referenceComparison&&n?.referenceDemoVisual&&<section className="sl-newsletter" aria-labelledby="sl-newsletter-title" data-newsletter-demo="unavailable"><div className="sl-postcard"><Photo image={n.image} sizes="(max-width:900px) 52vw,18vw"/></div><div className="sl-newsletter-copy"><p className="sl-eyebrow">{n.eyebrow}</p><h2 id="sl-newsletter-title">{n.heading}</h2><div className="sl-inactive-field"><label htmlFor="sl-newsletter-email">{n.fieldLabel}</label><input id="sl-newsletter-email" type="email" disabled aria-describedby="sl-newsletter-status"/><button type="button" disabled>{n.actionLabel}</button></div><p id="sl-newsletter-status" className="sl-newsletter-status">Reference demo only. Newsletter unavailable; no email is collected.</p></div></section>}
 </main></div>;
}
