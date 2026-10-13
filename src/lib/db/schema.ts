import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  uuid,
} from "drizzle-orm/pg-core";
import type { VillaContent } from "../schemas/content";
// id/siteId contain the immutable deployment scope, never a request parameter.
export const sites = pgTable("sites", {
  id: text("id").primaryKey(),
  villaId: text("villa_id").notNull(),
  environment: text("environment").notNull(),
  draft: jsonb("draft").$type<VillaContent>().notNull(),
  published: jsonb("published").$type<VillaContent>().notNull(),
  revision: integer("revision").notNull().default(1),
  publishedRevision: integer("published_revision").notNull().default(1),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const revisions = pgTable("revisions", {
  id: uuid("id").primaryKey().defaultRandom(),
  siteId: text("site_id")
    .notNull()
    .references(() => sites.id),
  revision: integer("revision").notNull(),
  content: jsonb("content").$type<VillaContent>().notNull(),
  actor: text("actor").notNull(),
  action: text("action").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export const audit = pgTable("audit", {
  id: uuid("id").primaryKey().defaultRandom(),
  siteId: text("site_id").notNull(),
  actor: text("actor").notNull(),
  action: text("action").notNull(),
  details: jsonb("details"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export const media = pgTable("media", {
  id: uuid("id").primaryKey(),
  siteId: text("site_id").notNull(),
  key: text("key").notNull(),
  namespace: text("namespace").notNull(),
  name: text("name").notNull(),
  mime: text("mime").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  bytes: integer("bytes").notNull(),
  alt:text("alt").notNull().default(""),
  caption:text("caption").notNull().default(""),
  focalPoint:jsonb("focal_point").$type<{x:number;y:number}>().notNull().default({x:50,y:50}),
  archived:boolean("archived").notNull().default(false),
  ready: boolean("ready").notNull().default(false),
  everPublished: boolean("ever_published").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
// Opaque HMAC keys and counters only; no account or session records.
export const loginLimits = pgTable("login_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const loginChallenges = pgTable("login_challenges", {
 id:text("id").primaryKey(), siteId:text("site_id").notNull(), account:text("account").notNull(),
 version:text("version").notNull(), client:text("client").notNull(), attempts:integer("attempts").notNull().default(0),
 expiresAt:timestamp("expires_at",{withTimezone:true}).notNull(), consumed:boolean("consumed").notNull().default(false),
});
export const otpCounters=pgTable("otp_counters",{id:text("id").primaryKey(),counter:integer("counter").notNull()});
export const archivedContent=pgTable("archived_content",{
 id:uuid("id").primaryKey().defaultRandom(),siteId:text("site_id").notNull(),path:jsonb("path").$type<string[]>().notNull(),
 position:integer("position").notNull().default(0),value:jsonb("value").notNull(),actor:text("actor").notNull(),restored:boolean("restored").notNull().default(false),createdAt:timestamp("created_at").notNull().defaultNow(),
});
