import { test } from "node:test";
import assert from "node:assert/strict";
import { demoContent } from "../src/lib/content/demo";
import { publicPaths, standardPage } from "../src/lib/content/public-routes";
import { bookingLinks } from "../src/lib/schemas/content";
test("Standard public route availability excludes disabled and empty modules", () => {
  const content = {
    ...demoContent,
    modules: { ...demoContent.modules, dining: false, terms: false },
    experiences: [],
    packages: [],
  };
  const paths = publicPaths(content);
  for (const route of ["/dining", "/terms", "/experiences", "/packages"])
    assert.equal(paths.includes(route), false);
  for (const path of [
    ["rooms", "unknown"],
    ["gallery", "extra"],
    ["rooms", "garden-villa", "extra"],
    ["unknown"],
  ])
    assert.equal(standardPage(content, path), null);
  assert.ok(standardPage(content, ["rooms", content.rooms[0].slug]));
});
test("Booking respects modes, encodes villa/room context and hides missing actions", () => {
  const content = {
    ...demoContent,
    name: "Villa & Garden",
    booking: {
      ...demoContent.booking,
      message: "Stay at {villa}: {room}",
      mode: "both" as const,
      whatsapp: "628123456789",
    },
  };
  const links = bookingLinks(content, "Room + Pool");
  assert.equal(
    new URL(links.whatsapp!).searchParams.get("text"),
    "Stay at Villa & Garden: Room + Pool",
  );
  assert.equal(links.external, content.booking.url);
  assert.equal(
    bookingLinks({
      ...content,
      booking: { ...content.booking, mode: "external" },
    }).whatsapp,
    null,
  );
  assert.equal(
    bookingLinks({
      ...content,
      booking: { ...content.booking, mode: "whatsapp" },
    }).external,
    null,
  );
  assert.deepEqual(
    bookingLinks({
      ...content,
      booking: { ...content.booking, url: "", whatsapp: "" },
    }),
    { whatsapp: null, external: null },
  );
});
