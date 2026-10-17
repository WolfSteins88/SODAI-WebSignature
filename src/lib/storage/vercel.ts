import 'server-only';
import {del, get, put} from '@vercel/blob';
/** Vercel Blob with the same interface as Netlify Blobs; private, so bytes reach visitors only through /api/media. */
export function vercelBlobMediaStore(namespace:string) {
  if (!/^villa-[a-f0-9]{64}$/.test(namespace)) throw Error('Invalid media namespace');
  const pathname=(key:string)=>{
    if (!/^[0-9a-f-]{36}\.webp$/.test(key)) throw Error('Invalid image key');
    return `${namespace}/${key}`;
  };
  return {
    async set(key:string,bytes:ArrayBuffer,_options?:unknown) {
      await put(pathname(key),Buffer.from(bytes),{access:'private',contentType:'image/webp',addRandomSuffix:false,allowOverwrite:false});
    },
    async get(key:string,_options?:{type:'arrayBuffer'}):Promise<ArrayBuffer|null> {
      const result=await get(pathname(key),{access:'private',useCache:false});
      if(!result||result.statusCode!==200)return null;
      return new Response(result.stream).arrayBuffer();
    },
    async delete(key:string) {
      await del(pathname(key));
    },
  };
}
