import "server-only";
import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { sql, lt } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../db/schema";
export function loginClient(request: Request) {
  const ip =
    process.env.NETLIFY === "true"
      ? request.headers.get("x-nf-client-connection-ip")
      : null;
  return ip && isIP(ip) ? ip : "shared";
}
export async function consumeLoginAttempt(
  database: NodePgDatabase<typeof schema>,
  secret: string,
  scope: string,
  identifier: string,
  client: string,
  now = new Date(),
) {
  const keys = [`ip:${client}`, `account:${identifier.toLowerCase()}`].map(
    (value) =>
      createHmac("sha256", secret)
        .update(JSON.stringify([scope, value]))
        .digest("hex"),
  );
  return database.transaction(async (tx) => {
    await tx
      .delete(schema.loginLimits)
      .where(lt(schema.loginLimits.expiresAt, now));
    const rows = await tx
      .insert(schema.loginLimits)
      .values(
        keys
          .sort()
          .map((key) => ({
            key,
            count: 1,
            expiresAt: new Date(now.getTime() + 900_000),
          })),
      )
      .onConflictDoUpdate({
        target: schema.loginLimits.key,
        set: {
          count: sql`CASE WHEN ${schema.loginLimits.expiresAt} <= ${now.toISOString()}::timestamptz THEN 1 ELSE ${schema.loginLimits.count} + 1 END`,
          expiresAt: sql`CASE WHEN ${schema.loginLimits.expiresAt} <= ${now.toISOString()}::timestamptz THEN ${new Date(now.getTime() + 900_000).toISOString()}::timestamptz ELSE ${schema.loginLimits.expiresAt} END`,
        },
      })
      .returning();
    return rows.every((row) => row.count <= 10);
  });
}
