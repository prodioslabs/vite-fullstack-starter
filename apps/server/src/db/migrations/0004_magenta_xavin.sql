DROP INDEX "id_status_idx";--> statement-breakpoint
CREATE INDEX "id_captcha_status_idx" ON "captcha" USING btree ("id","captcha","status");