'use server';

import { db } from '../db';
import { homepageHero, homepageHeroImages } from '../db/schema';
import { eq, asc } from 'drizzle-orm';
import { triggerWebsiteRevalidation } from './revalidate';
import { HeroData } from '../types';

export async function getHeroDataAction(): Promise<HeroData | null> {
  const result = await db.query.homepageHero.findFirst({
    with: {
      overlayImages: {
        orderBy: [asc(homepageHeroImages.displayOrder)],
      },
    },
  });
  return (result as HeroData) || null;
}

export async function updateHeroSettingsAction(data: {
  heading: string;
  subheading: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  backgroundImageUrl: string;
}) {
  try {
    const currentHero = await db.query.homepageHero.findFirst();

    if (currentHero) {
      await db.update(homepageHero)
        .set(data)
        .where(eq(homepageHero.id, currentHero.id));
    } else {
      await db.insert(homepageHero).values(data);
    }

    await triggerWebsiteRevalidation('hero');
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function addHeroOverlayImageAction(imageUrl: string) {
  try {
    const hero = await db.query.homepageHero.findFirst();
    if (!hero) throw new Error('Create Hero settings first.');

    const currentImages = await db.select().from(homepageHeroImages).where(eq(homepageHeroImages.heroId, hero.id));

    await db.insert(homepageHeroImages).values({
      heroId: hero.id,
      imageUrl,
      displayOrder: currentImages.length,
    });

    await triggerWebsiteRevalidation('hero');
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function removeHeroOverlayImageAction(id: string) {
  try {
    await db.delete(homepageHeroImages).where(eq(homepageHeroImages.id, id));
    await triggerWebsiteRevalidation('hero');
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function updateHeroImagesOrderAction(orderedIds: string[]) {
  try {
    await db.transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx.update(homepageHeroImages)
          .set({ displayOrder: i })
          .where(eq(homepageHeroImages.id, orderedIds[i]));
      }
    });

    await triggerWebsiteRevalidation('hero');
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
