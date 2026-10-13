import "server-only";
import { getConnectionString } from "@netlify/database";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
let connection: ReturnType<typeof drizzle<typeof schema>> | undefined;
export function db() {
  if (!connection) {
    const connectionString = process.env.DATABASE_URL || getConnectionString();
    connection = drizzle(new Pool({ connectionString, max: 5 }), { schema });
  }
  return connection;
}
