import {access,cp,mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
async function main(){
const [action,name,variant='signature']=process.argv.slice(2);
if(!['backup','restore'].includes(action)||!name||!/^[a-z0-9-]{1,60}$/.test(name)||!['standard','signature'].includes(variant))throw Error('Usage: npm run demo:data -- backup|restore backup-name [signature|standard]');
const dataset=process.env.LOCAL_DEMO_DATASET||variant;if(!/^[a-z0-9-]{1,60}$/.test(dataset))throw Error('Invalid dataset');
const root=path.resolve('local-data',dataset),backup=path.resolve('local-data','backups',name);
try{await access(path.join(root,'running.lock'));throw Error('Stop the demo before backup/restore. If it crashed, confirm its process is stopped before removing running.lock.');}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}
if(action==='backup'){
 await mkdir(path.dirname(backup),{recursive:true});
 await mkdir(backup,{recursive:false});
 await cp(path.join(root,'database'),path.join(backup,'database'),{recursive:true,errorOnExist:true,force:false});
 try{await cp(path.join(root,'media'),path.join(backup,'media'),{recursive:true,errorOnExist:true,force:false});}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}
 await writeFile(path.join(backup,'manifest.json'),JSON.stringify({version:1,variant,createdAt:new Date().toISOString()}));
}else{
 const manifest=JSON.parse(await readFile(path.join(backup,'manifest.json'),'utf8'));if(manifest.version!==1||manifest.variant!==variant)throw Error('Backup variant mismatch');
 try{await access(root);throw Error('Restore requires an absent data directory. Move the existing directory aside first; this command never overwrites it.');}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}
 await mkdir(root,{recursive:true});await cp(path.join(backup,'database'),path.join(root,'database'),{recursive:true,errorOnExist:true,force:false});
 try{await cp(path.join(backup,'media'),path.join(root,'media'),{recursive:true,errorOnExist:true,force:false});}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}
}
console.log(action==='backup'?'Content and media backed up; runtime credentials excluded.':'Content and media restored; runtime credentials regenerate on startup.');

}
void main().catch(e=>{console.error(e);process.exitCode=1;});
