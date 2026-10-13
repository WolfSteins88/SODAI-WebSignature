import {HttpError} from './errors';
export async function boundedBytes(request:Request,limit:number){
 if(!request.body)throw new HttpError(400,'Missing request body.');
 const reader=request.body.getReader(),chunks:Uint8Array[]=[];let size=0;
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();throw new HttpError(413,'Request is too large.');}chunks.push(value);}return Buffer.concat(chunks);
}
export async function boundedJSON(request:Request,limit=2*1024*1024){try{return JSON.parse((await boundedBytes(request,limit)).toString('utf8'));}catch(e){if(e instanceof HttpError)throw e;throw new HttpError(400,'Invalid JSON.');}}
