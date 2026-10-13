const timeFormat = new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Makassar",hour:"2-digit",minute:"2-digit",hourCycle:"h23"});
const secondsFormat = new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Makassar",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"});
const dateFormat = new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Makassar",weekday:"long",day:"numeric",month:"long",year:"numeric"});
export function baliClock(now:Date){return {time:timeFormat.format(now),seconds:secondsFormat.format(now),date:dateFormat.format(now)};}
export function createSubmissionGate(){let busy=false;return {enter(){if(busy)return false;busy=true;return true;},release(){busy=false;}};}
export function createSlideGesture(){
 let grip:{id:number;start:number;position:number;travel:number;scale:number;x:number}|undefined;
 return {
  start(id:number,start:number,position:number,travel:number,scale:number){grip={id,start,position,travel,scale:scale||1,x:position};},
  move(id:number,clientX:number){if(!grip || grip.id!==id)return null;grip.x=Math.max(0,Math.min(grip.travel,grip.position+(clientX-grip.start)/grip.scale));return grip.x;},
  finish(id:number,cancelled:boolean){if(!grip || grip.id!==id)return {matched:false,commit:false};const commit=!cancelled && grip.travel>0 && grip.x>=grip.travel;grip=undefined;return {matched:true,commit};},
  cancel(){grip=undefined;},
 };
}
