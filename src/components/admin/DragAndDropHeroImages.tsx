'use client';

import React, { useState, useRef } from 'react';
import { HeroImage } from '@/lib/types';
import { updateHeroImagesOrderAction, removeHeroOverlayImageAction } from '@/lib/actions/hero';
import Image from 'next/image';
import { GripVertical, Loader2, Trash2 } from 'lucide-react';

interface DragAndDropHeroImagesProps {
  initialImages: HeroImage[];
  onRefresh: () => void;
}

export default function DragAndDropHeroImages({ initialImages, onRefresh }: DragAndDropHeroImagesProps) {
  const [images, setImages] = useState<HeroImage[]>(initialImages);
  const [saving, setSaving] = useState(false);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  React.useEffect(() => {
    Promise.resolve().then(() => {
      setImages(initialImages);
    });
  }, [initialImages]);

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const copyListItems = [...images];
      const dragged = copyListItems[dragItem.current];
      copyListItems.splice(dragItem.current, 1);
      copyListItems.splice(dragOverItem.current, 0, dragged);
      setImages(copyListItems);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const saveOrder = async () => {
    setSaving(true);
    const ids = images.map(img => img.id);
    const res = await updateHeroImagesOrderAction(ids);
    setSaving(false);
    if (res.success) {
      alert('Overlay images ordering saved successfully!');
      onRefresh();
    } else {
      alert(`Error saving order: ${res.error}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this overlay image?')) return;
    const res = await removeHeroOverlayImageAction(id);
    if (res.success) {
      alert('Overlay image removed!');
      onRefresh();
    } else {
      alert(`Error deleting: ${res.error}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#0c0c0c] p-4 rounded-xl border border-[#1f1f1f]">
        <p className="text-gray-400 text-xs sm:text-sm">Drag and drop images to set display order for the overlay stack.</p>
        <button
          onClick={saveOrder}
          disabled={saving || images.length === 0}
          className="bg-[#f9ba1f] hover:bg-[#d69f1a] text-black font-semibold px-5 py-2 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50 transition-colors"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? 'Saving...' : 'Save Order'}
        </button>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-20 text-gray-500 border border-dashed border-[#1f1f1f] rounded-xl bg-[#0c0c0c]">
          No overlay images added yet. Add some images using the form below.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className="group relative cursor-grab active:cursor-grabbing bg-[#0c0c0c] border border-[#1f1f1f] hover:border-[#f9ba1f]/50 p-4 rounded-xl transition-all duration-200 flex flex-col gap-3"
            >
              <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black border border-[#1f1f1f]">
                <Image src={image.imageUrl} alt={`Overlay Image ${index + 1}`} fill className="object-cover" />
                <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 rounded text-xs text-[#f9ba1f] font-mono border border-[#1f1f1f]">
                  #{index + 1}
                </div>
                <div className="absolute top-2 right-2 bg-black/80 p-1.5 rounded text-gray-400 hover:text-white border border-[#1f1f1f]">
                  <GripVertical className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-auto flex justify-end items-center pt-2.5 border-t border-[#1f1f1f] text-xs">
                <button
                  type="button"
                  onClick={() => handleDelete(image.id)}
                  className="text-red-400 hover:text-red-300 flex items-center gap-1 font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
