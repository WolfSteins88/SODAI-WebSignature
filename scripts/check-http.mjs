import assert from "node:assert/strict";
import { startStandardFixture } from "./standard-fixture.ts";
const fixture = await startStandardFixture(3108);
const origin = fixture.origin;
try {
  assert.match(
    await (await fetch(origin + "/admin/login")).text(),
    /Account identifier/,
  );
  for (const route of ["/admin", "/preview/rooms"]) {
    const res = await fetch(origin + route, { redirect: "manual" });
    assert.equal(res.status, 307);
    assert.equal(res.headers.get("location"), "/admin/login");
    assert.match(res.headers.get("x-robots-tag"), /noindex/);
  }
  for (const method of ["GET", "POST"]) {
    const res = await fetch(origin + "/api/admin/content", {
      method,
      headers: { origin, "Content-Type": "application/json" },
      ...(method === "POST"
        ? { body: JSON.stringify({ action: "publish", expected: 1 }) }
        : {}),
    });
    assert.equal(res.status, 401);
    assert.match(res.headers.get("cache-control"), /no-store/);
    const data = await res.json();
    assert.equal(data.draft, undefined);
    assert.ok(data.error);
  }
  assert.deepEqual(
    Object.keys(await (await fetch(origin + "/api/auth/providers")).json()),
    ["credentials"],
  );
  assert.equal(
    (
      await fetch(origin + "/api/auth/signout", {
        method: "POST",
        headers: { origin: "https://foreign.example" },
      })
    ).status,
    403,
  );
  for (const route of [
    "/api/admin/users",
    "/admin/settings",
    "/admin/rooms",
    "/admin/media",
  ])
    assert.equal((await fetch(origin + route)).status, 404, route);
  console.log(
    "Production HTTP checks passed: login page, protected redirects, unauthorized GET/POST, no-store, provider/origin policy and removed account/editor routes.",
  );
} finally {
  await fixture.stop();
}
