'use server';

import { db } from '../db';
import { teamMembers } from '../db/schema';
import { eq, asc, sql } from 'drizzle-orm';
import { triggerWebsiteRevalidation } from './revalidate';
import { TeamMember, NewTeamMember } from '../types';

// Sort: EC first, Web second, Core third — then by displayOrder within each group
const GROUP_PRIORITY = sql`CASE "group" WHEN 'ec' THEN 1 WHEN 'web' THEN 2 WHEN 'core' THEN 3 ELSE 4 END`;

export async function getAdminTeamMembersAction(): Promise<TeamMember[]> {
  return db.select().from(teamMembers).orderBy(GROUP_PRIORITY, asc(teamMembers.displayOrder));
}

export async function createTeamMemberAction(data: Omit<NewTeamMember, 'id' | 'displayOrder' | 'createdAt' | 'updatedAt'>) {
  try {
    const current = await db.select().from(teamMembers);
    await db.insert(teamMembers).values({
      ...data,
      displayOrder: current.length,
    });
    await triggerWebsiteRevalidation('team');
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function updateTeamMemberAction(id: string, data: Partial<NewTeamMember>) {
  try {
    await db.update(teamMembers).set(data).where(eq(teamMembers.id, id));
    await triggerWebsiteRevalidation('team');
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function deleteTeamMemberAction(id: string) {
  try {
    await db.delete(teamMembers).where(eq(teamMembers.id, id));
    await triggerWebsiteRevalidation('team');
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function updateTeamMembersOrderAction(orderedIds: string[]) {
  try {
    await db.transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx.update(teamMembers)
          .set({ displayOrder: i })
          .where(eq(teamMembers.id, orderedIds[i]));
      }
    });
    await triggerWebsiteRevalidation('team');
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
