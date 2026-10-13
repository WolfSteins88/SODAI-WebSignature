import type {VillaContent} from '../schemas/content';
export type VillaPackage=VillaContent['packages'][number];
/** Validated published settings only. Creating a URL never sends an enquiry. */
export function packageEnquiry(content:VillaContent,item:VillaPackage){
 const config=item.signature?.enquiry;
 const context=`Hello, I would like to enquire about ${item.title} at ${content.name}.`;
 if(config?.type==='whatsapp')return `https://wa.me/${config.phone}?text=${encodeURIComponent(context)}`;
 const external=config?.type==='external'?config.url:content.booking.mode!=='whatsapp'?content.booking.url:'';
 if(external){const url=new URL(external);url.searchParams.set('villa',content.name);url.searchParams.set('package',item.title);return url.toString();}
 if(content.booking.mode!=='external'&&content.booking.whatsapp)return `https://wa.me/${content.booking.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(context)}`;
 return null;
}
