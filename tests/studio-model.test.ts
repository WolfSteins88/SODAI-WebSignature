import { test } from "node:test";
import assert from "node:assert/strict";
import {
  changeCount,
  fieldTab,
  itemLabel,
  studioSearch,
} from "../src/components/admin/studio-model";
test("publication changes compare actual content rather than revision/key order", () => {
  assert.equal(changeCount({ a: 1, b: 2 }, { b: 2, a: 1 }), 0);
  assert.equal(changeCount({ a: 1 }, { a: 2 }), 1);
  assert.equal(changeCount(["a", "b"], ["b", "a"]), 2);
  assert.equal(changeCount({ a: 1 }, { a: 1, b: true }), 1);
});
test("room/story fields retain exhaustive fallback grouping and short labels", () => {
  assert.equal(fieldTab("hero", true, true), "Content");
  assert.equal(fieldTab("photoGrid", true, false), "Photos");
  assert.equal(fieldTab("inclusions", true, false), "Amenities");
  assert.equal(fieldTab("futureField", true, false), "Content");
  assert.equal(fieldTab("detailImage", false, true), "Image");
  assert.equal(fieldTab("poster", false, true), "Video");
  assert.equal(
    itemLabel({ layout: "architecture", heading: "Long paragraph" }, ""),
    "Architecture",
  );
  assert.equal(itemLabel({ route: "/terms" }, "Pages 2"), "/terms");
});
test("search returns existing sections/content and respects allowed section list", () => {
  const c = {
    rooms: [{ title: "Ocean room", slug: "ocean" }],
    culture: { entries: [{ title: "Private culture" }] },
  };
  assert.equal(
    studioSearch(c, [{ key: "rooms", label: "Rooms" }], "ocean")[0].key,
    "rooms",
  );
  assert.equal(
    studioSearch(c, [{ key: "rooms", label: "Rooms" }], "private").length,
    0,
  );
  assert.equal(studioSearch(c, [], "").length, 0);
});
