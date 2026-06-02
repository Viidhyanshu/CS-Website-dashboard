'use client';

import React, { useState, useEffect } from 'react';
import { getAdminGalleryItemsAction, createGalleryItemAction } from '@/lib/actions/gallery';
import { GalleryItem } from '@/lib/types';
import DragAndDropGallery from '@/components/admin/DragAndDropGallery';
import MediaSelector from '@/components/admin/MediaSelector';
import { Plus, Loader2 } from 'lucide-react';

export default function GalleryPage() {
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    caption: '',
    imageUrl: '',
    isActive: true,
  });

  const loadItems = () => {
    getAdminGalleryItemsAction().then(data => {
      setItems(data || []);
    });
  };

  useEffect(() => {
    getAdminGalleryItemsAction().then(data => {
      setItems(data || []);
      setLoading(false);
    });
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl || !formData.title) return;

    setAdding(true);
    const res = await createGalleryItemAction({
      title: formData.title,
      caption: formData.caption || null,
      imageUrl: formData.imageUrl,
      isActive: formData.isActive,
    });
    setAdding(false);

    if (res.success) {
      alert('Gallery item added successfully!');
      setFormData({
        title: '',
        caption: '',
        imageUrl: '',
        isActive: true,
      });
      loadItems();
    } else {
      alert(`Error adding gallery item: ${res.error}`);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-500 font-mono">Loading gallery items...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Horizontal Gallery</h2>
        <p className="text-gray-500 text-sm mt-1">Manage the image items displayed inside the sliding gallery track of the website.</p>
      </div>

      <div className="space-y-8 animate-fadeIn">
        {/* Reordering and List Component */}
        <DragAndDropGallery initialItems={items} onRefresh={loadItems} />

        {/* Add Item Form */}
        <form onSubmit={handleAddItem} className="bg-[#0c0c0c] border border-[#1f1f1f] rounded-xl p-8 space-y-6">
          <h3 className="font-semibold text-white text-base">Add Gallery Item</h3>
          <p className="text-xs text-gray-500 mt-1">Fill out the details and choose an image to append a new item to the gallery.</p>
          
          <div className="pt-4 border-t border-[#1f1f1f] space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Title</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="E.g., CSS Seminar 2026"
                  className="w-full bg-[#080808] border border-[#222] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#f9ba1f]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Caption</label>
                <input
                  type="text"
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  placeholder="E.g., Overview of modern agentic web development models."
                  className="w-full bg-[#080808] border border-[#222] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#f9ba1f]"
                />
              </div>
            </div>

            <MediaSelector
              label="Select Image"
              value={formData.imageUrl}
              onChange={(url) => setFormData({ ...formData, imageUrl: url })}
            />

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="add-active"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-700 bg-black text-[#f9ba1f] focus:ring-[#f9ba1f]"
              />
              <label htmlFor="add-active" className="text-xs text-gray-400 select-none">Active on Live Website</label>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#1f1f1f]">
            <button
              type="submit"
              disabled={adding || !formData.imageUrl || !formData.title}
              className="bg-[#f9ba1f] hover:bg-[#d69f1a] text-black font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {adding ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
