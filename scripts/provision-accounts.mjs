import {createInterface} from 'node:readline/promises';
import {Writable} from 'node:stream';
import {writeFile} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import {hash} from 'bcryptjs';
import {Secret,TOTP} from 'otpauth';
if(!process.stdin.isTTY)throw Error('Run interactively. Secrets are never command-line arguments.');
const quiet=new Writable({write(_c,_e,done){done();}});
const input=createInterface({input:process.stdin,output:quiet,terminal:true});
const lines=['AUTH_SECRET='+randomBytes(48).toString('base64url'),'AUTH_SESSION_VERSION=1'];
try{for(const prefix of ['OWNER','SUPER_ADMIN']){
 process.stdout.write(prefix+' identifier (hidden): ');const id=(await input.question('')).trim().toLowerCase();
 if(!/^[a-z0-9@._-]{1,120}$/.test(id)||lines.some(l=>l.endsWith('_IDENTIFIER='+id)))throw Error('Identifiers must be distinct, using letters, digits, @, period, underscore or hyphen');
 process.stdout.write('\nPassword (hidden, 12+ characters): ');const password=await input.question('');
 if(password.length<12||Buffer.byteLength(password)>72)throw Error('Password length rejected');
 const secret=new Secret().base32;
 lines.push(prefix+'_IDENTIFIER='+id,prefix+'_PASSWORD_HASH='+await hash(password,12),prefix+'_TOTP_SECRET='+secret);
 const otp=new TOTP({issuer:'Sodai CMS',label:id,secret,algorithm:'SHA1',digits:6,period:30});
 lines.push('# Import this URI into your authenticator out of band: '+otp.toString());
 process.stdout.write('\n');
}await writeFile('.env.provisioned',lines.join('\n')+'\n',{flag:'wx',mode:0o600});
 process.stdout.write('Created ignored .env.provisioned. Open privately to provision both authenticators and server environment variables. It contains secrets; never share or package it.\n');
}finally{input.close();}
