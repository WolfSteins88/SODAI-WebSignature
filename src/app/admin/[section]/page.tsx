import {variant} from '@/lib/config';
import {notFound} from 'next/navigation';
import {requireAccess} from '@/lib/security/access';
import {renderDashboard} from '../page';
export const dynamic='force-dynamic';
export default async function Section({params}:{params:Promise<{section:string}>}){const {section}=await params;if(!['dashboard','identity','pages','navigation','story','copy','rooms','culinary','culture','foundation','packages','gallery','location','terms','standard','booking','other','media','revisions','diagnostics'].includes(section))notFound();if((variant==='signature'&&section==='standard')||(variant==='standard'&&section==='foundation'))notFound();if(section==='diagnostics'){let p;try{p=await requireAccess();}catch{notFound();}if(p.role!=='super_admin')notFound();}return renderDashboard(section);}
