'use server';

import sql from '../db';
import { triggerWebsiteRevalidation } from './revalidate';
import { EventModel, NewEventModel } from '../types';

export async function getAdminEventsAction(): Promise<EventModel[]> {
  const rows = await sql`
    SELECT
      id, title, slug, description,
      cover_image    AS "coverImage",
      event_date     AS "eventDate",
      display_order  AS "displayOrder",
      featured, status, tag,
      created_at     AS "createdAt",
      updated_at     AS "updatedAt"
    FROM events
    ORDER BY display_order ASC
  `;
  return rows as unknown as EventModel[];
}

export async function getEventByIdAction(id: string): Promise<EventModel | null> {
  const rows = await sql`
    SELECT
      id, title, slug, description,
      cover_image    AS "coverImage",
      event_date     AS "eventDate",
      display_order  AS "displayOrder",
      featured, status, tag,
      created_at     AS "createdAt",
      updated_at     AS "updatedAt"
    FROM events
    WHERE id = ${id}
    LIMIT 1
  `;
  return (rows[0] as unknown as EventModel) || null;
}

export async function createEventAction(data: Omit<NewEventModel, 'displayOrder'>) {
  try {
    const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM events`;
    await sql`
      INSERT INTO events (title, slug, description, cover_image, event_date, display_order, featured, status, tag)
      VALUES (
        ${data.title}, ${data.slug}, ${data.description}, ${data.coverImage},
        ${data.eventDate}, ${count},
        ${data.featured ?? false}, ${data.status ?? 'draft'}, ${data.tag ?? 'Workshop'}
      )
    `;
    await triggerWebsiteRevalidation('events');
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function updateEventAction(id: string, data: Partial<NewEventModel>) {
  try {
    const updates: Record<string, unknown> = {};
    if (data.title !== undefined)       updates.title        = data.title;
    if (data.slug !== undefined)        updates.slug         = data.slug;
    if (data.description !== undefined) updates.description  = data.description;
    if (data.coverImage !== undefined)  updates.cover_image  = data.coverImage;
    if (data.eventDate !== undefined)   updates.event_date   = data.eventDate;
    if (data.featured !== undefined)    updates.featured     = data.featured;
    if (data.status !== undefined)      updates.status       = data.status;
    if (data.tag !== undefined)         updates.tag          = data.tag;

    if (Object.keys(updates).length > 0) {
      updates.updated_at = new Date();
      await sql`UPDATE events SET ${sql(updates)} WHERE id = ${id}`;
    }
    await triggerWebsiteRevalidation('events');
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function deleteEventAction(id: string) {
  try {
    await sql`DELETE FROM events WHERE id = ${id}`;
    await triggerWebsiteRevalidation('events');
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function updateEventsOrderAction(orderedIds: string[]) {
  try {
    await sql.begin(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx`UPDATE events SET display_order = ${i} WHERE id = ${orderedIds[i]}`;
      }
    });
    await triggerWebsiteRevalidation('events');
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
