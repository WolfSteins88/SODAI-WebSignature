import {readFile,writeFile,unlink} from 'node:fs/promises';
import {createServer} from 'node:http';
import {randomBytes} from 'node:crypto';
import path from 'node:path';

export function processAlive(pid:number) {
  if(!Number.isSafeInteger(pid)||pid<1)return false;
  try{process.kill(pid,0);return true;}catch(error){return (error as NodeJS.ErrnoException).code!=='ESRCH';}
}

/** Only a provably dead PID can relinquish this dataset. Never terminate it. */
export async function acquireDemoLock(file:string) {
  try{await writeFile(file,String(process.pid),{flag:'wx'});}
  catch(error){
    if((error as NodeJS.ErrnoException).code!=='EEXIST')throw error;
    const value=await readFile(file,'utf8'),pid=Number(value.trim());
    if(!/^\d+$/.test(value.trim())||processAlive(pid))throw Error(`Dataset is locked by PID ${value.trim()}. Stop its demo window first. No process was killed.`);
    await unlink(file);
    await writeFile(file,String(process.pid),{flag:'wx'});
    console.log('Recovered a lock belonging to a stopped process; saved content retained.');
  }
  return async()=>{try{if((await readFile(file,'utf8')).trim()===String(process.pid))await unlink(file);}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}};
}

/** Private loopback identity handshake: an arbitrary HTTP 200 is not our demo. */
export async function announceDemo(root:string,port:number,onStop:()=>Promise<void>) {
  const token=randomBytes(32).toString('hex'),project=path.resolve('.'),file=path.join(root,'running.json');
  const server=createServer((request,response)=>{
    if(request.headers.authorization!==`Bearer ${token}`){response.writeHead(404).end();return;}
    if(request.method==='POST'&&request.url==='/stop'){
      response.writeHead(202).end('Stopping');setImmediate(()=>{void onStop().catch(console.error);});return;
    }
    if(request.method!=='GET'||request.url!=='/status'){response.writeHead(404).end();return;}
    response.setHeader('Content-Type','application/json');response.setHeader('Cache-Control','no-store');
    response.end(JSON.stringify({version:1,project,pid:process.pid,port,ready:true}));
  });
  await new Promise<void>((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',()=>resolve());});
  const address=server.address();if(!address||typeof address==='string')throw Error('Missing local control address');
  try{await writeFile(file,JSON.stringify({version:1,project,pid:process.pid,port,controlPort:address.port,token}),{mode:0o600});}
  catch(error){server.close();throw error;}
  return async()=>{
    await new Promise<void>(resolve=>server.close(()=>resolve()));
    try{const metadata=JSON.parse(await readFile(file,'utf8'));if(metadata.pid===process.pid&&metadata.token===token)await unlink(file);}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}
  };
}
