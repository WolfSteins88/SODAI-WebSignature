import 'server-only';
import {del, get, put} from '@vercel/blob';
/** Private Vercel Blob store with the same set/get/delete surface as Netlify Blobs. */
export function vercelMediaStore(namespace:string) {
  if (!/^villa-[a-f0-9]{64}$/.test(namespace)) throw Error('Invalid media namespace');
  const pathname=(key:string)=>{
    if (!/^[0-9a-f-]{36}\.webp$/.test(key)) throw Error('Invalid image key');
    return `${namespace}/${key}`;
  };
  return {
    async set(key:string,bytes:ArrayBuffer,_options?:unknown) {
      await put(pathname(key),Buffer.from(bytes),{access:'private',addRandomSuffix:false,allowOverwrite:false,contentType:'image/webp'});
    },
    async get(key:string,_options?:{type:'arrayBuffer'}):Promise<ArrayBuffer|null> {
      const result=await get(pathname(key),{access:'private',useCache:false});
      if (!result || result.statusCode!==200) return null;
      return new Response(result.stream).arrayBuffer();
    },
    async delete(key:string) {
      await del(pathname(key));
    },
  };
}
