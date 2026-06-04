'use client';

import React, { useState, useEffect } from 'react';
import { getAdminTeamMembersAction, createTeamMemberAction } from '@/lib/actions/team';
import { TeamMember } from '@/lib/types';
import DragAndDropTeam from '@/components/admin/DragAndDropTeam';
import MediaSelector from '@/components/admin/MediaSelector';
import { Plus, Loader2 } from 'lucide-react';

const GROUP_OPTIONS = [
  { value: 'ec', label: 'Executive Committee' },
  { value: 'core', label: 'Core Team' },
  { value: 'web', label: 'Web Team' },
];

export default function TeamPage() {
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    imageUrl: '',
    group: 'core',
    linkedinUrl: '',
    instagramUrl: '',
    githubUrl: '',
    isActive: true,
  });

  const loadMembers = () => {
    getAdminTeamMembersAction().then(data => setMembers(data || []));
  };

  useEffect(() => {
    getAdminTeamMembersAction().then(data => {
      setMembers(data || []);
      setLoading(false);
    });
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl || !formData.name || !formData.role) return;

    setAdding(true);
    const res = await createTeamMemberAction({
      name: formData.name,
      role: formData.role,
      imageUrl: formData.imageUrl,
      group: formData.group,
      linkedinUrl: formData.linkedinUrl || null,
      instagramUrl: formData.instagramUrl || null,
      githubUrl: formData.githubUrl || null,
      isActive: formData.isActive,
    });
    setAdding(false);

    if (res.success) {
      alert('Team member added!');
      setFormData({ name: '', role: '', imageUrl: '', group: 'core', linkedinUrl: '', instagramUrl: '', githubUrl: '', isActive: true });
      loadMembers();
    } else {
      alert(`Error: ${res.error}`);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-500 font-mono">Loading team members...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Team Manager</h2>
        <p className="text-gray-500 text-sm mt-1">Manage team members displayed on the website. Drag cards to reorder.</p>
      </div>

      <div className="space-y-8 animate-fadeIn">
        {/* Drag & Drop Grid */}
        <DragAndDropTeam initialItems={members} onRefresh={loadMembers} />

        {/* Add Member Form */}
        <form onSubmit={handleAddMember} className="bg-[#0c0c0c] border border-[#1f1f1f] rounded-xl p-8 space-y-6">
          <div>
            <h3 className="font-semibold text-white text-base">Add Team Member</h3>
            <p className="text-xs text-gray-500 mt-1">Fill in the member details and pick a photo to add them to the team.</p>
          </div>

          <div className="pt-4 border-t border-[#1f1f1f] space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Full Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="E.g., Samaksh Gupta"
                  className="w-full bg-[#080808] border border-[#222] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#f9ba1f]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Role / Position</label>
                <input
                  required
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="E.g., Chairperson"
                  className="w-full bg-[#080808] border border-[#222] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#f9ba1f]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Group</label>
                <select
                  value={formData.group}
                  onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                  className="w-full bg-[#080808] border border-[#222] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#f9ba1f]"
                >
                  {GROUP_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">LinkedIn URL</label>
                <input
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full bg-[#080808] border border-[#222] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#f9ba1f]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Instagram URL</label>
                <input
                  type="url"
                  value={formData.instagramUrl}
                  onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                  placeholder="https://instagram.com/..."
                  className="w-full bg-[#080808] border border-[#222] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#f9ba1f]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">GitHub URL</label>
                <input
                  type="url"
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  placeholder="https://github.com/..."
                  className="w-full bg-[#080808] border border-[#222] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#f9ba1f]"
                />
              </div>
            </div>

            <MediaSelector
              label="Select Photo"
              value={formData.imageUrl}
              onChange={(url) => setFormData({ ...formData, imageUrl: url })}
            />

            <div className="flex items-center gap-2">
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
              disabled={adding || !formData.imageUrl || !formData.name || !formData.role}
              className="bg-[#f9ba1f] hover:bg-[#d69f1a] text-black font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {adding ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
