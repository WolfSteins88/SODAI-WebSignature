// Writes a Netlify Database migration that seeds the fictional content for
// one hosted scope. Usage (match the Netlify environment exactly):
//   VILLA_ID=... CONTENT_ENV=production CONTEXT=production npm run db:seed:netlify
import { writeFileSync } from "node:fs";
import { contentSchema } from "../src/lib/schemas/content";
import { demoContent } from "../src/lib/content/demo";
import { deploymentScope } from "../src/lib/security/settings";
const scope = deploymentScope();
if (scope.context !== "production") throw new Error("Set CONTEXT=production");
const content = JSON.stringify(contentSchema.parse(demoContent));
const quote = "$seed$";
if (content.includes(quote)) throw new Error("Content contains the SQL quote tag");
const literal = (value: string) => `'${value.replaceAll("'", "''")}'`;
const json = `${quote}${content}${quote}::jsonb`;
const sql = `-- Seeds VILLA_ID=${scope.villa} CONTENT_ENV=${scope.environment} CONTEXT=production.
-- Inserts nothing when this scope already has content.
WITH site AS (
  INSERT INTO "sites" ("id", "villa_id", "environment", "draft", "published")
  VALUES (${literal(scope.key)}, ${literal(scope.villa)}, ${literal(scope.environment)}, ${json}, ${json})
  ON CONFLICT DO NOTHING
  RETURNING "id"
), revision AS (
  INSERT INTO "revisions" ("site_id", "revision", "content", "actor", "action")
  SELECT "id", 1, ${json}, 'operator', 'seed' FROM site
)
INSERT INTO "audit" ("site_id", "actor", "action")
SELECT "id", 'operator', 'seed' FROM site;
`;
const file = `netlify/database/migrations/${process.argv[2] ?? "20261013000100"}_seed_${scope.villa.replaceAll("-", "_")}.sql`;
writeFileSync(file, sql);
console.log(`Wrote ${file}`);
