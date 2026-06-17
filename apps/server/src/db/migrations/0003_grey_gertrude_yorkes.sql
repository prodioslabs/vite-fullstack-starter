CREATE TYPE "public"."event_history_action" AS ENUM('created', 'updated', 'cancelled', 'rescheduled');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('active', 'cancelled');--> statement-breakpoint
CREATE TABLE "event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone,
	"is_event_all_day" boolean DEFAULT false NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_by_id" text NOT NULL,
	"conference_link" text,
	"event_status" "event_status" DEFAULT 'active' NOT NULL,
	CONSTRAINT "event_all_day_or_end_time_chk" CHECK ("event"."is_event_all_day" = true OR "event"."end_time" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "event_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"event_id" uuid NOT NULL,
	"action" "event_history_action" NOT NULL,
	"performed_by_id" text NOT NULL,
	"metadata" json
);
--> statement-breakpoint
CREATE TABLE "event_participant" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"event_id" uuid NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_history" ADD CONSTRAINT "event_history_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_history" ADD CONSTRAINT "event_history_performed_by_id_user_id_fk" FOREIGN KEY ("performed_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_participant" ADD CONSTRAINT "event_participant_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_participant" ADD CONSTRAINT "event_participant_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "event_created_by_id_idx" ON "event" USING btree ("created_by_id");--> statement-breakpoint
CREATE INDEX "event_start_time_idx" ON "event" USING btree ("start_time");--> statement-breakpoint
CREATE INDEX "event_history_event_id_created_at_idx" ON "event_history" USING btree ("event_id","created_at");--> statement-breakpoint
CREATE INDEX "event_history_performed_by_id_idx" ON "event_history" USING btree ("performed_by_id");--> statement-breakpoint
CREATE UNIQUE INDEX "event_participant_event_id_user_id_idx" ON "event_participant" USING btree ("event_id","user_id");--> statement-breakpoint
CREATE INDEX "event_participant_user_id_idx" ON "event_participant" USING btree ("user_id");