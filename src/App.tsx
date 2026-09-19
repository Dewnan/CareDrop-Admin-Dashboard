import React, { useState } from 'react';
import { AuthProvider, useAuth } from './services/AuthContext';
import { AppShell } from './components/layout/AppShell';
import { NavTab } from './components/layout/Sidebar';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from './pages/UsersPage';
import { HelpersPage } from './pages/HelpersPage';
import { TasksPage } from './pages/TasksPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { SupportPage } from './pages/SupportPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

import { dataService } from './services/dataService';

// Main Application Controller managing tab routes and session auth state
const AdminAppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab | '404'>('dashboard');

  const metrics = dataService.getMetrics();

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setCurrentTab('dashboard')} />;
  }

  // Render tab views based on active sidebar tab
  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentTab} />;

      case 'users':
        return <UsersPage />;
      case 'helpers':
        return <HelpersPage />;
      case 'tasks':
        return <TasksPage />;
      case 'payments':
        return <PaymentsPage />;
      case 'support':
        return <SupportPage />;
      case 'settings':
        return <SettingsPage />;
      case '404':
        return <NotFoundPage onNavigateHome={setCurrentTab} />;
      default:
        return <NotFoundPage onNavigateHome={setCurrentTab} />;
    }
  };

  return (
    <AppShell
      currentTab={currentTab === '404' ? 'dashboard' : currentTab}
      onTabChange={setCurrentTab}
      openTicketsCount={metrics.unresolvedTicketsCount}
    >
      {renderTabContent()}
    </AppShell>
  );
};


export function App() {
  return (
    <AuthProvider>
      <AdminAppContent />
    </AuthProvider>
  );
}

export default App;
