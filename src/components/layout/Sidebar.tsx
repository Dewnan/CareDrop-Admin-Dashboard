import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  ClipboardList, 
  CreditCard, 
  LifeBuoy, 
  Settings, 
  LogOut, 
  HeartHandshake,
  ChevronLeft,
  ChevronRight,
  User,
  Sliders
} from 'lucide-react';

import { useAuth } from '../../services/AuthContext';
import { AdminProfileModal } from '../common/AdminProfileModal';

import profilePicturePlaceholder from '../../assets/profile_picture_placeholder.jpg';

export type NavTab = 
  | 'dashboard'
  | 'users'
  | 'helpers'
  | 'tasks'
  | 'payments'
  | 'support'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  openTicketsCount?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  openTicketsCount = 41,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { user, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'users', label: 'Users', icon: <Users size={18} /> },
    { id: 'helpers', label: 'Helpers', icon: <UserCheck size={18} /> },
    { id: 'tasks', label: 'Tasks', icon: <ClipboardList size={18} /> },
    { id: 'payments', label: 'Payments', icon: <CreditCard size={18} /> },
    { id: 'support', label: 'Support', icon: <LifeBuoy size={18} />, badge: openTicketsCount },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <aside className={`sidebar-drawer ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Brand Header & Single Transparent Collapse Toggle */}
        <div className="brand-header">
          <div className="brand-logo-box">
            <HeartHandshake className="brand-logo-icon" size={22} />
          </div>
          {!isCollapsed && (
            <div className="brand-title-box">
              <h2 className="brand-title">CareDrop</h2>
              <p className="brand-subtitle">Admin Console</p>
            </div>
          )}
          {onToggleCollapse && (
            <button
              type="button"
              className="sidebar-toggle-transparent"
              onClick={onToggleCollapse}
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="nav-menu">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-menu-item ${isActive ? 'active' : ''}`}
                onClick={() => onTabChange(item.id)}
                title={isCollapsed ? item.label : undefined}
              >
                <span className="nav-item-icon">{item.icon}</span>
                {!isCollapsed && <span className="nav-item-label">{item.label}</span>}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`nav-item-badge ${isActive ? 'active' : ''} ${isCollapsed ? 'collapsed-badge' : ''}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Admin Profile Footer */}
        <div className="sidebar-footer" ref={profileRef}>
          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className={`profile-popover-menu ${isCollapsed ? 'collapsed-popover' : ''}`}>
              <div className="popover-header">
                <p className="popover-name">{user?.name || 'Super Admin'}</p>
                <p className="popover-email">{user?.email || 'admin@caredrop.my'}</p>
              </div>
              <div className="divider-line" />
              <button
                type="button"
                className="popover-item"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  setIsProfileModalOpen(true);
                }}
              >
                <User size={15} />
                <span>Edit Admin Profile</span>
              </button>
              <button
                type="button"
                className="popover-item"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  onTabChange('settings');
                }}
              >
                <Sliders size={15} />
                <span>Platform Parameters</span>
              </button>
              <div className="divider-line" />
              <button
                type="button"
                className="popover-item text-danger"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  logout();
                }}
              >
                <LogOut size={15} />
                <span>Log Out</span>
              </button>
            </div>
          )}

          {/* Interactive Profile Card */}
          <div
            className={`admin-profile-card cursor-pointer ${isCollapsed ? 'just-avatar' : ''}`}
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            title="Click for Profile Settings & Sign Out"
          >
            <div className="admin-avatar">
              <img
                src={user?.avatarUrl || profilePicturePlaceholder}
                alt={user?.name || 'Admin'}
                className="avatar-img-sidebar"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = profilePicturePlaceholder;
                }}
              />
            </div>

            {!isCollapsed && (
              <>
                <div className="admin-info">
                  <p className="admin-name">{user?.name || 'Super Admin'}</p>
                  <p className="admin-email">{user?.email || 'admin@caredrop.my'}</p>
                </div>
                <button
                  type="button"
                  className="logout-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    logout();
                  }}
                  title="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Admin Profile Modal */}
      <AdminProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
};
