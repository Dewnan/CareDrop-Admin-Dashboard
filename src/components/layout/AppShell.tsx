import React, { useState } from 'react';
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
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  return (
    <div className="admin-app-layout">
      {/* Fixed Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={onTabChange}
        openTicketsCount={openTicketsCount}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      {/* Main Content Area */}
      <div className={`admin-main-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <main className="admin-content-view">
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
