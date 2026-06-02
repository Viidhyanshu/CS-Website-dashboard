# Standalone Admin Dashboard Implementation Plan (Cloudflare R2 + Supabase)

This document is a comprehensive, production-grade guide for setting up and implementing the **Admin Dashboard** in a separate repository.

---

## 1. Project Directory Structure

Initialize your new Next.js 15 or 16 App Router project (e.g. `npx create-next-app@latest admin-dashboard --ts --tailwind --app --src-dir`), then structure the project as follows:

```
admin-dashboard
├── drizzle.config.ts             # Drizzle kit configuration for migrations
├── .env.local                    # Secrets, DB URLs, R2 keys, Website endpoints
└── src
    ├── app
    │   ├── layout.tsx            # Global layout, fonts, and dark mode classes
    │   └── admin
    │       ├── layout.tsx        # Dashboard Shell (Sidebar, Header, Main Panel)
    │       ├── page.tsx          # Overview Stats (Counts of Gallery, Events, etc.)
    │       ├── homepage
    │       │   ├── hero
    │       │   │   └── page.tsx  # Editor for main Hero fields & background image
    │       │   ├── hero-images
    │       │   │   └── page.tsx  # Drag & Drop reordering of overlay images
    │       │   └── gallery
    │       │       └── page.tsx  # List, CRUD, and Drag & Drop of gallery items
    │       ├── events
    │       │   ├── page.tsx      # Table list of events (publish, delete, edit links)
    │       │   ├── new
    │       │   │   └── page.tsx  # Event creation form
    │       │   └── [id]
    │       │       └── edit
    │       │           └── page.tsx # Event editing form
    │       └── media
    │           └── page.tsx      # Media library file browser and uploader
    ├── components
    │   └── admin
    │       ├── Sidebar.tsx               # Admin Navigation Sidebar
    │       ├── DragAndDropGallery.tsx    # HTML5 Drag & Drop for gallery reordering
    │       ├── DragAndDropHeroImages.tsx # HTML5 Drag & Drop for overlay images
    │       ├── EventForm.tsx             # Shared Event Form (New/Edit)
    │       └── MediaSelector.tsx         # Asset picker that opens the Media Library
    ├── lib
    │   ├── db
    │   │   ├── index.ts          # Read-Write Drizzle connection client
    │   │   └── schema.ts         # Shared database schema definitions
    │   ├── actions               # Next.js Server Actions
    │   │   ├── hero.ts           # Hero and overlay image actions
    │   │   ├── gallery.ts        # Horizontal gallery actions
    │   │   ├── events.ts         # Event management actions
    │   │   ├── media.ts          # Cloudflare R2 uploads and lists
    │   │   └── revalidate.ts     # Pings the club website to clear caches
    │   ├── r2.ts                 # AWS S3-compatible client for Cloudflare R2
    │   └── types.ts              # TypeScript type definitions
    └── utils.ts
```

---

## 2. Dependencies & Configuration

### Package Installation
Run the following command in the admin project directory:
```bash
npm install drizzle-orm postgres @aws-sdk/client-s3 lucide-react
npm install -D drizzle-kit typescript @types/node
```

### [NEW] [.env.local](file:///d:/projects/CS-Website/admin-dashboard/.env.local)
Create this file in the root of the admin repository:
```env
# Database connection (Use pooler URL on port 6543)
DATABASE_URL="postgresql://postgres.dltxlwquwfjhqghirnal:[YOUR-PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"

# Cloudflare R2 Credentials
R2_ACCOUNT_ID="your_cloudflare_account_id"
R2_ACCESS_KEY_ID="your_r2_access_key_id"
R2_SECRET_ACCESS_KEY="your_r2_secret_access_key"
R2_BUCKET_NAME="club-cms"
R2_PUBLIC_DOMAIN="https://media.ieee-cs-muj.com" # E.g., custom domain or pub-xxx.r2.dev

# Revalidation Webhook Integration (Website details)
NEXT_PUBLIC_WEBSITE_URL="http://localhost:3000" # Update in production
REVALIDATION_TOKEN="cfc9e29a8a7de86f1e847c234a5d429a"
```

### [NEW] [drizzle.config.ts](file:///d:/projects/CS-Website/admin-dashboard/drizzle.config.ts)
```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

---

## 3. Database Schema & R2 Setup

### [NEW] [schema.ts](file:///d:/projects/CS-Website/admin-dashboard/src/lib/db/schema.ts)
Copy this schema exactly to match the main website.

```typescript
import { pgTable, uuid, varchar, text, integer, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const homepageGalleryItems = pgTable('homepage_gallery_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  caption: text('caption'),
  imageUrl: text('image_url').notNull(),
  displayOrder: integer('display_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdateFn(() => new Date()),
}, (table) => [
  index('gallery_active_order_idx').on(table.isActive, table.displayOrder),
]);

export const homepageHero = pgTable('homepage_hero', {
  id: uuid('id').primaryKey().defaultRandom(),
  heading: text('heading').notNull(),
  subheading: text('subheading').notNull(),
  description: text('description').notNull(),
  ctaText: varchar('cta_text', { length: 100 }).notNull(),
  ctaLink: text('cta_link').notNull(),
  backgroundImageUrl: text('background_image_url').notNull(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdateFn(() => new Date()),
});

export const homepageHeroImages = pgTable('homepage_hero_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  heroId: uuid('hero_id').notNull().references(() => homepageHero.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url').notNull(),
  displayOrder: integer('display_order').notNull().default(0),
}, (table) => [
  index('hero_images_hero_id_idx').on(table.heroId),
  index('hero_images_order_idx').on(table.displayOrder),
]);

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description').notNull(),
  coverImage: text('cover_image').notNull(),
  eventDate: timestamp('event_date').notNull(),
  displayOrder: integer('display_order').notNull().default(0),
  featured: boolean('featured').notNull().default(false),
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdateFn(() => new Date()),
}, (table) => [
  index('events_status_order_idx').on(table.status, table.displayOrder),
  index('events_featured_idx').on(table.featured),
]);

export const homepageHeroRelations = relations(homepageHero, ({ many }) => ({
  overlayImages: many(homepageHeroImages),
}));

export const homepageHeroImagesRelations = relations(homepageHeroImages, ({ one }) => ({
  hero: one(homepageHero, {
    fields: [homepageHeroImages.heroId],
    references: [homepageHero.id],
  }),
}));
```

### [NEW] [index.ts](file:///d:/projects/CS-Website/admin-dashboard/src/lib/db/index.ts)
```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
export const db = drizzle(client, { schema });
```

### [NEW] [r2.ts](file:///d:/projects/CS-Website/admin-dashboard/src/lib/r2.ts)
Configure the S3 Client connection to R2 storage endpoint.
```typescript
import { S3Client } from '@aws-sdk/client-s3';

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});
```

### [NEW] [types.ts](file:///d:/projects/CS-Website/admin-dashboard/src/lib/types.ts)
```typescript
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { homepageGalleryItems, homepageHero, homepageHeroImages, events } from './db/schema';

export type GalleryItem = InferSelectModel<typeof homepageGalleryItems>;
export type NewGalleryItem = InferInsertModel<typeof homepageGalleryItems>;

export type HeroSettings = InferSelectModel<typeof homepageHero>;
export type NewHeroSettings = InferInsertModel<typeof homepageHero>;

export type HeroImage = InferSelectModel<typeof homepageHeroImages>;
export type NewHeroImage = InferInsertModel<typeof homepageHeroImages>;

export type EventModel = InferSelectModel<typeof events>;
export type NewEventModel = InferInsertModel<typeof events>;

export interface HeroData extends HeroSettings {
  overlayImages: HeroImage[];
}
```

---

## 4. Server Actions (Write Operations & Revalidation Triggers)

### [NEW] [revalidate.ts](file:///d:/projects/CS-Website/admin-dashboard/src/lib/actions/revalidate.ts)
Sends a request to the main website to clear its internal data cache tags.
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

### [NEW] [media.ts](file:///d:/projects/CS-Website/admin-dashboard/src/lib/actions/media.ts)
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

### [NEW] [hero.ts](file:///d:/projects/CS-Website/admin-dashboard/src/lib/actions/hero.ts)
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

### [NEW] [gallery.ts](file:///d:/projects/CS-Website/admin-dashboard/src/lib/actions/gallery.ts)
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

### [NEW] [events.ts](file:///d:/projects/CS-Website/admin-dashboard/src/lib/actions/events.ts)
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

## 5. Shared Admin React Components

### [NEW] [MediaSelector.tsx](file:///d:/projects/CS-Website/admin-dashboard/src/components/admin/MediaSelector.tsx)
Opens an overlay with files uploaded in Cloudflare R2 to select an image URL.
```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { listR2MediaFilesAction } from '@/lib/actions/media';
import { FolderOpen, X, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface MediaSelectorProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
}

export default function MediaSelector({ value, onChange, label }: MediaSelectorProps) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      listR2MediaFilesAction('media')
        .then(res => {
          if (res.success) setFiles(res.files);
        })
        .finally(() => setLoading(false));
    }
  }, [open]);

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</label>
      <div className="flex gap-4 items-center">
        {value ? (
          <div className="relative w-24 h-16 rounded overflow-hidden border border-[#222] bg-black">
            <Image src={value} alt="Selected image" fill className="object-cover" />
          </div>
        ) : (
          <div className="w-24 h-16 rounded border border-dashed border-[#333] flex items-center justify-center text-xs text-gray-600 bg-[#0c0c0c]">
            Empty
          </div>
        )}
        <div className="flex-1 flex flex-col gap-1.5">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://media.ieee-cs-muj.com/file.jpg"
            className="w-full bg-[#0c0c0c] border border-[#222] rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#f9ba1f]"
          />
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 text-xs text-[#f9ba1f] hover:text-white font-medium transition-colors w-fit"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            Pick from Media Library
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0c0c0c] border border-[#1f1f1f] rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-[#1f1f1f] flex justify-between items-center bg-[#090909] rounded-t-xl">
              <h3 className="font-semibold text-white">Select Asset</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-black/20">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="w-8 h-8 text-[#f9ba1f] animate-spin" />
                  <p className="text-sm text-gray-500">Loading library files...</p>
                </div>
              ) : files.length === 0 ? (
                <p className="text-center text-gray-500 py-20 text-sm">No files uploaded. Go to Media Library to upload assets.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                  {files.map(file => (
                    <button
                      key={file.key}
                      onClick={() => {
                        onChange(file.url);
                        setOpen(false);
                      }}
                      className="group flex flex-col gap-2 p-2 rounded-lg border border-[#222] bg-[#0c0c0c] hover:border-[#f9ba1f] text-left transition-all"
                    >
                      <div className="relative aspect-video w-full bg-black rounded overflow-hidden">
                        <Image src={file.url} alt={file.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <span className="text-xs text-gray-400 truncate w-full font-mono">{file.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### [NEW] [DragAndDropGallery.tsx](file:///d:/projects/CS-Website/admin-dashboard/src/components/admin/DragAndDropGallery.tsx)
```tsx
'use client';

import React, { useState, useRef } from 'react';
import { GalleryItem } from '@/lib/types';
import { updateGalleryItemsOrderAction } from '@/lib/actions/gallery';
import Image from 'next/image';
import { Move, GripVertical, Loader2 } from 'lucide-react';

export default function DragAndDropGallery({ initialItems }: { initialItems: GalleryItem[] }) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems);
  const [saving, setSaving] = useState(false);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const copyListItems = [...items];
      const dragged = copyListItems[dragItem.current];
      copyListItems.splice(dragItem.current, 1);
      copyListItems.splice(dragOverItem.current, 0, dragged);
      setItems(copyListItems);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const saveOrder = async () => {
    setSaving(true);
    const ids = items.map(item => item.id);
    const res = await updateGalleryItemsOrderAction(ids);
    setSaving(false);
    if (res.success) {
      alert('Gallery ordering saved successfully!');
    } else {
      alert(`Error saving order: ${res.error}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#0c0c0c] p-4 rounded-xl border border-[#1f1f1f]">
        <p className="text-gray-400 text-xs sm:text-sm">Drag and drop items to set display order on the home page gallery track.</p>
        <button
          onClick={saveOrder}
          disabled={saving}
          className="bg-[#f9ba1f] hover:bg-[#d69f1a] text-black font-semibold px-5 py-2 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50 transition-colors"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? 'Saving...' : 'Save Layout'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            className="group relative cursor-grab active:cursor-grabbing bg-[#0c0c0c] border border-[#1f1f1f] hover:border-[#f9ba1f]/50 p-4 rounded-xl transition-all duration-200 flex flex-col gap-3"
          >
            <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black border border-[#1f1f1f]">
              <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
              <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 rounded text-xs text-[#f9ba1f] font-mono border border-[#1f1f1f]">
                #{index + 1}
              </div>
              <div className="absolute top-2 right-2 bg-black/80 p-1.5 rounded text-gray-400 hover:text-white border border-[#1f1f1f]">
                <GripVertical className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white truncate text-sm">{item.title}</h4>
              <p className="text-xs text-gray-500 truncate mt-0.5">{item.caption || 'No caption provided'}</p>
            </div>
            <div className="mt-auto flex justify-between items-center pt-2.5 border-t border-[#1f1f1f] text-xs">
              <span className={`px-2.5 py-0.5 rounded-full font-medium ${item.isActive ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40' : 'bg-red-950/80 text-red-400 border border-red-800/40'}`}>
                {item.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 6. Dashboard Layout & Pages

### [NEW] [Sidebar.tsx](file:///d:/projects/CS-Website/admin-dashboard/src/components/admin/Sidebar.tsx)
```tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Image as ImageIcon, Sliders, Calendar, FolderOpen } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Hero settings', href: '/admin/homepage/hero', icon: Sliders },
    { label: 'Hero overlay', href: '/admin/homepage/hero-images', icon: FileText },
    { label: 'Horizontal gallery', href: '/admin/homepage/gallery', icon: ImageIcon },
    { label: 'Events manager', href: '/admin/events', icon: Calendar },
    { label: 'Media library', href: '/admin/media', icon: FolderOpen },
  ];

  return (
    <aside className="w-64 bg-[#0c0c0c] border-r border-[#1f1f1f] flex flex-col z-20">
      <div className="h-16 flex items-center px-6 border-b border-[#1f1f1f]">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-[#f9ba1f] flex items-center justify-center font-bold text-black text-xs">
            CS
          </div>
          <span className="font-semibold text-white tracking-wide text-sm font-sans uppercase">IEEE CS Admin</span>
        </Link>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1.5 bg-[#090909]">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#f9ba1f]/10 text-[#f9ba1f] border-l-2 border-[#f9ba1f]'
                  : 'text-gray-400 hover:bg-[#141414] hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-[#1f1f1f] bg-[#0c0c0c] text-[10px] text-gray-600 text-center font-mono">
        v1.0.0
      </div>
    </aside>
  );
}
```

### [NEW] [layout.tsx](file:///d:/projects/CS-Website/admin-dashboard/src/app/admin/layout.tsx)
Admin dashboard wrapper structure:
```tsx
import React from 'react';
import Sidebar from '@/components/admin/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#080808] text-gray-200 flex font-sans">
      {/* Sidebar navigation */}
      <Sidebar />
      
      {/* Main viewport */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <header className="h-16 border-b border-[#1f1f1f] bg-[#0c0c0c] flex items-center justify-between px-8">
          <div>
            <h1 className="text-xs text-gray-500 uppercase tracking-widest font-mono">Decoupled Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-emerald-500 bg-emerald-950/30 border border-emerald-900/40 px-2.5 py-1 rounded-full font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Live Sync
            </span>
          </div>
        </header>
        <main className="p-8 max-w-7xl w-full mx-auto flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### [NEW] [page.tsx](file:///d:/projects/CS-Website/admin-dashboard/src/app/admin/page.tsx)
Overview dashboard stats:
```tsx
import React from 'react';
import { db } from '@/lib/db';
import { homepageGalleryItems, events, homepageHero } from '@/lib/db/schema';
import { count } from 'drizzle-orm';
import { Calendar, Image as ImageIcon, Sliders, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardOverview() {
  const [galleryCount] = await db.select({ count: count() }).from(homepageGalleryItems);
  const [eventsCount] = await db.select({ count: count() }).from(events);
  const heroData = await db.query.homepageHero.findFirst();

  const cards = [
    { label: 'Gallery items', count: galleryCount.count, href: '/admin/homepage/gallery', icon: ImageIcon, desc: 'Horizontal slider images' },
    { label: 'Club events', count: eventsCount.count, href: '/admin/events', icon: Calendar, desc: 'Event posters & settings' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">Manage dynamic CMS contents for the club website homepage.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-[#0c0c0c] border border-[#1f1f1f] p-6 rounded-xl hover:border-[#f9ba1f]/30 transition-all flex flex-col justify-between group">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-[#f9ba1f]/10 text-[#f9ba1f] rounded-lg">
                  <Icon className="w-6 h-6" />
                </div>
                <Link href={card.href} className="text-gray-500 hover:text-white transition-colors">
                  <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
              <div className="mt-6">
                <p className="text-3xl font-extrabold text-white">{card.count}</p>
                <h4 className="text-sm font-semibold text-gray-300 mt-1">{card.label}</h4>
                <p className="text-xs text-gray-600 mt-1 font-mono">{card.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-[#0c0c0c] border border-[#1f1f1f] p-6 rounded-xl">
        <h3 className="font-semibold text-white text-base">Hero Section Status</h3>
        <p className="text-xs text-gray-500 mt-1">Status of the main landing panel of the website.</p>
        <div className="mt-4 border-t border-[#1f1f1f] pt-4 flex justify-between items-center text-sm">
          <span className="text-gray-400">Database Entry:</span>
          {heroData ? (
            <span className="text-emerald-400 font-mono bg-emerald-950/20 border border-emerald-900/30 px-2 py-0.5 rounded">Configured ({heroData.heading.substring(0, 15)}...)</span>
          ) : (
            <span className="text-amber-400 font-mono bg-amber-950/20 border border-amber-900/30 px-2 py-0.5 rounded">Not Configured</span>
          )}
        </div>
      </div>
    </div>
  );
}
```

### [NEW] [page.tsx](file:///d:/projects/CS-Website/admin-dashboard/src/app/admin/homepage/hero/page.tsx)
Editor for main Hero fields and background image:
```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { getHeroDataAction, updateHeroSettingsAction } from '@/lib/actions/hero';
import MediaSelector from '@/components/admin/MediaSelector';

export default function EditHeroPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    heading: '',
    subheading: '',
    description: '',
    ctaText: '',
    ctaLink: '',
    backgroundImageUrl: ''
  });

  useEffect(() => {
    getHeroDataAction().then(data => {
      if (data) {
        setFormData({
          heading: data.heading,
          subheading: data.subheading,
          description: data.description,
          ctaText: data.ctaText,
          ctaLink: data.ctaLink,
          backgroundImageUrl: data.backgroundImageUrl
        });
      }
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateHeroSettingsAction(formData);
    setSaving(false);
    if (res.success) {
      alert('Hero settings saved and website revalidated!');
    } else {
      alert(`Error saving: ${res.error}`);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading settings...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Hero settings</h2>
        <p className="text-gray-500 text-sm mt-1">Edit the heading texts, buttons, and landing background.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#0c0c0c] border border-[#1f1f1f] rounded-xl p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Heading (supports \n newlines)</label>
            <textarea
              required
              rows={3}
              value={formData.heading}
              onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
              className="w-full bg-[#080808] border border-[#222] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#f9ba1f] resize-none"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Subheading</label>
            <textarea
              required
              rows={3}
              value={formData.subheading}
              onChange={(e) => setFormData({ ...formData, subheading: e.target.value })}
              className="w-full bg-[#080808] border border-[#222] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#f9ba1f] resize-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Description text</label>
          <textarea
            required
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-[#080808] border border-[#222] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#f9ba1f]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">CTA button text</label>
            <input
              required
              type="text"
              value={formData.ctaText}
              onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
              className="w-full bg-[#080808] border border-[#222] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#f9ba1f]"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">CTA link</label>
            <input
              required
              type="text"
              value={formData.ctaLink}
              onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
              className="w-full bg-[#080808] border border-[#222] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#f9ba1f]"
            />
          </div>
        </div>

        <MediaSelector
          label="Background image"
          value={formData.backgroundImageUrl}
          onChange={(url) => setFormData({ ...formData, backgroundImageUrl: url })}
        />

        <div className="flex justify-end pt-4 border-t border-[#1f1f1f]">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#f9ba1f] hover:bg-[#d69f1a] text-black font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
```

### [NEW] [page.tsx](file:///d:/projects/CS-Website/admin-dashboard/src/app/admin/media/page.tsx)
Media Library uploader and file viewer directly mapping to R2 storage:
```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { uploadMediaToR2Action, listR2MediaFilesAction, deleteMediaFromR2Action } from '@/lib/actions/media';
import { Upload, Trash2, Eye, Loader2, Copy } from 'lucide-react';
import Image from 'next/image';

export default function MediaLibraryPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);
    const res = await listR2MediaFilesAction('media');
    if (res.success) setFiles(res.files);
    setLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'media');

    const res = await uploadMediaToR2Action(formData);
    setUploading(false);
    if (res.success) {
      alert('Asset uploaded to Cloudflare R2!');
      fetchFiles();
    } else {
      alert(`Error uploading: ${res.error}`);
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm('Are you sure you want to delete this file from Cloudflare R2?')) return;
    const res = await deleteMediaFromR2Action(key);
    if (res.success) {
      alert('File deleted!');
      fetchFiles();
    } else {
      alert(`Error deleting: ${res.error}`);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('URL copied to clipboard!');
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Media Library</h2>
          <p className="text-gray-500 text-sm mt-1">Upload and manage files stored in Cloudflare R2.</p>
        </div>
        
        <label className="bg-[#f9ba1f] hover:bg-[#d69f1a] text-black font-semibold px-5 py-2.5 rounded-lg text-sm flex items-center gap-2 cursor-pointer transition-colors">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Uploading...' : 'Upload File'}
          <input type="file" onChange={handleUpload} disabled={uploading} className="hidden" />
        </label>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-40">
          <Loader2 className="w-8 h-8 text-[#f9ba1f] animate-spin" />
        </div>
      ) : files.length === 0 ? (
        <div className="border border-dashed border-[#1f1f1f] rounded-xl text-center py-40 bg-[#0c0c0c]">
          <p className="text-gray-500 text-sm">No files uploaded yet. Click Upload File above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {files.map(file => (
            <div key={file.key} className="bg-[#0c0c0c] border border-[#1f1f1f] rounded-xl overflow-hidden flex flex-col group hover:border-[#f9ba1f]/30 transition-all">
              <div className="relative aspect-video w-full bg-black">
                <Image src={file.url} alt={file.name} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2.5 transition-all">
                  <a href={file.url} target="_blank" className="p-2 bg-[#0c0c0c] rounded-lg text-gray-400 hover:text-white border border-[#1f1f1f]">
                    <Eye className="w-4 h-4" />
                  </a>
                  <button onClick={() => copyUrl(file.url)} className="p-2 bg-[#0c0c0c] rounded-lg text-gray-400 hover:text-white border border-[#1f1f1f]">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(file.key)} className="p-2 bg-red-950/80 rounded-lg text-red-400 hover:text-red-300 border border-red-900/30">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <p className="text-xs text-white truncate font-mono" title={file.name}>{file.name}</p>
                <div className="flex justify-between items-center text-[10px] text-gray-600 font-mono mt-3">
                  <span>{(file.size / 1024).toFixed(1)} KB</span>
                  <span>{new Date(file.lastModified).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 7. Next Steps for Execution

1. Initialize your project directory and set up configuration files.
2. Link the project to your database credentials and setup S3 variables pointing to Cloudflare R2.
3. Push schemas using Drizzle Kit CLI tool.
4. Implement routing layout, Sidebar widgets, uploader components, and form pages.
5. Boot up the local test server and verify uploads and mutations syncing instantly to Supabase.
