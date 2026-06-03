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
