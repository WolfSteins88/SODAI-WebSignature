CREATE TABLE "archived_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" text NOT NULL,
	"path" jsonb NOT NULL,
	"value" jsonb NOT NULL,
	"actor" text NOT NULL,
	"restored" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_challenges" (
	"id" text PRIMARY KEY NOT NULL,
	"site_id" text NOT NULL,
	"account" text NOT NULL,
	"version" text NOT NULL,
	"client" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "otp_counters" (
	"id" text PRIMARY KEY NOT NULL,
	"counter" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "alt" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "caption" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "focal_point" jsonb DEFAULT '{"x":50,"y":50}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "archived" boolean DEFAULT false NOT NULL;