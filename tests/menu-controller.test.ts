import {test} from "node:test";
import assert from "node:assert/strict";
import {createMenuController} from "../src/components/signature/menu-controller";

function fixture() {
  const events: string[] = [];
  const menu = createMenuController({phase:p=>events.push(p), activate:()=>events.push("lock"), deactivate:focus=>events.push(`unlock:${focus}`), move:open=>events.push(open?"play":"reverse"), navigate:href=>events.push(href)});
  return {menu, events};
}
test("interrupted closing retains one lock and ignores stale completion", () => {
  const {menu,events} = fixture();
  menu.toggle(); menu.toggle(); menu.toggle(); menu.closed();
  assert.equal(menu.phase,"opening");
  assert.equal(events.filter(e=>e==="lock").length,1);
  assert.ok(!events.some(e=>e.startsWith("unlock")));
  menu.opened(); menu.toggle(); menu.closed(); menu.closed();
  assert.equal(menu.phase,"closed");
  assert.equal(events.filter(e=>e==="unlock:true").length,1);
});
test("reopening cancels pending navigation; a completed exit navigates once", () => {
  const {menu,events} = fixture();
  menu.request(true); menu.opened(); menu.request(false,"/rooms"); menu.request(true); menu.closed(); menu.opened();
  assert.ok(!events.includes("/rooms"));
  menu.request(false,"/gallery"); menu.closed(); menu.closed();
  assert.equal(events.filter(e=>e==="/gallery").length,1);
  assert.ok(events.includes("unlock:false"));
});
test("Escape-like close cancels selection; route cleanup is idempotent", () => {
  const {menu,events} = fixture();
  menu.request(true); menu.request(false,"/rooms"); menu.request(false); menu.closed();
  assert.ok(!events.includes("/rooms"));
  menu.request(true); menu.reset(); menu.reset(); menu.opened(); menu.closed();
  assert.equal(menu.phase,"closed");
  assert.equal(events.filter(e=>e.startsWith("unlock")).length,2);
});
test("logo selection reuses reverse intent, commits once and cancels on reopen", () => {
  const moves: string[] = [], routes: string[] = [];
  const menu = createMenuController({phase:()=>{},activate:()=>{},deactivate:()=>{},move:(open,kind)=>moves.push(`${open}:${kind}`),navigate:(href,kind)=>routes.push(`${href}:${kind}`)});
  menu.request(true); menu.request(false,"/","logo"); menu.request(false,"/","logo");
  assert.deepEqual(moves.slice(-2),["false:logo","false:logo"]);
  menu.closed(); menu.closed();
  assert.deepEqual(routes,["/:logo"]);
  menu.request(true); menu.request(false,"/","logo"); menu.toggle(); menu.closed();
  assert.equal(routes.length,1);
});
test("closed rail logo can navigate without activating or locking the menu", () => {
  const {menu,events} = fixture();
  menu.request(false,"/","logo");
  assert.equal(menu.phase,"closed");
  assert.deepEqual(events,["/"]);
});

test("admin exit releases modal before one navigation and can be cancelled", () => {
 const events: string[] = [];
 const menu = createMenuController({phase:()=>{},activate:()=>{},deactivate:()=>events.push("unlock"),move:()=>{},navigate:(href,kind)=>events.push(`${href}:${kind}`)});
 menu.request(true); menu.opened(); menu.request(false,"/admin","admin");
 assert.deepEqual(events,[]);
 menu.closed(); menu.closed();
 assert.deepEqual(events,["unlock","/admin:admin"]);
 menu.request(true); menu.request(false,"/admin","admin"); menu.toggle(); menu.closed();
 assert.deepEqual(events,["unlock","/admin:admin"]);
 menu.request(false,"/admin","admin"); menu.request(false); menu.closed();
 assert.deepEqual(events,["unlock","/admin:admin","unlock"]);
});
