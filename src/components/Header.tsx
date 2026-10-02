import React from 'react';
import { Menu, ExternalLink } from 'lucide-react';
import type { NavTab } from './Sidebar';

interface HeaderProps {
  currentTab: NavTab;
  onOpenSidebar: () => void;
}

const titles: Record<NavTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Dashboard Overview',
    subtitle: 'High-level metrics and system summary',
  },
  genres: {
    title: 'Genre Management',
    subtitle: 'Create, inspect, and organize top-level portfolio categories',
  },
  folders: {
    title: 'Folder Management',
    subtitle: 'Manage sub-category project folders mapped to genres',
  },
  images: {
    title: 'Image Assets & Upload',
    subtitle: 'Upload single or batch images and manage Cloudflare R2 files',
  },
};

export const Header: React.FC<HeaderProps> = ({ currentTab, onOpenSidebar }) => {
  const current = titles[currentTab];

  return (
    <header className="h-16 bg-surface border-b border-neutral-dark px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="text-neutral hover:text-white md:hidden p-1.5 rounded-md hover:bg-surface-hover cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>
        <div>
          <h2 className="text-base sm:text-lg font-montserrat font-bold text-white tracking-wide">
            {current.title}
          </h2>
          <p className="text-xs text-neutral hidden sm:block">
            {current.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <a
          href="https://ravin-fronend-ox7x.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-light hover:text-white border border-neutral-dark hover:border-neutral rounded-md"
        >
          <span>Live Site</span>
          <ExternalLink size={12} />
        </a>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary/30 border border-tertiary text-emerald-400 text-xs font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Connected</span>
        </div>
      </div>
    </header>
  );
};
