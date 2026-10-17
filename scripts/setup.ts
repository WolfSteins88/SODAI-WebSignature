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
if (!(process.env.VILLA_ID || process.env.SITE_ID) || !process.env.CONTENT_ENV)
  throw new Error("VILLA_ID (or SITE_ID) and CONTENT_ENV are required");
const command = process.argv[2];
if (!["migrate", "seed", "seed-reference", "deploy"].includes(command))
  throw new Error("Use migrate, seed, seed-reference, or deploy");
if (command === "seed-reference" && process.env.TEMPLATE_VARIANT !== "signature")
  throw new Error("Reference Story seed requires TEMPLATE_VARIANT=signature");
const pool = new Pool({
  // Neon on Vercel: migrate over the direct connection, not the pooler.
  connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || getConnectionString(),
  max: 1,
});
const database = drizzle(pool, { schema });
try {
  // deploy (the Vercel build step): schema, then the variant's seed; both are no-ops when already applied.
  if (command === "migrate" || command === "deploy")
    await migrate(database, { migrationsFolder: "drizzle" });
  if (command !== "migrate")
    await seedContent(database, scope, command === "seed-reference" || (command === "deploy" && process.env.TEMPLATE_VARIANT === "signature") ? referenceDemoContent : undefined);
  console.log(
    command === "migrate"
      ? "Migrations applied."
      : command === "deploy"
        ? `Migrations applied; content seeded for ${scope.villa} (${scope.context}) without overwriting existing drafts or publications.`
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
