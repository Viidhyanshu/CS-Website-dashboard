'use server';

import sql from '../db';
import { triggerWebsiteRevalidation } from './revalidate';
import { TeamMember, NewTeamMember } from '../types';

export async function getAdminTeamMembersAction(): Promise<TeamMember[]> {
  const rows = await sql`
    SELECT
      id, name, role,
      image_url      AS "imageUrl",
      "group",
      linkedin_url   AS "linkedinUrl",
      instagram_url  AS "instagramUrl",
      github_url     AS "githubUrl",
      display_order  AS "displayOrder",
      is_active      AS "isActive",
      created_at     AS "createdAt",
      updated_at     AS "updatedAt"
    FROM team_members
    ORDER BY
      CASE "group" WHEN 'ec' THEN 1 WHEN 'web' THEN 2 WHEN 'core' THEN 3 ELSE 4 END,
      display_order ASC
  `;
  return rows as unknown as TeamMember[];
}

export async function createTeamMemberAction(data: Omit<NewTeamMember, 'id' | 'displayOrder' | 'createdAt' | 'updatedAt'>) {
  try {
    const name = data.name ?? '';
    const role = data.role ?? '';
    const imageUrl = data.imageUrl ?? '';
    const group = data.group ?? 'core';
    const linkedinUrl = data.linkedinUrl ?? null;
    const instagramUrl = data.instagramUrl ?? null;
    const githubUrl = data.githubUrl ?? null;
    const isActive = data.isActive ?? true;

    const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM team_members`;
    await sql`
      INSERT INTO team_members (name, role, image_url, "group", linkedin_url, instagram_url, github_url, display_order, is_active)
      VALUES (
        ${name}, ${role}, ${imageUrl}, ${group},
        ${linkedinUrl}, ${instagramUrl}, ${githubUrl},
        ${count}, ${isActive}
      )
    `;
    await triggerWebsiteRevalidation('team');
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function updateTeamMemberAction(id: string, data: Partial<NewTeamMember>) {
  try {
    const updates: Record<string, unknown> = {};
    if (data.name !== undefined)          updates.name          = data.name;
    if (data.role !== undefined)          updates.role          = data.role;
    if (data.imageUrl !== undefined)      updates.image_url     = data.imageUrl;
    if (data.group !== undefined)         updates.group         = data.group;
    if ('linkedinUrl' in data)            updates.linkedin_url  = data.linkedinUrl ?? null;
    if ('instagramUrl' in data)           updates.instagram_url = data.instagramUrl ?? null;
    if ('githubUrl' in data)              updates.github_url    = data.githubUrl ?? null;
    if (data.isActive !== undefined)      updates.is_active     = data.isActive;

    if (Object.keys(updates).length > 0) {
      updates.updated_at = new Date();
      await sql`UPDATE team_members SET ${sql(updates)} WHERE id = ${id}`;
    }
    await triggerWebsiteRevalidation('team');
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function deleteTeamMemberAction(id: string) {
  try {
    await sql`DELETE FROM team_members WHERE id = ${id}`;
    await triggerWebsiteRevalidation('team');
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function updateTeamMembersOrderAction(orderedIds: string[]) {
  try {
    if (orderedIds.length === 0) return { success: true };
    
    // Use transaction for all updates
    await sql.begin(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx`UPDATE team_members SET display_order = ${i} WHERE id = ${orderedIds[i]}`;
      }
    });
    
    await triggerWebsiteRevalidation('team');
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
