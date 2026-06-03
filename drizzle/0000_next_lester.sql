CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"cover_image" text NOT NULL,
	"event_date" timestamp NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "homepage_gallery_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"caption" text,
	"image_url" text NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "homepage_hero" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" text NOT NULL,
	"subheading" text NOT NULL,
	"description" text NOT NULL,
	"cta_text" varchar(100) NOT NULL,
	"cta_link" text NOT NULL,
	"background_image_url" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "homepage_hero_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hero_id" uuid NOT NULL,
	"image_url" text NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "homepage_hero_images" ADD CONSTRAINT "homepage_hero_images_hero_id_homepage_hero_id_fk" FOREIGN KEY ("hero_id") REFERENCES "public"."homepage_hero"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "events_status_order_idx" ON "events" USING btree ("status","display_order");--> statement-breakpoint
CREATE INDEX "events_featured_idx" ON "events" USING btree ("featured");--> statement-breakpoint
CREATE INDEX "gallery_active_order_idx" ON "homepage_gallery_items" USING btree ("is_active","display_order");--> statement-breakpoint
CREATE INDEX "hero_images_hero_id_idx" ON "homepage_hero_images" USING btree ("hero_id");--> statement-breakpoint
CREATE INDEX "hero_images_order_idx" ON "homepage_hero_images" USING btree ("display_order");