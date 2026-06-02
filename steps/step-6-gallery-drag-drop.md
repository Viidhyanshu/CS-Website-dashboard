# Step 6: Drag-and-Drop Gallery Component

> [!IMPORTANT]
> Before writing any code, check the [AGENTS.md](file:///d:/projects/CS-Dashboard/cs-dashboard/AGENTS.md) file for critical instructions regarding this project's custom Next.js conventions, APIs, and file structure rules.

This step builds the `DragAndDropGallery` component, featuring HTML5 drag-and-drop mechanics to reorder items inside the home page gallery track and save the layout.

## 1. Create Drag and Drop Gallery Component

### File: [DragAndDropGallery.tsx](file:///d:/projects/CS-Dashboard/cs-dashboard/src/components/admin/DragAndDropGallery.tsx)

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

## Completion Checklist
- [x] DragAndDropGallery component saved in [DragAndDropGallery.tsx](file:///d:/projects/CS-Dashboard/cs-dashboard/src/components/admin/DragAndDropGallery.tsx).
- [x] Ordering backend server action imported.
- [x] HTML5 Drag and Drop events function as expected.
