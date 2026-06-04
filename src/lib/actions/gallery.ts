'use server';

import sql from '../db';
import { triggerWebsiteRevalidation } from './revalidate';
import { GalleryItem, NewGalleryItem } from '../types';

export async function getAdminGalleryItemsAction(): Promise<GalleryItem[]> {
  const rows = await sql`
    SELECT
      id, title, caption,
      image_url        AS "imageUrl",
      display_order    AS "displayOrder",
      is_active        AS "isActive",
      created_at       AS "createdAt",
      updated_at       AS "updatedAt"
    FROM homepage_gallery_items
    ORDER BY display_order ASC
  `;
  return rows as unknown as GalleryItem[];
}

export async function createGalleryItemAction(data: {
  title: string;
  caption?: string | null;
  imageUrl: string;
  isActive: boolean;
}) {
  try {
    const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM homepage_gallery_items`;
    await sql`
      INSERT INTO homepage_gallery_items (title, caption, image_url, display_order, is_active)
      VALUES (${data.title}, ${data.caption ?? null}, ${data.imageUrl}, ${count}, ${data.isActive})
    `;
    await triggerWebsiteRevalidation('gallery');
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function updateGalleryItemAction(id: string, data: Partial<NewGalleryItem>) {
  try {
    const updates: Record<string, unknown> = {};
    if (data.title !== undefined)       updates.title       = data.title;
    if (data.caption !== undefined)     updates.caption     = data.caption ?? null;
    if (data.imageUrl !== undefined)    updates.image_url   = data.imageUrl;
    if (data.isActive !== undefined)    updates.is_active   = data.isActive;

    if (Object.keys(updates).length > 0) {
      await sql`UPDATE homepage_gallery_items SET ${sql(updates)} WHERE id = ${id}`;
    }
    await triggerWebsiteRevalidation('gallery');
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function deleteGalleryItemAction(id: string) {
  try {
    await sql`DELETE FROM homepage_gallery_items WHERE id = ${id}`;
    await triggerWebsiteRevalidation('gallery');
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function updateGalleryItemsOrderAction(orderedIds: string[]) {
  try {
    await sql.begin(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx`UPDATE homepage_gallery_items SET display_order = ${i} WHERE id = ${orderedIds[i]}`;
      }
    });
    await triggerWebsiteRevalidation('gallery');
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
