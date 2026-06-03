'use client';

import React, { useState } from 'react';
import { NewEventModel, EventModel } from '@/lib/types';
import MediaSelector from '@/components/admin/MediaSelector';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EventFormProps {
  initialData?: EventModel | null;
  onSubmit: (data: Omit<NewEventModel, 'displayOrder'>) => Promise<{ success: boolean; error?: string }>;
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
    tag: initialData?.tag || 'Workshop',
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

        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Event Tag</label>
          <select
            value={formData.tag}
            onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
            className="w-full bg-[#080808] border border-[#222] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#f9ba1f]"
          >
            <option value="Workshop">Workshop</option>
            <option value="Datathon">Datathon</option>
            <option value="Hackathon">Hackathon</option>
            <option value="Designathon">Designathon</option>
            <option value="Competition">Competition</option>
            <option value="Coding">Coding</option>
            <option value="Seminar">Seminar</option>
            <option value="Quiz">Quiz</option>
            <option value="Ideathon">Ideathon</option>
            <option value="Machine Learning">Machine Learning</option>
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
