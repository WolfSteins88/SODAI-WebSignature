import type {VillaContent} from '../schemas/content';
/** Resolve explicit shared slots without modifying the stored editable snapshot. */
export function resolveBranding(input:VillaContent):VillaContent {
 const b=input.branding;if(!b)return input;
 const c=structuredClone(input);
 const neutral={src:'/images/neutral-brand.svg',alt:c.name,category:'Spaces' as const};
 if(b.useSharedSlots){
  if(c.signatureMenu){c.signatureMenu.logo=b.logo||neutral;
   const frame=c.signatureMenu.introBrand;
   c.signatureMenu.introBrand=frame&&b.emblem&&b.wordmark?{...frame,emblem:b.emblem,wordmark:b.wordmark}:undefined;
  }
  if(c.signatureStory){c.signatureStory.railEmblem=b.emblem||undefined;
   c.signatureStory.sections=c.signatureStory.sections.map(p=>p.layout==='intro'?{...p,logo:b.logo||neutral}:p);
  }
 }
 if(b.useSharedHero&&c.signatureStory)c.signatureStory.sections=c.signatureStory.sections.map(p=>p.layout==='opener'?{...p,image:c.hero,title:c.heroTitle}:p);
 return c;
}
