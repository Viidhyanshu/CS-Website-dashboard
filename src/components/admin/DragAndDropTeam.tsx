'use client';

import React, { useState, useRef, useEffect } from 'react';
import { TeamMember } from '@/lib/types';
import {
  updateTeamMembersOrderAction,
  deleteTeamMemberAction,
  updateTeamMemberAction,
} from '@/lib/actions/team';
import Image from 'next/image';
import { GripVertical, Loader2, Trash2, Edit2, Check, X, Eye, EyeOff, Link2, AtSign, Code2 } from 'lucide-react';
import MediaSelector from '@/components/admin/MediaSelector';

const GROUP_OPTIONS = [
  { value: 'ec', label: 'Executive Committee' },
  { value: 'core', label: 'Core Team' },
  { value: 'web', label: 'Web Team' },
];

const GROUP_BADGE: Record<string, string> = {
  ec: 'bg-[#f9ba1f]/10 text-[#f9ba1f] border-[#f9ba1f]/30',
  core: 'bg-blue-950/60 text-blue-300 border-blue-800/40',
  web: 'bg-purple-950/60 text-purple-300 border-purple-800/40',
};

const GROUP_LABEL: Record<string, string> = {
  ec: 'EC',
  core: 'Core',
  web: 'Web',
};

interface DragAndDropTeamProps {
  initialItems: TeamMember[];
  onRefresh: () => void;
}

export default function DragAndDropTeam({ initialItems, onRefresh }: DragAndDropTeamProps) {
  const [items, setItems] = useState<TeamMember[]>(initialItems);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    role: '',
    imageUrl: '',
    group: 'core',
    linkedinUrl: '',
    instagramUrl: '',
    githubUrl: '',
    isActive: true,
  });
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
    Promise.resolve().then(() => setItems(initialItems));
  }, [initialItems]);

  const handleDragStart = (index: number) => { dragItem.current = index; };
  const handleDragEnter = (index: number) => { dragOverItem.current = index; };
  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const copy = [...items];
      const dragged = copy[dragItem.current];
      copy.splice(dragItem.current, 1);
      copy.splice(dragOverItem.current, 0, dragged);
      setItems(copy);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const saveOrder = async () => {
    setSaving(true);
    const ids = items.map(i => i.id);
    const res = await updateTeamMembersOrderAction(ids);
    setSaving(false);
    if (res.success) {
      alert('Team order saved successfully!');
      onRefresh();
    } else {
      alert(`Error saving order: ${res.error}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this team member?')) return;
    setUpdatingId(id);
    const res = await deleteTeamMemberAction(id);
    setUpdatingId(null);
    if (res.success) {
      onRefresh();
    } else {
      alert(`Error deleting member: ${res.error}`);
    }
  };

  const handleToggleActive = async (item: TeamMember) => {
    setUpdatingId(item.id);
    const res = await updateTeamMemberAction(item.id, { isActive: !item.isActive });
    setUpdatingId(null);
    if (res.success) {
      onRefresh();
    } else {
      alert(`Error toggling status: ${res.error}`);
    }
  };

  const startEditing = (item: TeamMember) => {
    setEditingId(item.id);
    setEditFormData({
      name: item.name,
      role: item.role,
      imageUrl: item.imageUrl,
      group: item.group,
      linkedinUrl: item.linkedinUrl || '',
      instagramUrl: item.instagramUrl || '',
      githubUrl: item.githubUrl || '',
      isActive: item.isActive,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setUpdatingId(editingId);
    const res = await updateTeamMemberAction(editingId, {
      ...editFormData,
      linkedinUrl: editFormData.linkedinUrl || null,
      instagramUrl: editFormData.instagramUrl || null,
      githubUrl: editFormData.githubUrl || null,
    });
    setUpdatingId(null);
    if (res.success) {
      setEditingId(null);
      onRefresh();
    } else {
      alert(`Error updating member: ${res.error}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#0c0c0c] p-4 rounded-xl border border-[#1f1f1f]">
        <p className="text-gray-400 text-xs sm:text-sm">Drag and drop members to set their display order on the website.</p>
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
          No team members added yet. Use the form below to add members.
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
                  <form onSubmit={handleSaveEdit} className="space-y-3 flex-1 flex flex-col">
                    <h5 className="text-xs font-semibold text-[#f9ba1f] uppercase tracking-wider">Edit Member</h5>

                    <MediaSelector label="Photo" value={editFormData.imageUrl} onChange={(url) => setEditFormData({ ...editFormData, imageUrl: url })} />

                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { label: 'Name', key: 'name' as const, required: true },
                        { label: 'Role', key: 'role' as const, required: true },
                      ].map(({ label, key, required }) => (
                        <div key={key} className="space-y-1">
                          <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500">{label}</label>
                          <input
                            required={required}
                            type="text"
                            value={editFormData[key]}
                            onChange={(e) => setEditFormData({ ...editFormData, [key]: e.target.value })}
                            className="w-full bg-[#080808] border border-[#222] rounded px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-[#f9ba1f]"
                          />
                        </div>
                      ))}

                      <div className="space-y-1">
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500">Group</label>
                        <select
                          value={editFormData.group}
                          onChange={(e) => setEditFormData({ ...editFormData, group: e.target.value })}
                          className="w-full bg-[#080808] border border-[#222] rounded px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-[#f9ba1f]"
                        >
                          {GROUP_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>

                      {[
                        { label: 'LinkedIn URL', key: 'linkedinUrl' as const },
                        { label: 'Instagram URL', key: 'instagramUrl' as const },
                        { label: 'GitHub URL', key: 'githubUrl' as const },
                      ].map(({ label, key }) => (
                        <div key={key} className="space-y-1">
                          <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500">{label}</label>
                          <input
                            type="url"
                            value={editFormData[key]}
                            onChange={(e) => setEditFormData({ ...editFormData, [key]: e.target.value })}
                            placeholder="https://..."
                            className="w-full bg-[#080808] border border-[#222] rounded px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-[#f9ba1f]"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id={`edit-active-${item.id}`}
                        checked={editFormData.isActive}
                        onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                        className="rounded border-gray-700 bg-black text-[#f9ba1f] focus:ring-[#f9ba1f]"
                      />
                      <label htmlFor={`edit-active-${item.id}`} className="text-xs text-gray-400 select-none">Active on Live Website</label>
                    </div>

                    <div className="mt-auto flex justify-end gap-2 pt-3 border-t border-[#1f1f1f]">
                      <button type="button" onClick={() => setEditingId(null)} className="p-1.5 text-gray-400 hover:text-white rounded border border-[#222] hover:bg-[#141414]" title="Cancel">
                        <X className="w-4 h-4" />
                      </button>
                      <button type="submit" disabled={isUpdating} className="p-1.5 bg-[#f9ba1f] text-black font-semibold rounded hover:bg-[#d69f1a] disabled:opacity-50" title="Save">
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    {/* Photo */}
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-black border border-[#1f1f1f]">
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover object-top" />
                      <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 rounded text-xs text-[#f9ba1f] font-mono border border-[#1f1f1f]">
                        #{index + 1}
                      </div>
                      <div className="absolute top-2 right-2 bg-black/80 p-1.5 rounded text-gray-400 hover:text-white border border-[#1f1f1f] opacity-80 group-hover:opacity-100 transition-opacity">
                        <GripVertical className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Info */}
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-semibold text-white text-sm truncate">{item.name}</h4>
                        <span className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${GROUP_BADGE[item.group] || GROUP_BADGE.core}`}>
                          {GROUP_LABEL[item.group] || item.group}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{item.role}</p>
                      {/* Social Links */}
                      <div className="flex items-center gap-2 mt-1.5">
                        {item.linkedinUrl && <a href={item.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-400 transition-colors" title="LinkedIn"><Link2 className="w-3 h-3" /></a>}
                        {item.instagramUrl && <a href={item.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-pink-400 transition-colors" title="Instagram"><AtSign className="w-3 h-3" /></a>}
                        {item.githubUrl && <a href={item.githubUrl} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-white transition-colors" title="GitHub"><Code2 className="w-3 h-3" /></a>}
                      </div>
                    </div>

                    {/* Actions */}
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
                      >
                        {item.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {item.isActive ? 'Active' : 'Inactive'}
                      </button>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => startEditing(item)} className="text-gray-400 hover:text-white transition-colors" title="Edit">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => handleDelete(item.id)} disabled={isUpdating} className="text-red-400 hover:text-red-300 transition-colors" title="Delete">
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
