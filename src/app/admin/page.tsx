import React from 'react';
import sql from '@/lib/db';
import { Calendar, Image as ImageIcon, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardOverview() {
  const [{ count: galleryCount }] = await sql`SELECT COUNT(*)::int AS count FROM homepage_gallery_items`;
  const [{ count: eventsCount }] = await sql`SELECT COUNT(*)::int AS count FROM events`;
  const [heroData] = await sql`SELECT heading FROM homepage_hero LIMIT 1`;

  const cards = [
    { label: 'Gallery items', count: galleryCount, href: '/admin/homepage/gallery', icon: ImageIcon, desc: 'Horizontal slider images' },
    { label: 'Club events', count: eventsCount, href: '/admin/events', icon: Calendar, desc: 'Event posters & settings' },
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
