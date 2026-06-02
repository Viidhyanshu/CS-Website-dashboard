'use client';

import React, { useState, useEffect } from 'react';
import { getHeroDataAction, addHeroOverlayImageAction } from '@/lib/actions/hero';
import { HeroImage } from '@/lib/types';
import DragAndDropHeroImages from '@/components/admin/DragAndDropHeroImages';
import MediaSelector from '@/components/admin/MediaSelector';
import { Plus, Loader2 } from 'lucide-react';

export default function HeroImagesPage() {
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [overlayImages, setOverlayImages] = useState<HeroImage[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  const loadImages = () => {
    getHeroDataAction().then(data => {
      if (data) {
        setOverlayImages(data.overlayImages || []);
      }
    });
  };

  useEffect(() => {
    getHeroDataAction().then(data => {
      if (data) {
        setOverlayImages(data.overlayImages || []);
      }
      setLoading(false);
    });
  }, []);

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl) return;

    setAdding(true);
    const res = await addHeroOverlayImageAction(newImageUrl);
    setAdding(false);

    if (res.success) {
      alert('Overlay image added successfully!');
      setNewImageUrl('');
      loadImages();
    } else {
      alert(`Error adding overlay image: ${res.error}`);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading overlay images...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Hero Overlay Images</h2>
        <p className="text-gray-500 text-sm mt-1">Manage the overlay images stack displayed on top of the hero section.</p>
      </div>

      <div className="space-y-8">
        {/* Reordering Component */}
        <DragAndDropHeroImages initialImages={overlayImages} onRefresh={loadImages} />

        {/* Add Image Form */}
        <form onSubmit={handleAddImage} className="bg-[#0c0c0c] border border-[#1f1f1f] rounded-xl p-8 space-y-6">
          <h3 className="font-semibold text-white text-base">Add Overlay Image</h3>
          <p className="text-xs text-gray-500 mt-1">Select an image from the media library to add it to the overlay stack.</p>
          
          <div className="pt-4 border-t border-[#1f1f1f]">
            <MediaSelector
              label="Select Image"
              value={newImageUrl}
              onChange={(url) => setNewImageUrl(url)}
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-[#1f1f1f]">
            <button
              type="submit"
              disabled={adding || !newImageUrl}
              className="bg-[#f9ba1f] hover:bg-[#d69f1a] text-black font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {adding ? 'Adding...' : 'Add Image'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
