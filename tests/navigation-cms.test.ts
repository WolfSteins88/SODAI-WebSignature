import {test} from "node:test";
import assert from "node:assert/strict";
import {contentSchema} from "../src/lib/schemas/content";
import {demoContent} from "../src/lib/content/demo";
test("navigation CMS visibility upgrades legacy snapshots independently of footer",()=>{
 const legacy={...demoContent,showAdminLink:false} as Record<string,unknown>;
 delete legacy.showCmsLinkInNavigation;
 const parsed=contentSchema.parse(legacy);
 assert.equal(parsed.showCmsLinkInNavigation,true);
 assert.equal(parsed.showAdminLink,false);
 const hidden=contentSchema.parse({...parsed,showCmsLinkInNavigation:false,showAdminLink:true});
 assert.equal(hidden.showCmsLinkInNavigation,false);
 assert.equal(hidden.showAdminLink,true);
 assert.equal(contentSchema.safeParse({...parsed,showCmsLinkInNavigation:"false"}).success,false);
});
