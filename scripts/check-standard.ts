import assert from "node:assert/strict";
import { startStandardFixture } from "./standard-fixture";
import { demoContent } from "../src/lib/content/demo";
import { referenceDemoContent } from "../src/lib/content/signature-reference-demo";
import { publicPaths } from "../src/lib/content/public-routes";
async function main() {
  const variant = process.argv[2] === "signature" ? "signature" : "standard";
  const fixtureContent = variant === "signature" ? referenceDemoContent : demoContent;
  const fixture = await startStandardFixture(
    variant === "signature" ? 3113 : 3111,
    variant,
  );
  try {
    for (const route of publicPaths(fixtureContent, variant)) {
      const response = await fetch(fixture.origin + route);
      assert.equal(response.status, 200, route);
      const html = await response.text();
      assert.ok(html.includes('rel="canonical"'), route);
      assert.ok(html.includes(fixtureContent.name), route);
      if(variant==="signature"){
        const kind=["/gallery","/terms","/restaurant-menu"].includes(route)?"none":"hero";
        assert.ok(html.includes(`data-signature-transition="${kind}"`),route+" explicit transition ownership");
        assert.ok(html.includes(`data-signature-background="${route==="/restaurant-menu"?"#a62a23":"#f1ecde"}"`),route+" actual transition palette");
      }

      assert.ok(!/>\s*(?:Book (?:a )?(?:Room|Table)|Book Now|Reserve a table|Reserve now|Reserve your stay)[^<]*</i.test(html),route+" removed room/table controls");
      assert.ok(
        !html.includes("DRAFT NEVER PUBLIC") &&
          !html.includes("OTHER SITE NEVER PUBLIC"),
        route,
      );
    }
    if (variant === "signature") {
      const menuCase=structuredClone(fixtureContent);
      menuCase.signatureMenu!.social=[{id:"configured-instagram",platform:"instagram",url:"https://www.instagram.com/configured-account/",order:0,enabled:true}];
      await fixture.publish(menuCase);
      const socialHtml=await(await fetch(fixture.origin)).text();
      assert.match(socialHtml,/Instagram \(opens in (?:a )?new tab\)/);
      assert.ok(socialHtml.includes("mailto:"));
      menuCase.signatureMenu!.social[0].enabled=false;await fixture.publish(menuCase);
      const disabledSocialHtml=await(await fetch(fixture.origin)).text();
      assert.ok(!disabledSocialHtml.includes('href="https://www.instagram.com/configured-account/"'));
      menuCase.signatureMenu!.social[0].enabled=true;menuCase.signatureMenu!.social[0].url="";await fixture.publish(menuCase);
      assert.ok(!(await(await fetch(fixture.origin)).text()).includes("Instagram (opens in"));
      await fixture.publish(fixtureContent);
      const galleryHtml=await (await fetch(fixture.origin+'/gallery')).text();
      assert.equal((galleryHtml.match(/data-gallery-item=/g)||[]).length,94);
      assert.ok(!galleryHtml.includes('Guest Comment'));
      assert.ok(galleryHtml.includes('Gallery categories'));
      const galleryCase=structuredClone(fixtureContent);galleryCase.signatureGallery!.items[0].enabled=false;
      await fixture.publish(galleryCase);
      assert.equal(((await (await fetch(fixture.origin+'/gallery')).text()).match(/data-gallery-item=/g)||[]).length,93);
      galleryCase.signatureGallery!.enabled=false;await fixture.publish(galleryCase);
      assert.equal((await fetch(fixture.origin+'/gallery')).status,404);
      assert.ok(!(await (await fetch(fixture.origin+'/sitemap.xml')).text()).includes('/gallery'));
      assert.ok(!(await (await fetch(fixture.origin)).text()).includes('href="/gallery"'));
      await fixture.publish(fixtureContent);
      const response = await fetch(fixture.origin + "/story", {
        redirect: "manual",
      });
      assert.equal(response.status, 307);
      assert.equal(response.headers.get("location"), "/");
      const home = await (await fetch(fixture.origin)).text();
      assert.ok(home.includes("sg-story-track"));
      assert.ok(home.includes("sg-rail"));
      assert.ok(!home.includes("story-motion"));
      const packagesHtml=await (await fetch(fixture.origin+'/packages')).text();assert.ok(packagesHtml.includes('sp-intro'));assert.equal((packagesHtml.match(/data-package-slug=/g)||[]).length,5);
      const weddingHtml=await (await fetch(fixture.origin+'/packages/seaside-wedding-and-honeymoon')).text();assert.equal((weddingHtml.match(/data-package-inclusion=/g)||[]).length,19);assert.ok(weddingHtml.includes('package=Seaside'));assert.equal((await fetch(fixture.origin+'/packages/cooking-class')).status,404);
      const packageCase=structuredClone(fixtureContent);packageCase.packages[0].enabled=false;await fixture.publish(packageCase);assert.equal((await fetch(fixture.origin+'/packages/seaside-wedding-and-honeymoon')).status,404);assert.ok(!(await (await fetch(fixture.origin+'/packages')).text()).includes('data-package-slug="seaside-wedding-and-honeymoon"'));
      packageCase.packages=packageCase.packages.slice(1,2);await fixture.publish(packageCase);assert.equal(((await (await fetch(fixture.origin+'/packages')).text()).match(/data-package-slug=/g)||[]).length,1);packageCase.packages=[];await fixture.publish(packageCase);assert.equal((await fetch(fixture.origin+'/packages')).status,404);await fixture.publish(fixtureContent);
      const foundationHtml=await (await fetch(fixture.origin+'/foundation')).text();
      assert.ok(foundationHtml.includes('sg-foundation-programs'));
      assert.ok(home.includes('href="/foundation"'));
      assert.ok((await (await fetch(fixture.origin+'/sitemap.xml')).text()).includes('/foundation'));
      const foundationCase=structuredClone(fixtureContent);
      foundationCase.foundation!.enabled=false;
      await fixture.publish(foundationCase);
      assert.equal((await fetch(fixture.origin+'/foundation')).status,404);
      assert.ok(!(await (await fetch(fixture.origin)).text()).includes('href="/foundation"'));
      assert.ok(!(await (await fetch(fixture.origin+'/sitemap.xml')).text()).includes('/foundation'));
      foundationCase.foundation!.enabled=true;
      foundationCase.foundation!.sections=foundationCase.foundation!.sections.filter(s=>s.layout==='programs');
      const programSection=foundationCase.foundation!.sections[0];
      if(programSection.layout==='programs'){programSection.entries=programSection.entries.slice(0,1);await fixture.publish(foundationCase);const singleProgram=await (await fetch(fixture.origin+'/foundation')).text();assert.equal((singleProgram.match(/data-foundation-entry=/g)||[]).length,1);programSection.entries=[];}
      await fixture.publish(foundationCase);
      const emptyProgram=await (await fetch(fixture.origin+'/foundation')).text();
      assert.ok(emptyProgram.includes('sg-foundation-programs'));
      assert.ok(!emptyProgram.includes('data-foundation-entry'));
      await fixture.publish(fixtureContent);
      const locationHtml=await (await fetch(fixture.origin+'/location')).text();assert.ok(locationHtml.includes('sl-editorial'));assert.equal((locationHtml.match(/data-location-destination=/g)||[]).length,6);assert.equal((locationHtml.match(/data-location-note=/g)||[]).length,5);assert.ok(locationHtml.includes('tel:+62361288441'));assert.ok(locationHtml.includes('mailto:info@tandjungsarihotel.com'));assert.ok(locationHtml.includes('https://maps.app.goo.gl/5KhdAD7hAERJsFAX9'));assert.ok(!locationHtml.includes('data-newsletter-demo'),'normal production fixtures never collect/show newsletter controls');
      const locationCase=structuredClone(fixtureContent);locationCase.signatureLocation!.destinations=[];locationCase.signatureLocation!.notes=[];await fixture.publish(locationCase);const emptyLocation=await (await fetch(fixture.origin+'/location')).text();assert.ok(!emptyLocation.includes('data-location-destination'));assert.ok(!emptyLocation.includes('data-location-note'));locationCase.signatureLocation!.enabled=false;await fixture.publish(locationCase);assert.equal((await fetch(fixture.origin+'/location')).status,404);assert.ok(!(await (await fetch(fixture.origin+'/sitemap.xml')).text()).includes('/location'));await fixture.publish(fixtureContent);
      const diningHtml=await (await fetch(fixture.origin+'/dining')).text();
      assert.ok(diningHtml.includes('sg-dining-categories'));
      const menuHtml=await (await fetch(fixture.origin+'/restaurant-menu')).text();
      for(const category of fixtureContent.dining.signature!.categories)for(const page of category.menuPages)assert.ok(menuHtml.includes('data-menu-page="'+page.id+'"'));
      const edgeDining=structuredClone(fixtureContent);edgeDining.dining.signature!.offers=[];edgeDining.dining.signature!.categories.forEach(c=>c.menuPages=[]);
      await fixture.publish(edgeDining);assert.equal((await fetch(fixture.origin+'/restaurant-menu')).status,404);
      const emptyDining=await (await fetch(fixture.origin+'/dining')).text();assert.ok(!emptyDining.includes('sg-dining-offer-track'));assert.ok(!emptyDining.includes('View Menu'));
      edgeDining.dining.signature!.offers=[fixtureContent.dining.signature!.offers[0]];await fixture.publish(edgeDining);assert.ok((await (await fetch(fixture.origin+'/dining')).text()).includes('data-dining-offer="afternoon-tea"'));
      await fixture.publish(fixtureContent);
      const story = fixtureContent.signatureStory!;
      for (const section of story.sections) assert.equal(home.includes(`data-panel-id="${section.id}"`),section.enabled && section.layout!=="video");
      assert.ok(!home.includes("<video"), "comparison demo is image-only");
      const cultures = await (await fetch(fixture.origin + "/cultures")).text();
      assert.ok(cultures.includes("sg-culture-index"));
      assert.ok(cultures.includes("Discover More"));
      assert.ok((await (await fetch(fixture.origin + "/sitemap.xml")).text()).includes("/culture/galungan"));
      for (const entry of fixtureContent.culture!.entries) {
        const html = await (await fetch(fixture.origin + "/culture/" + entry.slug)).text();
        assert.ok(html.includes("sg-culture-detail-flow"));
        for (const section of entry.signature!.sections) assert.ok(html.includes(`data-culture-section="${section.id}"`));
        assert.ok(!html.includes("<video"));
      }
      const reorderedCulture = structuredClone(fixtureContent);
      const firstCulture = reorderedCulture.culture!.entries[0];
      firstCulture.signature!.sections.reverse();
      firstCulture.signature!.sections[1].enabled = false;
      firstCulture.signature!.nextSlug = "missing-destination";
      await fixture.publish(reorderedCulture);
      const cultureLayout = await (await fetch(fixture.origin + "/culture/galungan")).text();
      assert.ok(cultureLayout.includes('data-culture-section="galungan-red-editorial"'));
      assert.ok(!cultureLayout.includes('data-culture-section="galungan-portrait-editorial"'));
      assert.ok(cultureLayout.includes('data-next-href="/gallery"'));
      reorderedCulture.culture!.entries = [];
      await fixture.publish(reorderedCulture);
      assert.equal((await fetch(fixture.origin + "/cultures")).status, 404);
      await fixture.publish(fixtureContent);
      await fixture.publish({ ...fixtureContent, signatureStory: { ...story, sections: [story.sections[4], story.sections[0]] } });
      const reordered = await (await fetch(fixture.origin)).text();
      assert.ok(reordered.indexOf('data-panel-id="intimacy-with-bali"') < reordered.indexOf('data-panel-id="story-opener"'));
      await fixture.publish({ ...fixtureContent, signatureStory: { ...story, sections: [] } });
      assert.ok(!(await (await fetch(fixture.origin)).text()).includes('data-panel-id="story-opener"'));
      await fixture.publish({ ...fixtureContent, signatureStory: { ...story, sections: [story.sections[0], { ...story.sections[1], enabled: false }] } });
      const singleStory = await (await fetch(fixture.origin)).text();
      assert.ok(singleStory.includes('data-panel-id="story-opener"'));
      assert.ok(!singleStory.includes('data-panel-id="the-1960s"'));
      const disabledCulture = structuredClone(fixtureContent);
      disabledCulture.culture!.enabled = false;
      await fixture.publish(disabledCulture);
      assert.equal((await fetch(fixture.origin + "/cultures")).status, 404);
      assert.equal((await fetch(fixture.origin + "/culture/galungan")).status, 404);
      assert.ok(!(await (await fetch(fixture.origin + "/sitemap.xml")).text()).includes("/cultures"));
      await fixture.publish(fixtureContent);
    }
    for (const route of [
      "/rooms/unknown",
      "/packages/unknown",
      "/gallery/extra",
      "/unknown",
      ...(variant === "signature" ? ["/culture/unknown"] : []),
    ]) {
      const res = await fetch(fixture.origin + route);
      assert.equal(res.status, 404, route);
      assert.match(await res.text(), /way back/);
    }
    await fixture.publish({
      ...fixtureContent,
      booking: {
        ...fixtureContent.booking,
        mode: "both",
        whatsapp: "628123456789",
      },
    });
    const room = await (
      await fetch(fixture.origin + "/rooms/" + fixtureContent.rooms[0].slug)
    ).text();
    assert.ok(
      room.includes(encodeURIComponent(fixtureContent.rooms[0].title)),
      "WhatsApp contains room context",
    );
    const disabled = {
      ...fixtureContent,
      name: "PUBLISHED FROM DATABASE",
      heroTitle: "DATABASE PUBLICATION TITLE",
      modules: {
        dining: false,
        experiences: false,
        packages: false,
        terms: false,
      },
      showAdminLink: false,
    };
    if (disabled.signatureStory) disabled.signatureStory = {
      ...disabled.signatureStory,
      sections: disabled.signatureStory.sections.map((section) => section.layout === "opener" ? { ...section, title: disabled.heroTitle } : section),
    };
    await fixture.publish(disabled);
    const home = await (await fetch(fixture.origin)).text();
    assert.match(home, /DATABASE PUBLICATION TITLE/);
    assert.ok(!home.includes('href="/admin/login"'));
    const sitemap = await (await fetch(fixture.origin + "/sitemap.xml")).text();
    for (const route of ["dining", "experiences", "packages", "terms"]) {
      assert.ok(!sitemap.includes("/" + route));
      const response = await fetch(fixture.origin + "/" + route);
      assert.equal(response.status, 404, route);
      assert.ok(!home.includes(`href="/${route}"`));
    }
    for (const privatePath of ["/admin", "/preview", "/api"])
      assert.ok(!sitemap.includes(privatePath));
    for (const id of ["invalid", "11111111-1111-4111-8111-111111111111"]) {
      const response = await fetch(fixture.origin + "/api/media/" + id);
      assert.equal(
        response.status,
        404,
        "Unpublished media must not be public",
      );
      assert.match(response.headers.get("cache-control") || "", /no-store/);
    }
    const robots = await (await fetch(fixture.origin + "/robots.txt")).text();
    assert.match(robots, /Disallow: \/admin/);
    assert.match(robots, /Disallow: \/preview/);
    await fixture.publish({ ...fixtureContent, gallery: [], ...(fixtureContent.signatureGallery ? {signatureGallery:{...fixtureContent.signatureGallery,items:[]}} : {}) });
    assert.equal((await fetch(fixture.origin + "/gallery")).status, 200);
    assert.match(
      await (await fetch(fixture.origin + "/gallery")).text(),
      /No photographs/,
    );
    await fixture.publish({
      ...fixtureContent,
      gallery: fixtureContent.gallery.slice(0, 1),
      ...(fixtureContent.signatureGallery ? {signatureGallery:{...fixtureContent.signatureGallery,items:fixtureContent.signatureGallery.items.slice(0,1)}} : {}),
    });
    assert.equal((await fetch(fixture.origin + "/gallery")).status, 200);
    if (variant === "signature") {
      await fixture.publish({
        ...fixtureContent,
        rooms: fixtureContent.rooms.slice(0, 1),
      });
      const single = await (
        await fetch(fixture.origin + "/rooms/" + fixtureContent.rooms[0].slug)
      ).text();
      assert.ok(!single.includes("sg-related-track"));
      await fixture.publish({
        ...fixtureContent,
        rooms: fixtureContent.rooms.slice(0, 2),
      });
      const related = await (
        await fetch(fixture.origin + "/rooms/" + fixtureContent.rooms[0].slug)
      ).text();
      assert.ok(related.includes("sg-related-track"));
      assert.ok(related.includes("Other Bungalows"));
      assert.ok(related.includes(`/rooms/${fixtureContent.rooms[1].slug}`));
      assert.ok(!related.includes(`aria-label="Discover ${fixtureContent.rooms[0].title}"`), "related selector excludes current room");
      await fixture.publish(fixtureContent);
      const terms=await (await fetch(fixture.origin+'/terms')).text();
      assert.equal((terms.match(/data-terms-section=/g)||[]).length,10);
      assert.ok(terms.includes('id="children-policy"'));assert.ok(terms.includes('href="#pricing-errors"'));
      assert.ok(!terms.includes('class="sg-hero'));assert.ok(!terms.includes('<video'));
      const dynamicTerms=structuredClone(fixtureContent);
      dynamicTerms.signatureTerms!.sections=dynamicTerms.signatureTerms!.sections.slice(-1);
      dynamicTerms.signatureTerms!.sections[0].body=[{type:'paragraph',text:'<script>alert(1)</script>'}];
      await fixture.publish(dynamicTerms);
      const safe=await (await fetch(fixture.origin+'/terms')).text();assert.equal((safe.match(/data-terms-section=/g)||[]).length,1);assert.ok(safe.includes('&lt;script&gt;'));assert.ok(!safe.includes('<script>alert(1)</script>'));
      dynamicTerms.signatureTerms!.sections=[];await fixture.publish(dynamicTerms);
      assert.equal((await fetch(fixture.origin+'/terms')).status,404);
      assert.ok(!(await (await fetch(fixture.origin+'/sitemap.xml')).text()).includes('/terms</loc>'));
      assert.ok(!(await (await fetch(fixture.origin+'/')).text()).includes('href="/terms"'));
      await fixture.publish(fixtureContent);
      const photos = fixtureContent.rooms[0].signature!.gallery;
      assert.ok(related.includes(`data-photograph-id="${photos[0].id}"`));
      const noPhotos = structuredClone(fixtureContent);
      noPhotos.rooms[0].signature!.gallery = [];
      await fixture.publish(noPhotos);
      assert.ok(!(await (await fetch(fixture.origin + "/rooms/" + noPhotos.rooms[0].slug)).text()).includes("sg-room-photograph-track"));
      noPhotos.rooms[0].signature!.gallery = photos.slice(0, 1);
      await fixture.publish(noPhotos);
      const onePhoto = await (await fetch(fixture.origin + "/rooms/" + noPhotos.rooms[0].slug)).text();
      assert.ok(onePhoto.includes("sg-room-photograph-track"));
      assert.ok(!onePhoto.includes("Next room photograph"));
    }
    console.log(
      variant +
        " HTTP: all public deep links, designed 404s, publication changes, draft/site isolation, booking context, disabled modules, metadata/sitemap/robots and empty/single galleries pass through pg + Drizzle.",
    );
  } finally {
    await fixture.stop();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
