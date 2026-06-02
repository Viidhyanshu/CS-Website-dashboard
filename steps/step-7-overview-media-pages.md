# Step 7: Dashboard Overview & Media Library Page

> [!IMPORTANT]
> Before writing any code, check the [AGENTS.md](file:///d:/projects/CS-Dashboard/cs-dashboard/AGENTS.md) file for critical instructions regarding this project's custom Next.js conventions, APIs, and file structure rules.

This step implements the home stats panel page for the dashboard overview and the Media Library file browser.

## 1. Create Dashboard Overview Page

### File: [page.tsx](file:///d:/projects/CS-Dashboard/cs-dashboard/src/app/admin/page.tsx)

Displays quick statistics about database content (Gallery Items, Event Count, Hero Status) and links to direct managers.

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
            <span className="text-emerald-400 font-mono bg-emerald-950/20 border border-emerald-900/30 px-2.5 py-0.5 rounded">Configured ({heroData.heading.substring(0, 15)}...)</span>
          ) : (
            <span className="text-amber-400 font-mono bg-amber-950/20 border border-amber-900/30 px-2.5 py-0.5 rounded">Not Configured</span>
          )}
        </div>
      </div>
    </div>
  );
}
```

## 2. Create Media Library Page

### File: [page.tsx](file:///d:/projects/CS-Dashboard/cs-dashboard/src/app/admin/media/page.tsx)

Connects directly to Cloudflare R2 via server actions to allow browser-based media uploads, copies public links to clipboard, and triggers asset deletions.

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

## Completion Checklist
- [ ] Overview page saved in [page.tsx](file:///d:/projects/CS-Dashboard/cs-dashboard/src/app/admin/page.tsx).
- [ ] Media Library page saved in [page.tsx](file:///d:/projects/CS-Dashboard/cs-dashboard/src/app/admin/media/page.tsx).
- [ ] Statistics display updates based on Supabase database counts.
- [ ] Media uploader files display list from Cloudflare R2 bucket.
