'use client';

import React, { useState, useRef, useEffect } from 'react';
import { GalleryItem } from '@/lib/types';
import { 
  updateGalleryItemsOrderAction, 
  deleteGalleryItemAction, 
  updateGalleryItemAction 
} from '@/lib/actions/gallery';
import Image from 'next/image';
import { GripVertical, Loader2, Trash2, Edit2, Check, X, Eye, EyeOff } from 'lucide-react';
import MediaSelector from '@/components/admin/MediaSelector';

interface DragAndDropGalleryProps {
  initialItems: GalleryItem[];
  onRefresh: () => void;
}

export default function DragAndDropGallery({ initialItems, onRefresh }: DragAndDropGalleryProps) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    caption: '',
    imageUrl: '',
    isActive: true,
  });
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
    Promise.resolve().then(() => {
      setItems(initialItems);
    });
  }, [initialItems]);

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
      onRefresh();
    } else {
      alert(`Error saving order: ${res.error}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gallery item?')) return;
    setUpdatingId(id);
    const res = await deleteGalleryItemAction(id);
    setUpdatingId(null);
    if (res.success) {
      alert('Gallery item deleted!');
      onRefresh();
    } else {
      alert(`Error deleting item: ${res.error}`);
    }
  };

  const handleToggleActive = async (item: GalleryItem) => {
    setUpdatingId(item.id);
    const res = await updateGalleryItemAction(item.id, { isActive: !item.isActive });
    setUpdatingId(null);
    if (res.success) {
      onRefresh();
    } else {
      alert(`Error updating item status: ${res.error}`);
    }
  };

  const startEditing = (item: GalleryItem) => {
    setEditingId(item.id);
    setEditFormData({
      title: item.title,
      caption: item.caption || '',
      imageUrl: item.imageUrl,
      isActive: item.isActive,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setUpdatingId(editingId);
    const res = await updateGalleryItemAction(editingId, editFormData);
    setUpdatingId(null);
    if (res.success) {
      setEditingId(null);
      onRefresh();
    } else {
      alert(`Error updating item: ${res.error}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#0c0c0c] p-4 rounded-xl border border-[#1f1f1f]">
        <p className="text-gray-400 text-xs sm:text-sm">Drag and drop items to set display order on the home page gallery track.</p>
        <button
          onClick={saveOrder}
          disabled={saving || items.length === 0}
          className="bg-[#f9ba1f] hover:bg-[#d69f1a] text-black font-semibold px-5 py-2 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50 transition-colors"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? 'Saving...' : 'Save Layout'}
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-500 border border-dashed border-[#1f1f1f] rounded-xl bg-[#0c0c0c]">
          No gallery items added yet. Add some images using the form below.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item, index) => {
            const isEditing = editingId === item.id;
            const isUpdating = updatingId === item.id;

            return (
              <div
                key={item.id}
                draggable={!isEditing}
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className={`group relative bg-[#0c0c0c] border border-[#1f1f1f] rounded-xl transition-all duration-200 flex flex-col gap-3 p-4 ${
                  isEditing 
                    ? 'border-[#f9ba1f] shadow-[0_0_15px_rgba(249,186,31,0.1)]' 
                    : 'hover:border-[#f9ba1f]/50 cursor-grab active:cursor-grabbing'
                }`}
              >
                {isEditing ? (
                  <form onSubmit={handleSaveEdit} className="space-y-4 flex-1 flex flex-col">
                    <h5 className="text-xs font-semibold text-[#f9ba1f] uppercase tracking-wider">Edit Item Details</h5>
                    
                    <div className="space-y-2">
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500">Title</label>
                      <input
                        required
                        type="text"
                        value={editFormData.title}
                        onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                        className="w-full bg-[#080808] border border-[#222] rounded px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-[#f9ba1f]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500">Caption</label>
                      <textarea
                        rows={2}
                        value={editFormData.caption}
                        onChange={(e) => setEditFormData({ ...editFormData, caption: e.target.value })}
                        className="w-full bg-[#080808] border border-[#222] rounded px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-[#f9ba1f] resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <MediaSelector
                        label="Image"
                        value={editFormData.imageUrl}
                        onChange={(url) => setEditFormData({ ...editFormData, imageUrl: url })}
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id={`edit-active-${item.id}`}
                        checked={editFormData.isActive}
                        onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                        className="rounded border-gray-700 bg-black text-[#f9ba1f] focus:ring-[#f9ba1f]"
                      />
                      <label htmlFor={`edit-active-${item.id}`} className="text-xs text-gray-400 select-none">Active on Live Website</label>
                    </div>

                    <div className="mt-auto flex justify-end gap-2 pt-4 border-t border-[#1f1f1f]">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="p-1.5 text-gray-400 hover:text-white rounded border border-[#222] hover:bg-[#141414]"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="p-1.5 bg-[#f9ba1f] text-black font-semibold rounded hover:bg-[#d69f1a] disabled:opacity-50"
                        title="Save Changes"
                      >
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black border border-[#1f1f1f]">
                      <Image src={item.imageUrl} alt={item.title} fill className="object-cover animate-fadeIn" />
                      <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 rounded text-xs text-[#f9ba1f] font-mono border border-[#1f1f1f]">
                        #{index + 1}
                      </div>
                      <div className="absolute top-2 right-2 bg-black/80 p-1.5 rounded text-gray-400 hover:text-white border border-[#1f1f1f] opacity-80 group-hover:opacity-100 transition-opacity">
                        <GripVertical className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white truncate text-sm">{item.title}</h4>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{item.caption || 'No caption provided'}</p>
                    </div>
                    <div className="mt-auto flex justify-between items-center pt-2.5 border-t border-[#1f1f1f] text-xs">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(item)}
                        disabled={isUpdating}
                        className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium transition-all ${
                          item.isActive 
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 hover:bg-emerald-900/80' 
                            : 'bg-red-950/80 text-red-400 border border-red-800/40 hover:bg-red-900/80'
                        }`}
                        title="Click to toggle status"
                      >
                        {item.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {item.isActive ? 'Active' : 'Inactive'}
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEditing(item)}
                          className="text-gray-400 hover:text-white transition-colors"
                          title="Edit Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          disabled={isUpdating}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Delete Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
