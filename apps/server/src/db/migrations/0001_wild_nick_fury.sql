CREATE TYPE "public"."notification_type" AS ENUM('TEST');--> statement-breakpoint
CREATE TABLE "notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"type" "notification_type" NOT NULL,
	"metadata" jsonb NOT NULL,
	"receiver_id" text NOT NULL,
	"read_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_receiver_id_user_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;