import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {acquireDemoLock} from '../scripts/local-demo-lifecycle';

test('demo lock refuses live or ambiguous owners, recovers dead owners and releases only itself',async()=>{
  const root=await mkdtemp(path.join(tmpdir(),'villa-launcher-')),file=path.join(root,'running.lock');
  try{
    await writeFile(file,String(process.pid));await assert.rejects(acquireDemoLock(file),/locked/);
    assert.equal(await readFile(file,'utf8'),String(process.pid));
    await writeFile(file,'unknown');await assert.rejects(acquireDemoLock(file),/locked/);
    await writeFile(file,'2147483647');const release=await acquireDemoLock(file);
    assert.equal(await readFile(file,'utf8'),String(process.pid));
    await writeFile(file,'different-owner');await release();assert.equal(await readFile(file,'utf8'),'different-owner');
    await writeFile(file,String(process.pid));await release();await assert.rejects(readFile(file),{code:'ENOENT'});
  }finally{await rm(root,{recursive:true,force:true});}
});
