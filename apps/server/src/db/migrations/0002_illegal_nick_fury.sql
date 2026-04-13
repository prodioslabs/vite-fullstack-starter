CREATE TYPE "public"."captcha_status" AS ENUM('VERIFIED', 'PENDING', 'FAILED');--> statement-breakpoint
CREATE TABLE "captcha" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"captcha" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"status" "captcha_status" DEFAULT 'PENDING' NOT NULL,
	CONSTRAINT "captcha_status_unique" UNIQUE("captcha","status")
);
--> statement-breakpoint
CREATE INDEX "expires_at_idx" ON "captcha" USING btree ("expires_at");