import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { demoContent } from "../src/lib/content/demo";
import { contentSchema } from "../src/lib/schemas/content";

test("M4 migration upgrades each legacy snapshot without publishing its draft", async () => {
  const db = new PGlite();
  try {
    for (const name of ["0000_fast_firestar", "0001_signature_collections"]) {
      if (name === "0001_signature_collections") {
        const legacy = structuredClone(demoContent) as Record<string, unknown>;
        delete legacy.storyPanels;
        delete legacy.culture;
        const draft = { ...legacy, storyTitle: "PRIVATE DRAFT STORY" };
        const published = { ...legacy, storyTitle: "PUBLIC STORY" };
        await db.query("INSERT INTO sites (id,villa_id,environment,draft,published) VALUES ($1,$2,$3,$4::jsonb,$5::jsonb)", ["site:test", "site", "test", JSON.stringify(draft), JSON.stringify(published)]);
      }
      const sql = await readFile(new URL(`../drizzle/${name}.sql`, import.meta.url), "utf8");
      for (const statement of sql.split("--> statement-breakpoint")) if (statement.trim()) await db.exec(statement);
    }
    const result = await db.query<{ draft: unknown; published: unknown }>("SELECT draft,published FROM sites WHERE id='site:test'");
    const row = result.rows[0];
    const published = contentSchema.parse(row.published), draft = contentSchema.parse(row.draft);
    assert.equal(published.storyPanels.length, 2);
    assert.equal(published.storyPanels[0].title, "PUBLIC STORY");
    assert.equal(draft.storyPanels[0].title, "PRIVATE DRAFT STORY");
    assert.equal(published.culture, undefined);
  } finally { await db.close(); }
});
