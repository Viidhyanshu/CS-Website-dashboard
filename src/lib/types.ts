import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { homepageGalleryItems, homepageHero, homepageHeroImages, events, teamMembers } from './db/schema';

export type GalleryItem = InferSelectModel<typeof homepageGalleryItems>;
export type NewGalleryItem = InferInsertModel<typeof homepageGalleryItems>;

export type HeroSettings = InferSelectModel<typeof homepageHero>;
export type NewHeroSettings = InferInsertModel<typeof homepageHero>;

export type HeroImage = InferSelectModel<typeof homepageHeroImages>;
export type NewHeroImage = InferInsertModel<typeof homepageHeroImages>;

export type EventModel = InferSelectModel<typeof events>;
export type NewEventModel = InferInsertModel<typeof events>;

export type TeamMember = InferSelectModel<typeof teamMembers>;
export type NewTeamMember = InferInsertModel<typeof teamMembers>;

export interface HeroData extends HeroSettings {
  overlayImages: HeroImage[];
}
