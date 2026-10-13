import { test } from "node:test";
import assert from "node:assert/strict";
import { contentSchema, socialLinkSchema } from "../src/lib/schemas/content";
import { publicContactLinks } from "../src/lib/content/social-links";
import { referenceDemoContent } from "../src/lib/content/signature-reference-demo";
test("social drafts accept blank values but only configured enabled safe links render", () => {
  const blank = {
    id: "instagram",
    platform: "instagram" as const,
    url: "",
    order: 0,
    enabled: true,
  };
  assert.equal(socialLinkSchema.safeParse(blank).success, true);
  assert.deepEqual(publicContactLinks([blank]), []);
  const configured = {
    ...blank,
    url: "https://www.instagram.com/owner-account/",
  };
  assert.equal(publicContactLinks([configured]).length, 1);
  assert.deepEqual(publicContactLinks([{ ...configured, enabled: false }]), []);
  assert.deepEqual(
    publicContactLinks([{ ...configured, url: "javascript:alert(1)" }]),
    [],
  );
  for (const url of [
    "https://instagram.com.evil.test/owner",
    "http://instagram.com/owner",
    "https://user:pass@instagram.com/owner",
    "broken",
  ])
    assert.equal(
      socialLinkSchema.safeParse({ ...configured, url }).success,
      false,
    );
  assert.deepEqual(publicContactLinks([], "bad?subject=test"), []);
  assert.equal(
    publicContactLinks([], "stay@example.com")[0].href,
    "mailto:stay@example.com",
  );
});
test("social ordering, legacy owner values and private preview remain structured", () => {
  const c = structuredClone(referenceDemoContent);
  c.signatureMenu!.social = [
    {
      id: "fb-owner",
      platform: "facebook",
      url: "https://facebook.com/owner",
      order: 1,
      enabled: true,
    },
    {
      id: "ig-owner",
      platform: "instagram",
      url: "https://instagram.com/owner",
      order: 0,
      enabled: true,
    },
    { id: "blank-yt", platform: "youtube", url: "", order: 2, enabled: false },
  ];
  const parsed = contentSchema.parse(c);
  assert.deepEqual(parsed.signatureMenu!.social, c.signatureMenu!.social);
  assert.deepEqual(
    publicContactLinks(parsed.signatureMenu!.social, "stay@example.com").map(
      (x) => x.platform,
    ),
    ["email", "instagram", "facebook"],
  );
  const cleared = contentSchema.parse({
    ...parsed,
    signatureMenu: { ...parsed.signatureMenu, email: "", social: [] },
  });
  assert.deepEqual(publicContactLinks(cleared.signatureMenu!.social), []);
});
