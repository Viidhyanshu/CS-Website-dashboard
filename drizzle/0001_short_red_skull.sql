CREATE TABLE "team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" varchar(255) NOT NULL,
	"image_url" text NOT NULL,
	"group" varchar(50) DEFAULT 'core' NOT NULL,
	"linkedin_url" text,
	"instagram_url" text,
	"github_url" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "team_group_order_idx" ON "team_members" USING btree ("group","display_order");--> statement-breakpoint
CREATE INDEX "team_active_idx" ON "team_members" USING btree ("is_active");