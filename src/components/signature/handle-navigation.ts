import {gsap} from 'gsap';
import {capturePublicPage,prepareHeroReveal,revealPreparedHero} from './handle-reveal';

/** Rail-logo route handoff. The visible source stays until the destination's
 * actual responsive image is decoded; one commit and one cancellable timeline. */
export function beginHandleNavigation({root,site,href,commit,exit,reduced}:{root:HTMLElement;site:HTMLElement;href:string;commit:()=>void;exit:Promise<boolean>;reduced:boolean}) {
  const host=document.createElement('div');host.className='sg-handle-route-layer';host.setAttribute('aria-hidden','true');host.dataset.phase='prepare';
  host.style.background=site.dataset.signatureBackground||getComputedStyle(site).backgroundColor;
  host.append(capturePublicPage(site));document.body.append(host);
  const abort=new AbortController(),path=new URL(href,location.origin).pathname;
  let done=false,committed=false,started=false,timeline:gsap.core.Timeline|undefined,prepared:Awaited<ReturnType<typeof prepareHeroReveal>>=null;
  const inert=new Map<HTMLElement,boolean>();
  const block=(event:Event)=>event.preventDefault();
  const keys=(event:KeyboardEvent)=>{if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key))event.preventDefault();};
  host.addEventListener('wheel',block,{passive:false});host.addEventListener('touchmove',block,{passive:false});window.addEventListener('keydown',keys);
  document.documentElement.dataset.signatureNavigating='true';
  function lock(){const main=root.querySelector<HTMLElement>('.sg-site main');if(main&&!inert.has(main)){inert.set(main,main.inert);main.inert=true;}}
  function finish(focus=false){
    if(done)return;done=true;abort.abort();clearTimeout(deadline);observer.disconnect();timeline?.kill();prepared?.release();host.remove();window.removeEventListener('keydown',keys);
    inert.forEach((value,node)=>{node.inert=value;});delete document.documentElement.dataset.signatureNavigating;
    if(focus){const main=root.querySelector<HTMLElement>('.sg-site main');if(main){main.tabIndex=-1;main.focus({preventScroll:true});}}
  }
  async function ready(){
    lock();const page=root.querySelector<HTMLElement>('.sg-site');
    if(done||started||!committed||page?.dataset.signatureRoute!==path)return;
    started=true;observer.disconnect();window.scrollTo({top:0,left:0,behavior:'instant'});
    if(reduced){finish(true);return;}
    if(page.dataset.signatureTransition==='hero')prepared=await prepareHeroReveal(page,abort.signal);
    if(done){prepared?.release();return;}
    if(prepared){
      timeline=revealPreparedHero(prepared,{onStart:()=>{host.dataset.phase='reveal';},onComplete:()=>finish(true)});
      host.append(prepared.mask);timeline.play(0);
    }else{
      // Existing restrained hero-less/error fallback. Never use a thumbnail as a hero.
      host.dataset.phase='content-reveal';timeline=gsap.timeline({onComplete:()=>finish(true)}).to(host,{opacity:0,duration:.3,ease:'power1.inOut'});
    }
  }
  const observer=new MutationObserver(()=>{void ready();});observer.observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['data-signature-route']});lock();
  const deadline=setTimeout(()=>finish(committed),10000);
  void exit.then(proceed=>{
    if(done)return;if(!proceed){finish();return;}
    window.history.replaceState({...window.history.state,__sodaiScrollY:scrollY},'');committed=true;commit();void ready();
  },()=>finish());
  return ()=>finish(committed);
}
