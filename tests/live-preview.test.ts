import { test } from "node:test";
import assert from "node:assert/strict";
import {
  previewInput,
  previewSnapshot,
  PREVIEW_LIMIT,
} from "../src/lib/content/live-preview";
import { removedEntries } from "../src/lib/content/removed-entries";
import { referenceDemoContent } from "../src/lib/content/signature-reference-demo";
const envelope = () => ({
  type: "villa-preview:update",
  channel: crypto.randomUUID(),
  scope: "a".repeat(64),
  version: "v1",
  sequence: 1,
  route: "/rooms",
  content: referenceDemoContent,
});
test("live preview rejects unknown commands, malformed scope/route, extra fields and oversized overrides", () => {
  assert.equal(previewInput(envelope()).route, "/rooms");
  for (const change of [
    { type: "save" },
    { scope: "other" },
    { route: "/admin" + "?x=1" },
    { secret: "bad" },
    { content: "x".repeat(PREVIEW_LIMIT) },
  ])
    assert.throws(() => previewInput({ ...envelope(), ...change }));
});
test("unsaved preview is pure and preserves enabled collection edits while clearly reporting fallback", () => {
  const input = structuredClone(referenceDemoContent),
    before = JSON.stringify(input);
  input.name = "Unsaved villa";
  input.signatureStory!.sections.reverse();
  const result = previewSnapshot(input, referenceDemoContent);
  assert.equal(result.content.name, "Unsaved villa");
  assert.deepEqual(
    result.content.signatureStory!.sections.map((s) => s.id),
    input.signatureStory!.sections.map((s) => s.id),
  );
  assert.equal(referenceDemoContent.name, JSON.parse(before).name);
  input.name = "";
  const fallback = previewSnapshot(input, referenceDemoContent);
  assert.ok(fallback.warnings.length);
  assert.equal(fallback.content.name, referenceDemoContent.name);
  assert.equal(input.name, "");
});
test("saved removals derive archive values and stable parent paths; reorder alone never archives", () => {
  const old = {
    rooms: [{ id: "r", photos: [{ id: "p", title: "Saved" }] }],
    experiences: [{ slug: "e" }],
  };
  assert.deepEqual(removedEntries(old, structuredClone(old)), []);
  assert.deepEqual(
    removedEntries(old, { rooms: [{ id: "r", photos: [] }], experiences: [] }),
    [
      {
        path: ["rooms", "@r", "photos"],
        position: 0,
        value: { id: "p", title: "Saved" },
      },
      { path: ["experiences"], position: 0, value: { slug: "e" } },
    ],
  );
  assert.deepEqual(
    removedEntries(
      {
        pages: [{ id: "home" }],
        sections: [{ id: "opener", layout: "opener" }],
      },
      { pages: [], sections: [] },
    ),
    [],
  );
});
