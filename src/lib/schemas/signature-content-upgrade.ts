/** Compatible JSON-contract upgrade; never merges a draft into a publication. */
export function upgradeSignatureContent(input: unknown): unknown {
  if (!input || typeof input !== "object") return input;
  const value = input as Record<string, any>;
  let result = value;
  if (Array.isArray(value.signatureStory?.sections)) {
    result = {...result,signatureStory:{...value.signatureStory,sections:value.signatureStory.sections.map((section: Record<string,unknown>) =>
      section && section.id === "documentary-still" && section.layout === "still"
        ? {id:section.id,layout:"video",enabled:false,source:"",poster:null} : section)}};
  }
  if (Array.isArray(value.signatureMenu?.social)) {
    result = {...result,signatureMenu:{...value.signatureMenu,social:value.signatureMenu.social.map((link:Record<string,any>,index:number) => {
      if (!link || typeof link !== "object") return link;
      if (link.platform || typeof link.label !== "string") return link;
      const platform = link.label.toLowerCase();
      return {id:`social-${platform}`,platform,url:link.url,order:index,enabled:true};
    })}};
  }
  for(const key of ['rooms','experiences','packages'])if(Array.isArray(result[key])){
    result={...result,[key]:result[key].map((item:Record<string,unknown>)=>({...item,id:item.id||`${key}-${item.slug}`}))};
  }
  return result;
}
