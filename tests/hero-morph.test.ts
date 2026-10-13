import {test} from 'node:test';
import assert from 'node:assert/strict';
import {intermediateHero,coverHero,HERO_MORPH,HEROLESS_MOTION,transitionBranch} from '../src/components/signature/hero-morph-geometry';
test('Hero small frame uses content viewport excluding desktop rail and shares one swap geometry',()=>{
 const view={left:51,top:0,width:1228,height:700};const small=intermediateHero(view,false);
 assert.equal(small.width,view.width*.28);assert.equal(small.left+small.width/2,view.left+view.width/2);
 assert.equal(small.top+small.height/2,350);
 for(const [w,h] of [[1920,1080],[1600,2400]]){const fit=coverHero(small,w,h,{x:.5,y:.5});assert.ok(w*fit.scale>=small.width-.00001);assert.ok(h*fit.scale>=small.height-.00001);assert.equal(fit.x,(small.width-w*fit.scale)/2);}
 assert.ok(HERO_MORPH.shrink+HERO_MORPH.swap+HERO_MORPH.expand-HERO_MORPH.overlap>=1.6);
 assert.ok(HERO_MORPH.shrink+HERO_MORPH.swap+HERO_MORPH.expand-HERO_MORPH.overlap<=1.8);
});
test('Mobile intermediate frame fits safe content area; final cover preserves aspect and focal point',()=>{
 for(const width of [360,390]){const view={left:0,top:79,width,height:721};const small=intermediateHero(view,true);assert.ok(small.left>0&&small.left+small.width<width);assert.ok(small.top>=79&&small.top+small.height<=800);}
 const final={left:0,top:0,width:1279,height:700},fit=coverHero(final,1920,1080,{x:0,y:1});assert.equal(fit.x,0);assert.equal(fit.y,final.height-1080*fit.scale);
});

test('All four transition kinds remain explicit with distinct duration budgets',()=>{
 assert.equal(transitionBranch('hero','hero'),'hero-to-hero');
 assert.equal(transitionBranch('hero','none'),'hero-to-none');
 assert.equal(transitionBranch('none','hero'),'none-to-hero');
 assert.equal(transitionBranch('none','none'),'none-to-none');
 const leaving=HERO_MORPH.shrink+HEROLESS_MOTION.dissolve+HEROLESS_MOTION.reveal;
 const entering=HEROLESS_MOTION.out+HEROLESS_MOTION.appear+HEROLESS_MOTION.expand;
 const simple=HEROLESS_MOTION.out+HEROLESS_MOTION.contentReveal;
 assert.ok(leaving>=.9&&leaving<=1.2);
 assert.ok(entering>=1.1&&entering<=1.5);
 assert.ok(simple>=.5&&simple<=.7);
});
