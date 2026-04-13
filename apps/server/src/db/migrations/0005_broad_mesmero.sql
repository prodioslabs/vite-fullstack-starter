DROP INDEX "expires_at_idx";--> statement-breakpoint
DROP INDEX "id_captcha_status_idx";--> statement-breakpoint
CREATE INDEX "id_status_expires_at_idx" ON "captcha" USING btree ("id","status","expires_at");