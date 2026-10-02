import React, { useState } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { Sidebar, type NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { GenresView } from './views/GenresView';
import { FoldersView } from './views/FoldersView';
import { ImagesView } from './views/ImagesView';

export function App() {
  const { isAuthenticated } = useAuthStore();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // If not logged in, render the login page
  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-secondary text-white font-sans flex">
      {/* Responsive Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        <Header
          currentTab={currentTab}
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView onNavigate={(tab) => setCurrentTab(tab)} />
          )}
          {currentTab === 'genres' && <GenresView />}
          {currentTab === 'folders' && <FoldersView />}
          {currentTab === 'images' && <ImagesView />}
        </main>

        <footer className="py-4 px-6 border-t border-neutral-dark text-xs text-neutral text-center bg-surface">
          Ravin CMS Admin Panel &bull; Cloudflare D1 &amp; R2 Architecture
        </footer>
      </div>
    </div>
  );
}

export default App;
