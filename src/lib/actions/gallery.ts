'use server';

import { db } from '../db';
import { homepageGalleryItems } from '../db/schema';
import { eq, asc } from 'drizzle-orm';
import { triggerWebsiteRevalidation } from './revalidate';
import { GalleryItem, NewGalleryItem } from '../types';

export async function getAdminGalleryItemsAction(): Promise<GalleryItem[]> {
  return db.select().from(homepageGalleryItems).orderBy(asc(homepageGalleryItems.displayOrder));
}

export async function createGalleryItemAction(data: {
  title: string;
  caption?: string | null;
  imageUrl: string;
  isActive: boolean;
}) {
  try {
    const current = await db.select().from(homepageGalleryItems);
    await db.insert(homepageGalleryItems).values({
      ...data,
      displayOrder: current.length,
    });

    await triggerWebsiteRevalidation('gallery');
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function updateGalleryItemAction(id: string, data: Partial<NewGalleryItem>) {
  try {
    await db.update(homepageGalleryItems).set(data).where(eq(homepageGalleryItems.id, id));
    await triggerWebsiteRevalidation('gallery');
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function deleteGalleryItemAction(id: string) {
  try {
    await db.delete(homepageGalleryItems).where(eq(homepageGalleryItems.id, id));
    await triggerWebsiteRevalidation('gallery');
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function updateGalleryItemsOrderAction(orderedIds: string[]) {
  try {
    await db.transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx.update(homepageGalleryItems)
          .set({ displayOrder: i })
          .where(eq(homepageGalleryItems.id, orderedIds[i]));
      }
    });

    await triggerWebsiteRevalidation('gallery');
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
