import React from 'react';
import Sidebar from '@/components/admin/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#080808] text-gray-200 flex font-sans">
      {/* Sidebar navigation */}
      <Sidebar />
      
      {/* Main viewport */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <header className="h-16 border-b border-[#1f1f1f] bg-[#0c0c0c] flex items-center justify-between px-8">
          <div>
            <h1 className="text-xs text-gray-500 uppercase tracking-widest font-mono">Decoupled Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-emerald-500 bg-emerald-950/30 border border-emerald-900/40 px-2.5 py-1 rounded-full font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Live Sync
            </span>
          </div>
        </header>
        <main className="p-8 max-w-7xl w-full mx-auto flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
