'use server';

import { db } from '../db';
import { events } from '../db/schema';
import { eq, asc } from 'drizzle-orm';
import { triggerWebsiteRevalidation } from './revalidate';
import { EventModel, NewEventModel } from '../types';

export async function getAdminEventsAction(): Promise<EventModel[]> {
  return db.select().from(events).orderBy(asc(events.displayOrder));
}

export async function getEventByIdAction(id: string): Promise<EventModel | null> {
  const res = await db.select().from(events).where(eq(events.id, id)).limit(1);
  return res[0] || null;
}

export async function createEventAction(data: Omit<NewEventModel, 'displayOrder'>) {
  try {
    const current = await db.select().from(events);
    await db.insert(events).values({
      ...data,
      displayOrder: current.length,
    });

    await triggerWebsiteRevalidation('events');
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function updateEventAction(id: string, data: Partial<NewEventModel>) {
  try {
    await db.update(events).set(data).where(eq(events.id, id));
    await triggerWebsiteRevalidation('events');
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function deleteEventAction(id: string) {
  try {
    await db.delete(events).where(eq(events.id, id));
    await triggerWebsiteRevalidation('events');
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function updateEventsOrderAction(orderedIds: string[]) {
  try {
    await db.transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx.update(events)
          .set({ displayOrder: i })
          .where(eq(events.id, orderedIds[i]));
      }
    });

    await triggerWebsiteRevalidation('events');
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
