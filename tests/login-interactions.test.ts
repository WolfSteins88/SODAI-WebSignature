import {test} from "node:test";
import assert from "node:assert/strict";
import {createSlideGesture, baliClock, createSubmissionGate} from "../src/components/admin/login-interactions";
test("slide follows grab offset and CSS scale; only the endpoint commits",()=>{
 const drag=createSlideGesture();drag.start(1,100,0,224,.5);
 assert.equal(drag.move(1,150),100);assert.equal(drag.finish(1,false).commit,false);
 drag.start(2,100,0,224,1);assert.equal(drag.move(2,500),224);assert.equal(drag.finish(2,false).commit,true);assert.equal(drag.finish(2,false).commit,false);
});
test("cancel at endpoint and unrelated pointers never submit",()=>{
 const drag=createSlideGesture();drag.start(7,20,0,200,1);assert.equal(drag.move(8,300),null);assert.equal(drag.finish(8,false).matched,false);
 drag.move(7,300);assert.equal(drag.finish(7,true).commit,false);
 drag.start(7,20,0,200,1);drag.move(7,300);drag.cancel();assert.equal(drag.finish(7,false).commit,false);
});
test("Bali clock rolls UTC date forward using Asia/Makassar",()=>{
 const value=baliClock(new Date("2026-10-12T17:02:03Z"));assert.equal(value.time,"01:02");assert.equal(value.seconds,"01:02:03");assert.match(value.date,/Tuesday/);assert.match(value.date,/13 October 2026/);
});
test("submission gate rejects reentrant requests and allows retry after failure",()=>{
 const gate=createSubmissionGate();assert.equal(gate.enter(),true);assert.equal(gate.enter(),false);gate.release();assert.equal(gate.enter(),true);assert.equal(gate.enter(),false);
});
