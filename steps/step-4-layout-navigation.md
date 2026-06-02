# Step 4: Layout Shell & Navigation Sidebar

> [!IMPORTANT]
> Before writing any code, check the [AGENTS.md](file:///d:/projects/CS-Dashboard/cs-dashboard/AGENTS.md) file for critical instructions regarding this project's custom Next.js conventions, APIs, and file structure rules.

This step implements the admin interface layout framework, including the collapsible dashboard header and the sidebar navigation widgets.

Create folders:
- `src/components/admin`
- `src/app/admin`

## 1. Implement Admin Navigation Sidebar

### File: [Sidebar.tsx](file:///d:/projects/CS-Dashboard/cs-dashboard/src/components/admin/Sidebar.tsx)

```tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Image as ImageIcon, Sliders, Calendar, FolderOpen } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Hero settings', href: '/admin/homepage/hero', icon: Sliders },
    { label: 'Hero overlay', href: '/admin/homepage/hero-images', icon: FileText },
    { label: 'Horizontal gallery', href: '/admin/homepage/gallery', icon: ImageIcon },
    { label: 'Events manager', href: '/admin/events', icon: Calendar },
    { label: 'Media library', href: '/admin/media', icon: FolderOpen },
  ];

  return (
    <aside className="w-64 bg-[#0c0c0c] border-r border-[#1f1f1f] flex flex-col z-20">
      <div className="h-16 flex items-center px-6 border-b border-[#1f1f1f]">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-[#f9ba1f] flex items-center justify-center font-bold text-black text-xs">
            CS
          </div>
          <span className="font-semibold text-white tracking-wide text-sm font-sans uppercase">IEEE CS Admin</span>
        </Link>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1.5 bg-[#090909]">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#f9ba1f]/10 text-[#f9ba1f] border-l-2 border-[#f9ba1f]'
                  : 'text-gray-400 hover:bg-[#141414] hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-[#1f1f1f] bg-[#0c0c0c] text-[10px] text-gray-600 text-center font-mono">
        v1.0.0
      </div>
    </aside>
  );
}
```

## 2. Implement Dashboard Wrapper Layout

### File: [layout.tsx](file:///d:/projects/CS-Dashboard/cs-dashboard/src/app/admin/layout.tsx)

```tsx
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
```

---

## Completion Checklist
- [x] Sidebar component saved in [Sidebar.tsx](file:///d:/projects/CS-Dashboard/cs-dashboard/src/components/admin/Sidebar.tsx).
- [x] Admin wrapper layout configured in [layout.tsx](file:///d:/projects/CS-Dashboard/cs-dashboard/src/app/admin/layout.tsx).
- [x] Imports verify and compile without issues.
