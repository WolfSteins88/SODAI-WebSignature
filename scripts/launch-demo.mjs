// Built-ins only: normal startup never invokes npm, installs packages or builds.
import {readFile,access} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {createInterface} from 'node:readline';

const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
process.chdir(project);
const port=Number(process.env.LOCAL_DEMO_PORT||3112),dataset=process.env.LOCAL_DEMO_DATASET||'signature';
const noBrowser=process.argv.includes('--no-browser');
function alive(pid){try{process.kill(pid,0);return true;}catch(error){return error.code!=='ESRCH';}}
async function existing(){
  const root=path.join(project,'local-data',dataset);
  let metadata;
  try{metadata=JSON.parse(await readFile(path.join(root,'running.json'),'utf8'));}catch(error){if(error.code==='ENOENT')return null;throw Error('Unreadable local running.json. Stop the demo and inspect this file; saved content was not changed.');}
  if(!Number.isSafeInteger(metadata.pid)||metadata.pid<1)throw Error('Invalid runner identity. Inspect local-data running.json before restarting.');
  if(!alive(metadata.pid))return null;
  if(metadata.version!==1||metadata.project!==project||metadata.port!==port||!Number.isInteger(metadata.controlPort)||metadata.controlPort<1||metadata.controlPort>65535||!/^[a-f0-9]{64}$/.test(metadata.token))throw Error('A live runner uses this dataset with different configuration. Stop its demo window first.');
  let status;
  try{const response=await fetch(`http://127.0.0.1:${metadata.controlPort}/status`,{headers:{authorization:`Bearer ${metadata.token}`},signal:AbortSignal.timeout(2000)});if(response.ok)status=await response.json();}catch{}
  if(status?.ready!==true||status.project!==project||status.pid!==metadata.pid||status.port!==port)throw Error('Dataset has a live PID but its demo identity could not be verified. No browser opened and no process killed. Stop its original window first.');
  const origin=`http://localhost:${port}`;
  if(!(await fetch(origin+'/admin/login',{signal:AbortSignal.timeout(3000)})).ok)throw Error('Verified demo is not ready. Check its original server window.');
  return origin;
}
async function openBrowser(origin){
  if(noBrowser){console.log(`Browser suppressed for verification: ${origin}/`);return;}
  if(process.platform!=='win32'){console.log(`Open ${origin}/ in your browser.`);return;}
  // Constant loopback URL passed through the environment, never shell interpolation.
  await new Promise((resolve,reject)=>{
    const child=spawn('powershell.exe',['-NoProfile','-NonInteractive','-Command','Start-Process -FilePath $env:VILLA_DEMO_READY_URL'],{env:{...process.env,VILLA_DEMO_READY_URL:origin+'/'},windowsHide:true,stdio:'inherit'});
    child.once('error',reject);child.once('exit',code=>code===0?resolve():reject(Error(`Browser could not open. Open ${origin}/ manually.`)));
  });
}
async function main(){
  if(Number(process.versions.node.split('.')[0])<24)throw Error('Node.js 24 LTS or newer is required; Node 24 is the tested version.');
  if(!Number.isInteger(port)||port<1024||port>65535||!/^[a-z0-9-]{1,60}$/.test(dataset))throw Error('Invalid LOCAL_DEMO_PORT (1024–65535) or LOCAL_DEMO_DATASET (lowercase letters, digits, hyphens).');
  for(const file of ['package.json','node_modules/tsx/package.json','node_modules/next/dist/bin/next','node_modules/@electric-sql/pglite/package.json','.next/BUILD_ID']){
    try{await access(path.join(project,file));}catch{throw Error(`Missing ${file}. First-time online setup: npm ci, then npm run build. Nothing was installed automatically.`);}
  }
  const running=await existing();
  if(running){
    if(process.argv.includes('--stop')){
      const metadata=JSON.parse(await readFile(path.join(project,'local-data',dataset,'running.json'),'utf8'));
      const response=await fetch(`http://127.0.0.1:${metadata.controlPort}/stop`,{method:'POST',headers:{authorization:`Bearer ${metadata.token}`},signal:AbortSignal.timeout(3000)});
      if(response.status!==202)throw Error('Verified runner refused shutdown. Use its original window.');
      console.log('Safe shutdown requested for this project’s verified demo.');return;
    }
    console.log(`Reusing this project's verified demo: ${running}/`);await openBrowser(running);return;
  }
  if(process.argv.includes('--stop'))throw Error('No verified demo is running for this dataset/port. Nothing was stopped.');
  console.log(`Starting Villa Studio on port ${port}. Existing content and uploads are preserved.`);
  const child=spawn(process.execPath,['--conditions=react-server','--import','tsx','scripts/demo-local.ts'],{cwd:project,env:{...process.env,LOCAL_DEMO_VISIBLE_LOGS:'1'},windowsHide:true,stdio:['ignore','inherit','inherit','ipc']});
  let stopping=false,ready=false;
  const stop=()=>{if(stopping)return;stopping=true;console.log('Stopping owned demo processes and flushing the database…');if(child.connected)child.send({type:'stop'});};
  const input=createInterface({input:process.stdin,output:process.stdout});input.on('line',stop);
  process.on('SIGINT',stop);process.on('SIGTERM',stop);
  await new Promise((resolve,reject)=>{
    child.once('error',reject);
    child.on('message',async message=>{
      if(message?.type==='stopped'){if(child.connected)child.disconnect();return;}
      if(message?.type!=='ready'||ready)return;
      try{const origin=await existing();if(!origin)throw Error('Runner ready signal has no verifiable identity.');ready=true;console.log(`Ready: ${origin}/ · CMS: ${origin}/admin/login`);console.log('Keep this window open. Press Enter or Ctrl+C to stop safely.');if(!stopping)await openBrowser(origin);}
      catch(error){console.error(error.message);if(!ready)stop();}
    });
    child.once('exit',code=>{input.close();process.removeListener('SIGINT',stop);process.removeListener('SIGTERM',stop);if(code===0)resolve();else reject(Error(`Demo exited with code ${code}. Read the startup error above. No unrelated process was stopped.`));});
  });
}
main().catch(error=>{console.error(`\nVilla Studio could not start: ${error.message}`);process.exitCode=1;});
