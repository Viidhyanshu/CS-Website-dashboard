# Step 2: Database Schema & Client Connections

> [!IMPORTANT]
> Before writing any code, check the [AGENTS.md](file:///d:/projects/CS-Dashboard/cs-dashboard/AGENTS.md) file for critical instructions regarding this project's custom Next.js conventions, APIs, and file structure rules.

This step establishes the connection clients for Drizzle ORM and Cloudflare R2 storage, defines database tables, and sets up TypeScript types.

## 1. Setup Source Directory

Ensure the target directories exist:
`src/lib/db`

## 2. Implement Database & Storage Connections

### File: [schema.ts](file:///d:/projects/CS-Dashboard/cs-dashboard/src/lib/db/schema.ts)

Create the database schema representing tables for the gallery, hero settings, hero overlay images, and events.

```typescript
import { pgTable, uuid, varchar, text, integer, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const homepageGalleryItems = pgTable('homepage_gallery_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  caption: text('caption'),
  imageUrl: text('image_url').notNull(),
  displayOrder: integer('display_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdateFn(() => new Date()),
}, (table) => [
  index('gallery_active_order_idx').on(table.isActive, table.displayOrder),
]);

export const homepageHero = pgTable('homepage_hero', {
  id: uuid('id').primaryKey().defaultRandom(),
  heading: text('heading').notNull(),
  subheading: text('subheading').notNull(),
  description: text('description').notNull(),
  ctaText: varchar('cta_text', { length: 100 }).notNull(),
  ctaLink: text('cta_link').notNull(),
  backgroundImageUrl: text('background_image_url').notNull(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdateFn(() => new Date()),
});

export const homepageHeroImages = pgTable('homepage_hero_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  heroId: uuid('hero_id').notNull().references(() => homepageHero.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url').notNull(),
  displayOrder: integer('display_order').notNull().default(0),
}, (table) => [
  index('hero_images_hero_id_idx').on(table.heroId),
  index('hero_images_order_idx').on(table.displayOrder),
]);

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description').notNull(),
  coverImage: text('cover_image').notNull(),
  eventDate: timestamp('event_date').notNull(),
  displayOrder: integer('display_order').notNull().default(0),
  featured: boolean('featured').notNull().default(false),
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdateFn(() => new Date()),
}, (table) => [
  index('events_status_order_idx').on(table.status, table.displayOrder),
  index('events_featured_idx').on(table.featured),
]);

export const homepageHeroRelations = relations(homepageHero, ({ many }) => ({
  overlayImages: many(homepageHeroImages),
}));

export const homepageHeroImagesRelations = relations(homepageHeroImages, ({ one }) => ({
  hero: one(homepageHero, {
    fields: [homepageHeroImages.heroId],
    references: [homepageHero.id],
  }),
}));
```

### File: [index.ts](file:///d:/projects/CS-Dashboard/cs-dashboard/src/lib/db/index.ts)

Configure the read-write Drizzle instance connected to the Supabase database.

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
export const db = drizzle(client, { schema });
```

### File: [r2.ts](file:///d:/projects/CS-Dashboard/cs-dashboard/src/lib/r2.ts)

Initialize the S3 Client for Cloudflare R2 file uploads.

```typescript
import { S3Client } from '@aws-sdk/client-s3';

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});
```

### File: [types.ts](file:///d:/projects/CS-Dashboard/cs-dashboard/src/lib/types.ts)

Export TypeScript models mapped to database entries:

```typescript
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { homepageGalleryItems, homepageHero, homepageHeroImages, events } from './db/schema';

export type GalleryItem = InferSelectModel<typeof homepageGalleryItems>;
export type NewGalleryItem = InferInsertModel<typeof homepageGalleryItems>;

export type HeroSettings = InferSelectModel<typeof homepageHero>;
export type NewHeroSettings = InferInsertModel<typeof homepageHero>;

export type HeroImage = InferSelectModel<typeof homepageHeroImages>;
export type NewHeroImage = InferInsertModel<typeof homepageHeroImages>;

export type EventModel = InferSelectModel<typeof events>;
export type NewEventModel = InferInsertModel<typeof events>;

export interface HeroData extends HeroSettings {
  overlayImages: HeroImage[];
}
```

---

## Completion Checklist
- [x] Database client schema created at [schema.ts](file:///d:/projects/CS-Dashboard/cs-dashboard/src/lib/db/schema.ts).
- [x] Database client initialized at [index.ts](file:///d:/projects/CS-Dashboard/cs-dashboard/src/lib/db/index.ts).
- [x] R2 S3 Client instance configured at [r2.ts](file:///d:/projects/CS-Dashboard/cs-dashboard/src/lib/r2.ts).
- [x] Interface types specified at [types.ts](file:///d:/projects/CS-Dashboard/cs-dashboard/src/lib/types.ts).
