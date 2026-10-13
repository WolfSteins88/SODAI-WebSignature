import {test} from "node:test";
import assert from "node:assert/strict";
import {createLogoGesture} from "../src/components/signature/logo-gesture";

function fixture(){
 let action: (()=>void)|undefined, home=0, cms=0;
 const gesture=createLogoGesture(()=>home++,()=>cms++,{
  set:(callback,delay)=>{assert.equal(delay,300);action=callback;return 1 as unknown as ReturnType<typeof setTimeout>;},
  clear:()=>{action=undefined;},
 });
 return {gesture,flush:()=>{const callback=action;action=undefined;callback?.();},counts:()=>[home,cms]};
}
test("logo single waits; second click cancels Home and enters CMS exactly once",()=>{
 const f=fixture();f.gesture.click();assert.deepEqual(f.counts(),[0,0]);f.gesture.click();f.flush();assert.deepEqual(f.counts(),[0,1]);
});
test("spaced clicks remain two Home activations, never CMS",()=>{
 const f=fixture();f.gesture.click();f.flush();f.gesture.click();f.flush();assert.deepEqual(f.counts(),[2,0]);
});
test("blur, Escape, menu close and unmount can cancel pending activation",()=>{
 const f=fixture();f.gesture.click();f.gesture.cancel();f.flush();assert.deepEqual(f.counts(),[0,0]);f.gesture.click();f.flush();assert.deepEqual(f.counts(),[1,0]);
});
