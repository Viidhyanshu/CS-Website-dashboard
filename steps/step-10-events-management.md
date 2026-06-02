# Step 10: Events Management Pages & Form Component

> [!IMPORTANT]
> Before writing any code, check the [AGENTS.md](file:///d:/projects/CS-Dashboard/cs-dashboard/AGENTS.md) file for critical instructions regarding this project's custom Next.js conventions, APIs, and file structure rules.

This step implements the club events manager table listing, the shared event creation/editing form component, and the routing endpoints for creating and updating events.

Create folders:
- `src/components/admin`
- `src/app/admin/events`
- `src/app/admin/events/new`
- `src/app/admin/events/[id]/edit`

## 1. Create Shared Event Form Component

### File: [EventForm.tsx](file:///d:/projects/CS-Dashboard/cs-dashboard/src/components/admin/EventForm.tsx)

```tsx
'use client';

import React, { useState } from 'react';
import { NewEventModel, EventModel } from '@/lib/types';
import MediaSelector from '@/components/admin/MediaSelector';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EventFormProps {
  initialData?: EventModel | null;
  onSubmit: (data: any) => Promise<{ success: boolean; error?: string }>;
  submitLabel: string;
}

export default function EventForm({ initialData, onSubmit, submitLabel }: EventFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    coverImage: initialData?.coverImage || '',
    eventDate: initialData?.eventDate ? new Date(initialData.eventDate).toISOString().substring(0, 16) : '',
    featured: initialData?.featured || false,
    status: initialData?.status || 'draft',
  });

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setFormData(prev => ({ ...prev, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const formattedData = {
      ...formData,
      eventDate: new Date(formData.eventDate),
    };

    const res = await onSubmit(formattedData);
    setSaving(false);

    if (res.success) {
      alert(`Event saved successfully!`);
      router.push('/admin/events');
      router.refresh();
    } else {
      alert(`Error saving event: ${res.error}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#0c0c0c] border border-[#1f1f1f] rounded-xl p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Event Title</label>
          <div className="flex gap-2">
            <input
              required
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="flex-1 bg-[#080808] border border-[#222] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#f9ba1f]"
            />
            <button
              type="button"
              onClick={generateSlug}
              className="bg-[#222] hover:bg-[#333] text-xs font-medium text-gray-300 px-3 rounded-lg border border-[#333] transition-colors"
            >
              Generate Slug
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Slug URL segment</label>
          <input
            required
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full bg-[#080808] border border-[#222] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#f9ba1f]"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Description</label>
        <textarea
          required
          rows={6}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full bg-[#080808] border border-[#222] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#f9ba1f]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Event Date & Time</label>
          <input
            required
            type="datetime-local"
            value={formData.eventDate}
            onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
            className="w-full bg-[#080808] border border-[#222] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#f9ba1f]"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full bg-[#080808] border border-[#222] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#f9ba1f]"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="flex items-center gap-3 pt-6">
          <input
            type="checkbox"
            id="featured"
            checked={formData.featured}
            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
            className="w-4 h-4 rounded border-[#222] bg-[#080808] text-[#f9ba1f] focus:ring-[#f9ba1f] focus:ring-offset-0 focus:outline-none accent-[#f9ba1f]"
          />
          <label htmlFor="featured" className="text-sm text-gray-300 font-medium cursor-pointer">
            Feature this event on Homepage
          </label>
        </div>
      </div>

      <MediaSelector
        label="Event Cover Image"
        value={formData.coverImage}
        onChange={(url) => setFormData({ ...formData, coverImage: url })}
      />

      <div className="flex justify-end pt-4 border-t border-[#1f1f1f] gap-3">
        <button
          type="button"
          onClick={() => { router.push('/admin/events'); router.refresh(); }}
          className="bg-[#181818] hover:bg-[#222] border border-[#333] text-gray-300 font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="bg-[#f9ba1f] hover:bg-[#d69f1a] text-black font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
```

## 2. Implement Events List Page

### File: [page.tsx](file:///d:/projects/CS-Dashboard/cs-dashboard/src/app/admin/events/page.tsx)

```tsx
import React from 'react';
import Link from 'next/link';
import { getAdminEventsAction, deleteEventAction } from '@/lib/actions/events';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function EventsListPage() {
  const events = await getAdminEventsAction();

  const deleteEvent = async (formData: FormData) => {
    'use server';
    const id = formData.get('id') as string;
    if (id) {
      await deleteEventAction(id);
      revalidatePath('/admin/events');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Events Manager</h2>
          <p className="text-gray-500 text-sm mt-1">Create, edit, delete, and list events hosted by the club.</p>
        </div>

        <Link
          href="/admin/events/new"
          className="bg-[#f9ba1f] hover:bg-[#d69f1a] text-black font-semibold px-5 py-2.5 rounded-lg text-sm flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Event
        </Link>
      </div>

      <div className="bg-[#0c0c0c] border border-[#1f1f1f] rounded-xl overflow-hidden">
        {events.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-[#0c0c0c]">
            No events found. Click "Add Event" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-gray-300">
              <thead className="bg-[#090909] text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-[#1f1f1f]">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Featured</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f1f]">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-semibold text-white truncate max-w-xs">{event.title}</td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{event.slug}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                        <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        event.status === 'published'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40'
                          : 'bg-zinc-900 text-gray-400 border border-zinc-700/40'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {event.featured ? (
                        <span className="text-[#f9ba1f] text-xs bg-[#f9ba1f]/10 px-2 py-0.5 rounded-full border border-[#f9ba1f]/20 font-medium">Yes</span>
                      ) : (
                        <span className="text-gray-600 text-xs">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3 items-center">
                        <Link
                          href={`/admin/events/${event.id}/edit`}
                          className="p-1.5 hover:bg-[#222] rounded text-gray-400 hover:text-white transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        
                        <form action={deleteEvent}>
                          <input type="hidden" name="id" value={event.id} />
                          <button
                            type="submit"
                            className="p-1.5 hover:bg-red-950/60 rounded text-red-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
```

## 3. Implement Event Creation Page

### File: [page.tsx](file:///d:/projects/CS-Dashboard/cs-dashboard/src/app/admin/events/new/page.tsx)

```tsx
'use client';

import React from 'react';
import { createEventAction } from '@/lib/actions/events';
import EventForm from '@/components/admin/EventForm';

export default function NewEventPage() {
  const handleCreate = async (data: any) => {
    return createEventAction(data);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Create New Event</h2>
        <p className="text-gray-500 text-sm mt-1">Publish a brand new event panel onto the club registry.</p>
      </div>

      <EventForm onSubmit={handleCreate} submitLabel="Create Event" />
    </div>
  );
}
```

## 4. Implement Event Editing Page

### File: [page.tsx](file:///d:/projects/CS-Dashboard/cs-dashboard/src/app/admin/events/[id]/edit/page.tsx)

```tsx
'use client';

import React, { useEffect, useState } from 'react';
import { getEventByIdAction, updateEventAction } from '@/lib/actions/events';
import { EventModel } from '@/lib/types';
import EventForm from '@/components/admin/EventForm';
import { useParams } from 'next/navigation';

export default function EditEventPage() {
  const { id } = useParams() as { id: string };
  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState<EventModel | null>(null);

  useEffect(() => {
    if (id) {
      getEventByIdAction(id).then(data => {
        setEventData(data);
        setLoading(false);
      });
    }
  }, [id]);

  const handleUpdate = async (data: any) => {
    return updateEventAction(id, data);
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading event data...</div>;
  if (!eventData) return <div className="text-center py-20 text-red-500">Event not found.</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Edit Event</h2>
        <p className="text-gray-500 text-sm mt-1">Update existing details, date logs, or status for this event.</p>
      </div>

      <EventForm initialData={eventData} onSubmit={handleUpdate} submitLabel="Update Event" />
    </div>
  );
}
```

---

## Completion Checklist
- [ ] Shared Form component saved in [EventForm.tsx](file:///d:/projects/CS-Dashboard/cs-dashboard/src/components/admin/EventForm.tsx).
- [ ] Events listing page created in [/admin/events/page.tsx](file:///d:/projects/CS-Dashboard/cs-dashboard/src/app/admin/events/page.tsx).
- [ ] Create route page set up in [/events/new/page.tsx](file:///d:/projects/CS-Dashboard/cs-dashboard/src/app/admin/events/new/page.tsx).
- [ ] Edit route page set up in [/events/[id]/edit/page.tsx](file:///d:/projects/CS-Dashboard/cs-dashboard/src/app/admin/events/[id]/edit/page.tsx).
- [ ] Deletion action functions successfully, prompting immediate list refresh.
