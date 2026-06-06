'use server';

import sql from '../db';
import { triggerWebsiteRevalidation } from './revalidate';
import { HeroData } from '../types';

export async function getHeroDataAction(): Promise<HeroData | null> {
  const heroes = await sql`
    SELECT
      id, heading, subheading, description,
      cta_text              AS "ctaText",
      cta_link              AS "ctaLink",
      background_image_url  AS "backgroundImageUrl",
      updated_at            AS "updatedAt"
    FROM homepage_hero
    LIMIT 1
  `;
  if (heroes.length === 0) return null;

  const hero = heroes[0];
  const images = await sql`
    SELECT
      id,
      hero_id        AS "heroId",
      image_url      AS "imageUrl",
      display_order  AS "displayOrder"
    FROM homepage_hero_images
    WHERE hero_id = ${hero.id}
    ORDER BY display_order ASC
  `;

  return { ...hero, overlayImages: images } as unknown as HeroData;
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
    const existing = await sql`SELECT id FROM homepage_hero LIMIT 1`;

    if (existing.length > 0) {
      await sql`
        UPDATE homepage_hero SET
          heading              = ${data.heading},
          subheading           = ${data.subheading},
          description          = ${data.description},
          cta_text             = ${data.ctaText},
          cta_link             = ${data.ctaLink},
          background_image_url = ${data.backgroundImageUrl},
          updated_at           = NOW()
        WHERE id = ${existing[0].id}
      `;
    } else {
      await sql`
        INSERT INTO homepage_hero (heading, subheading, description, cta_text, cta_link, background_image_url)
        VALUES (${data.heading}, ${data.subheading}, ${data.description}, ${data.ctaText}, ${data.ctaLink}, ${data.backgroundImageUrl})
      `;
    }

    await triggerWebsiteRevalidation('hero');
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function addHeroOverlayImageAction(imageUrl: string) {
  try {
    const [hero] = await sql`SELECT id FROM homepage_hero LIMIT 1`;
    if (!hero) throw new Error('Create Hero settings first.');

    const [{ count }] = await sql`
      SELECT COUNT(*)::int AS count FROM homepage_hero_images WHERE hero_id = ${hero.id}
    `;
    await sql`
      INSERT INTO homepage_hero_images (hero_id, image_url, display_order)
      VALUES (${hero.id}, ${imageUrl}, ${count})
    `;

    await triggerWebsiteRevalidation('hero');
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function removeHeroOverlayImageAction(id: string) {
  try {
    await sql`DELETE FROM homepage_hero_images WHERE id = ${id}`;
    await triggerWebsiteRevalidation('hero');
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function updateHeroImagesOrderAction(orderedIds: string[]) {
  try {
    await sql.begin(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx`UPDATE homepage_hero_images SET display_order = ${i} WHERE id = ${orderedIds[i]}`;
      }
    });
    await triggerWebsiteRevalidation('hero');
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
