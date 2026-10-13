import type {VillaContent} from '../schemas/content';
export type RoomGridPhoto={id:string;enabled:boolean;image:VillaContent['hero'];caption?:string};
/** Explicit empty collection stays empty. Legacy showcase media is retained without duplication or truncation. */
export function roomPhotoGrid(room:VillaContent['rooms'][number]):RoomGridPhoto[]{
 const s=room.signature;
 if(s?.photoGrid)return s.photoGrid.filter(p=>p.enabled);
 if(!s?.showcase)return [];
 return (['wide','small','tall'] as const).map(key=>({id:`${room.slug}-${key}`,enabled:true,image:s.showcase![key]}));
}
