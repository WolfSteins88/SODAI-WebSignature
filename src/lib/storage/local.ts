import 'server-only';
import {mkdir, readFile, writeFile, unlink} from 'node:fs/promises';
import path from 'node:path';
/** Persistent immutable bytes. Metadata and authorization remain in PostgreSQL/routes. */
export function filesystemMediaStore(root:string, namespace:string) {
  if (!/^villa-[a-f0-9]{64}$/.test(namespace)) throw Error('Invalid media namespace');
  const directory=path.join(root,'media',namespace);
  const filename=(key:string)=>{
    if (!/^[0-9a-f-]{36}\.webp$/.test(key)) throw Error('Invalid image key');
    return path.join(directory,key);
  };
  return {
    async set(key:string,bytes:ArrayBuffer,_options?:unknown) {
      const target=filename(key);await mkdir(directory,{recursive:true});
      await writeFile(target,new Uint8Array(bytes),{flag:'wx',mode:0o600});
    },
    async get(key:string,_options?:{type:'arrayBuffer'}):Promise<ArrayBuffer|null> {
      try {const bytes=await readFile(filename(key));return Uint8Array.from(bytes).buffer;}
      catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return null;throw e;}
    },
    async delete(key:string) {
      try {await unlink(filename(key));}
      catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}
    },
  };
}
