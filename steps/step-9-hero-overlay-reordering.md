# Step 9: Hero Overlay Images Reordering Page

> [!IMPORTANT]
> Before writing any code, check the [AGENTS.md](file:///d:/projects/CS-Dashboard/cs-dashboard/AGENTS.md) file for critical instructions regarding this project's custom Next.js conventions, APIs, and file structure rules.

This step implements the manager page for Hero Section overlay images, including the Drag and Drop reordering component and the add/remove actions.

Create folder:
- `src/app/admin/homepage/hero-images`

## 1. Create Drag and Drop Component for Hero Overlay Images

### File: [DragAndDropHeroImages.tsx](file:///d:/projects/CS-Dashboard/cs-dashboard/src/components/admin/DragAndDropHeroImages.tsx)

```tsx
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
    setImages(initialImages);
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
```

## 2. Create the Hero Overlay Images Dashboard Page

### File: [page.tsx](file:///d:/projects/CS-Dashboard/cs-dashboard/src/app/admin/homepage/hero-images/page.tsx)

```tsx
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

  const loadImages = async () => {
    const data = await getHeroDataAction();
    if (data) {
      setOverlayImages(data.overlayImages || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadImages();
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
```

---

## Completion Checklist
- [ ] Component file created at [DragAndDropHeroImages.tsx](file:///d:/projects/CS-Dashboard/cs-dashboard/src/components/admin/DragAndDropHeroImages.tsx).
- [ ] Overlay images manager page created at [page.tsx](file:///d:/projects/CS-Dashboard/cs-dashboard/src/app/admin/homepage/hero-images/page.tsx).
- [ ] Adding new overlay images registers in database and updates list instantly.
- [ ] Drag-and-drop actions update values properly and trigger revalidation call.
