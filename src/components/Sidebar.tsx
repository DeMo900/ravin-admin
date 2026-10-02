import React from 'react';
import {
  LayoutDashboard,
  FolderTree,
  FolderOpen,
  Image as ImageIcon,
  LogOut,
  X,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export type NavTab = 'dashboard' | 'genres' | 'folders' | 'images';

interface SidebarProps {
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isOpen,
  onClose,
}) => {
  const { user, logout } = useAuthStore();

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'genres' as NavTab,
      label: 'Genres',
      icon: FolderTree,
    },
    {
      id: 'folders' as NavTab,
      label: 'Folders',
      icon: FolderOpen,
    },
    {
      id: 'images' as NavTab,
      label: 'Images & Upload',
      icon: ImageIcon,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/70 z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-surface border-r border-neutral-dark flex flex-col justify-between md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-dark">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary" />
              <h1 className="font-montserrat font-bold text-xl text-white tracking-wider">
                RAVIN <span className="text-xs font-normal text-neutral uppercase">Admin</span>
              </h1>
            </div>
            <button
              onClick={onClose}
              className="text-neutral hover:text-white md:hidden p-1 cursor-pointer"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium cursor-pointer text-left ${
                    isActive
                      ? 'bg-primary text-white font-semibold'
                      : 'text-neutral-light hover:bg-surface-hover hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-neutral-dark">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-neutral font-medium uppercase tracking-wider">
              Signed in as
            </p>
            <p className="text-sm text-white font-montserrat font-semibold truncate">
              {user?.username || 'Administrator'}
            </p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md cursor-pointer text-left"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
