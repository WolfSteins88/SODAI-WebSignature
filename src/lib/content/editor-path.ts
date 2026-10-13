import {HttpError} from '../security/errors';
const forbidden=new Set(['__proto__','constructor','prototype']);
export function atPath(root:unknown,path:string[]):any{
 let node:any=root;
 for(const key of path){if(forbidden.has(key))throw new HttpError(422,'Invalid content path.');
 if(key.startsWith('@')){if(!Array.isArray(node))throw new HttpError(422,'Collection moved.');node=node.find((v:any)=>(v.id||v.slug)===key.slice(1));}
 else node=node?.[key];
 }return node;
}
export function stablePath(root:unknown,path:string[]):string[]{let node:any=root;return path.map(key=>{const value=node?.[key];const out=Array.isArray(node)&&value&&typeof value==='object'&&(value.id||value.slug)?'@'+(value.id||value.slug):key;node=value;return out;});}
