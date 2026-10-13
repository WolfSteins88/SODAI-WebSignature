import type {VillaContent} from '../schemas/content';
export function visibleContent(content:VillaContent):VillaContent{
 const on=(route:string)=>!content.pages?.some(p=>!p.enabled&&(route===p.route||route.startsWith(p.route+'/')));
 return {...content,rooms:content.rooms.filter(r=>r.enabled!==false&&on('/rooms/'+r.slug)),experiences:content.experiences.filter(r=>r.enabled!==false&&on('/experiences/'+r.slug)),packages:content.packages.filter(r=>r.enabled!==false&&on('/packages/'+r.slug)),culture:content.culture?{...content.culture,entries:content.culture.entries.filter(e=>e.enabled&&on('/culture/'+e.slug))}:undefined};
}
export function navigationLinks(content:VillaContent,links:string[][]){
 if(!content.navigation)return links;
 return links.filter(([,route])=>content.navigation?.find(n=>n.route===route)?.visible!==false)
 .map(([label,route])=>[content.navigation?.find(n=>n.route===route)?.label||label,route])
 .sort((a,b)=>(content.navigation?.find(n=>n.route===a[1])?.order??999)-(content.navigation?.find(n=>n.route===b[1])?.order??999));
}
