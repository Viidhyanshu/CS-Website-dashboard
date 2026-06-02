# Step 8: Hero Text Settings Editor Page

> [!IMPORTANT]
> Before writing any code, check the [AGENTS.md](file:///d:/projects/CS-Dashboard/cs-dashboard/AGENTS.md) file for critical instructions regarding this project's custom Next.js conventions, APIs, and file structure rules.

This step implements the editor page for homepage hero settings, allowing headings, descriptions, call-to-actions, and background image updates.

Create folders:
- `src/app/admin/homepage/hero`

## 1. Create Hero Settings Page

### File: [page.tsx](file:///d:/projects/CS-Dashboard/cs-dashboard/src/app/admin/homepage/hero/page.tsx)

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
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Heading (supports \\n newlines)</label>
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

---

## Completion Checklist
- [x] Page code created at [page.tsx](file:///d:/projects/CS-Dashboard/cs-dashboard/src/app/admin/homepage/hero/page.tsx).
- [x] Verification that it integrates the custom `MediaSelector` component.
- [x] Save updates commit successfully to database and trigger revalidation.
