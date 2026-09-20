import React, { useState } from 'react';
import { Menu, HeartHandshake } from 'lucide-react';
import { Sidebar, NavTab } from './Sidebar';
import { AdminProfileModal } from '../common/AdminProfileModal';

interface AppShellProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  children: React.ReactNode;
  openTicketsCount?: number;
}

// Master Admin Dashboard Shell wrapper unifying sidebar, topbar, and main panel
export const AppShell: React.FC<AppShellProps> = ({
  currentTab,
  onTabChange,
  children,
  openTicketsCount,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const handleTabSelect = (tab: NavTab) => {
    onTabChange(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="admin-app-layout flex flex-col lg:flex-row min-h-screen w-full bg-slate-50">
      {/* Mobile Top Navigation Bar */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 focus:outline-none transition-colors"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <HeartHandshake size={18} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-white leading-none">CareDrop</span>
              <span className="text-[10px] text-slate-400 font-medium">Admin Console</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Sidebar Drawer */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={handleTabSelect}
        openTicketsCount={openTicketsCount}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Viewport Container */}
      <div className={`admin-main-container flex-1 transition-all duration-200 ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <main className="admin-content-view p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Admin Profile Modal */}
      <AdminProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};

