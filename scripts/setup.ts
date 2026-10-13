import { getConnectionString } from "@netlify/database";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { loadEnvConfig } from "@next/env";
import * as schema from "../src/lib/db/schema";
import { seedContent } from "../src/lib/content/repository";
import { referenceDemoContent } from "../src/lib/content/signature-reference-demo";
import { deploymentScope } from "../src/lib/security/settings";
async function main() {
loadEnvConfig(process.cwd());
const scope = deploymentScope();
if (!process.env.SITE_ID || !process.env.CONTENT_ENV)
  throw new Error("SITE_ID and CONTENT_ENV are required");
const command = process.argv[2];
if (!["migrate", "seed", "seed-reference"].includes(command))
  throw new Error("Use migrate, seed, or seed-reference");
if (command === "seed-reference" && process.env.TEMPLATE_VARIANT !== "signature")
  throw new Error("Reference Story seed requires TEMPLATE_VARIANT=signature");
const pool = new Pool({
  // Neon: migrations prefer the direct (unpooled) endpoint when provided.
  connectionString:
    process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || getConnectionString(),
  max: 1,
});
const database = drizzle(pool, { schema });
try {
  if (command === "migrate")
    await migrate(database, { migrationsFolder: "drizzle" });
  else await seedContent(database, scope, command === "seed-reference" ? referenceDemoContent : undefined);
  console.log(
    command === "migrate"
      ? "Migrations applied."
      : command === "seed-reference"
        ? "Reference Story comparison content seeded without overwriting existing drafts or publications."
        : "Fictional content seeded without overwriting existing drafts or publications.",
  );
} finally {
  await pool.end();
}
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Database setup failed");
  process.exitCode = 1;
});
