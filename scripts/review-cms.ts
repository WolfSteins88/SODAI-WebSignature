import {readFile} from 'node:fs/promises';
import {parseEnv} from 'node:util';
import {startStandardFixture} from './standard-fixture';
async function main(){try{Object.assign(process.env,parseEnv(await readFile(process.argv[2]||'.env.provisioned','utf8')));}catch{console.error('Local accounts unavailable. Run npm run accounts:provision privately before review:cms.');process.exit(1);}
const fixture=await startStandardFixture(3112,process.env.TEMPLATE_VARIANT==='standard'?'standard':'signature',true);
console.log('CMS review: http://localhost:3112/admin/login (use this hostname for origin-bound sign-in). Local persistent PostgreSQL fixture; Netlify Blobs not emulated.');
process.on('SIGINT',async()=>{await fixture.stop();process.exit(0);});

}
main().catch(e=>{console.error(e instanceof Error?e.message:"Review failed");process.exitCode=1;});
