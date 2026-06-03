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
            No events found. Click &quot;Add Event&quot; to create one.
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
