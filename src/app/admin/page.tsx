import {redirect} from 'next/navigation';
import {z} from 'zod';
import {requireAccess} from '@/lib/security/access';
import {draftState} from '@/lib/content/service';
import {scope,variant} from '@/lib/config';
import {contentContract} from '@/lib/schemas/content';
import {publicPaths} from '@/lib/content/public-routes';
import {defaultPublicCopy} from '@/lib/content/public-copy';
import {Editor} from '@/components/admin/editor';
export const dynamic='force-dynamic';
export async function renderDashboard(section="dashboard"){let principal;try{principal=await requireAccess();}catch{redirect('/admin/login');}let state;try{state=await draftState();}catch{return <main className="login-page"><section className="admin-card"><h1>Content unavailable</h1><p>Complete database migrations and seed setup, then reload this page.</p><a href="/admin">Retry</a></section></main>;}
 const draft=structuredClone(state.draft);draft.publicCopy ||= {...defaultPublicCopy};const routes=[...new Set(['/',...(variant==='standard'?['/story']:[]),'/rooms','/gallery','/location','/dining','/experiences','/packages','/terms',...(variant==='signature'?['/cultures','/foundation','/restaurant-menu']:[]),...draft.rooms.map(r=>'/rooms/'+r.slug),...draft.experiences.map(r=>'/experiences/'+r.slug),...draft.packages.map(r=>'/packages/'+r.slug),...(draft.culture?.entries||[]).map(r=>'/culture/'+r.slug)])];
 draft.navigation ||= routes.filter(r=>!r.includes('/',1)).map((route,i)=>({id:'nav-'+i,route,label:(variant==='standard'?({'/':'Home','/story':'Story','/rooms':'Rooms','/gallery':'Gallery','/location':'Location','/dining':'Dining','/experiences':'Experiences','/packages':'Packages','/terms':'Terms'} as Record<string,string>)[route]:({'/':'Our Story','/rooms':'Rooms','/dining':'Culinary','/cultures':'Cultures','/gallery':'Gallery','/foundation':'The Foundation','/packages':'Packages & Activities','/location':'Getting Here','/terms':'Terms & Conditions'} as Record<string,string>)[route])||route.slice(1),visible:true,order:i}));
 draft.pages ||= routes.map((route,i)=>({id:'page-'+i,route,enabled:true,title:'',description:''}));
 return <Editor initial={JSON.parse(JSON.stringify({...state,draft}))} contract={z.toJSONSchema(contentContract,{io:'input',unrepresentable:'any'}) as any} role={principal.role} environment={scope.environment} routes={routes} variant={variant} previewScope={principal.scope} previewVersion={principal.version} initialSection={section}/>;
}

export default async function Dashboard(){return renderDashboard();}
