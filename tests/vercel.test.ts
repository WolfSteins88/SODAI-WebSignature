import assert from "node:assert/strict";
import test from "node:test";
import { deploymentScope } from "../src/lib/security/settings";
import { loginClient } from "../src/lib/security/login-limit";
import { rejectHostedDemo } from "../src/lib/security/local-demo";

const base: NodeJS.ProcessEnv = {
  NODE_ENV: "production",
  SITE_ID: "villa",
  CONTENT_ENV: "production",
};

test("Vercel environments map onto the existing deploy scopes", () => {
  const netlify = deploymentScope({ ...base, CONTEXT: "production" });
  const vercel = deploymentScope({ ...base, VERCEL_ENV: "production" });
  assert.equal(vercel.context, "production");
  assert.equal(vercel.key, netlify.key);
  assert.equal(
    deploymentScope({ ...base, VERCEL_ENV: "development" }).context,
    "local",
  );
  const preview = deploymentScope({
    ...base,
    VERCEL_ENV: "preview",
    VERCEL_DEPLOYMENT_ID: "dpl_one",
  });
  assert.equal(preview.context, "deploy-preview");
  assert.equal(preview.deploy, "dpl_one");
  assert.notEqual(
    preview.namespace,
    deploymentScope({
      ...base,
      VERCEL_ENV: "preview",
      VERCEL_DEPLOYMENT_ID: "dpl_two",
    }).namespace,
  );
  assert.throws(() => deploymentScope({ ...base, VERCEL_ENV: "preview" }));
});

test("client IP is trusted only from the hosting platform", (t) => {
  const request = new Request("https://example.com", {
    headers: {
      "x-real-ip": "203.0.113.7",
      "x-nf-client-connection-ip": "198.51.100.2",
    },
  });
  const saved = { VERCEL: process.env.VERCEL, NETLIFY: process.env.NETLIFY };
  t.after(() => {
    for (const [k, v] of Object.entries(saved))
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
  });
  delete process.env.NETLIFY;
  delete process.env.VERCEL;
  assert.equal(loginClient(request), "shared");
  process.env.VERCEL = "1";
  assert.equal(loginClient(request), "203.0.113.7");
  assert.equal(
    loginClient(
      new Request("https://example.com", { headers: { "x-real-ip": "spoof" } }),
    ),
    "shared",
  );
});

test("local demo refuses Vercel-linked environments", () => {
  for (const env of [
    { VERCEL_ENV: "development" },
    { BLOB_READ_WRITE_TOKEN: "x" },
  ])
    assert.throws(() => rejectHostedDemo({ ...base, ...env }));
});
