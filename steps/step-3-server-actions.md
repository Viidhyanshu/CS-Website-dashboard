# Step 3: Server Actions

> [!IMPORTANT]
> Before writing any code, check the [AGENTS.md](file:///d:/projects/CS-Dashboard/cs-dashboard/AGENTS.md) file for critical instructions regarding this project's custom Next.js conventions, APIs, and file structure rules.

This step defines Next.js server actions used for Cloudflare R2 file uploads/deletions, Supabase database queries and writes, and cache revalidation calls.

Create a folder: `src/lib/actions`

## 1. Web Revalidation Webhook Action

### File: [revalidate.ts](file:///d:/projects/CS-Dashboard/cs-dashboard/src/lib/actions/revalidate.ts)

Allows clearing tags on the main website after the admin alters content in the dashboard database.

```typescript
'use server';

export async function triggerWebsiteRevalidation(tag: 'hero' | 'gallery' | 'events') {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REVALIDATION_TOKEN}`,
      },
      body: JSON.stringify({ tag }),
      cache: 'no-store'
    });
    
    if (!res.ok) {
      console.error(`Revalidation failed with status code: ${res.status}`);
    }
  } catch (error) {
    console.error('Failed to trigger website revalidation:', error);
  }
}
```

## 2. Cloudflare R2 Storage Actions

### File: [media.ts](file:///d:/projects/CS-Dashboard/cs-dashboard/src/lib/actions/media.ts)

Handles upload, fetch, and deletion logic for media assets saved to the S3 bucket.

```typescript
'use server';

import { PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { r2Client } from '../r2';

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;
const PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN!;

export async function uploadMediaToR2Action(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'media';
    if (!file) throw new Error('File not found');

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    });

    await r2Client.send(uploadCommand);
    const publicUrl = `${PUBLIC_DOMAIN.replace(/\/$/, '')}/${fileName}`;

    return { success: true, url: publicUrl, path: fileName };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function listR2MediaFilesAction(folder = 'media') {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: `${folder}/`,
    });

    const response = await r2Client.send(command);
    const files = (response.Contents || [])
      .filter(item => item.Key !== `${folder}/`) // Exclude folder root itself
      .map(item => {
        const publicUrl = `${PUBLIC_DOMAIN.replace(/\/$/, '')}/${item.Key}`;
        return {
          name: item.Key?.split('/').pop() || '',
          key: item.Key || '',
          url: publicUrl,
          size: item.Size || 0,
          lastModified: item.LastModified || new Date(),
        };
      });

    return { success: true, files };
  } catch (e: any) {
    return { success: false, error: e.message, files: [] };
  }
}

export async function deleteMediaFromR2Action(path: string) {
  try {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: path,
    });

    await r2Client.send(deleteCommand);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
```

## 3. Homepage Hero Section Actions

### File: [hero.ts](file:///d:/projects/CS-Dashboard/cs-dashboard/src/lib/actions/hero.ts)

Handles getting and updating landing section titles, description text, links, background image, and overlay images order.

```typescript
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
  } catch (e: any) {
    return { success: false, error: e.message };
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
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function removeHeroOverlayImageAction(id: string) {
  try {
    await db.delete(homepageHeroImages).where(eq(homepageHeroImages.id, id));
    await triggerWebsiteRevalidation('hero');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
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
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
```

## 4. Homepage Gallery Actions

### File: [gallery.ts](file:///d:/projects/CS-Dashboard/cs-dashboard/src/lib/actions/gallery.ts)

Handles fetching, writing, editing, and deleting items displayed inside the horizontal scrolling gallery strip.

```typescript
'use server';

import { db } from '../db';
import { homepageGalleryItems } from '../db/schema';
import { eq, asc } from 'drizzle-orm';
import { triggerWebsiteRevalidation } from './revalidate';
import { GalleryItem } from '../types';

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
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateGalleryItemAction(id: string, data: any) {
  try {
    await db.update(homepageGalleryItems).set(data).where(eq(homepageGalleryItems.id, id));
    await triggerWebsiteRevalidation('gallery');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteGalleryItemAction(id: string) {
  try {
    await db.delete(homepageGalleryItems).where(eq(homepageGalleryItems.id, id));
    await triggerWebsiteRevalidation('gallery');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
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
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
```

## 5. Club Events Actions

### File: [events.ts](file:///d:/projects/CS-Dashboard/cs-dashboard/src/lib/actions/events.ts)

Handles query, insertion, update, delete, and ordering operations for club activities.

```typescript
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
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateEventAction(id: string, data: Partial<NewEventModel>) {
  try {
    await db.update(events).set(data).where(eq(events.id, id));
    await triggerWebsiteRevalidation('events');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteEventAction(id: string) {
  try {
    await db.delete(events).where(eq(events.id, id));
    await triggerWebsiteRevalidation('events');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
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
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
```

---

## Completion Checklist
- [x] Revalidation action implemented in [revalidate.ts](file:///d:/projects/CS-Dashboard/cs-dashboard/src/lib/actions/revalidate.ts).
- [x] R2 management actions written in [media.ts](file:///d:/projects/CS-Dashboard/cs-dashboard/src/lib/actions/media.ts).
- [x] Hero data actions written in [hero.ts](file:///d:/projects/CS-Dashboard/cs-dashboard/src/lib/actions/hero.ts).
- [x] Gallery manager actions written in [gallery.ts](file:///d:/projects/CS-Dashboard/cs-dashboard/src/lib/actions/gallery.ts).
- [x] Event actions written in [events.ts](file:///d:/projects/CS-Dashboard/cs-dashboard/src/lib/actions/events.ts).
