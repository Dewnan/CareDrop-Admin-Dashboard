import React, { useState } from 'react';
import { UserTable } from '../components/users/UserTable';
import { UserDetailView } from '../components/users/UserDetailView';
import { dataService } from '../services/dataService';
import { useLiveData } from '../hooks/useLiveData';
import { User } from '../types';

export const UsersPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { users, isLoaded } = useLiveData();

  const handleToggleStatus = (userId: string) => {
    dataService.toggleUserStatus(userId);
  };

  if (selectedUser) {
    const updatedUser = users.find((u) => u.id === selectedUser.id) || selectedUser;
    return (
      <UserDetailView
        user={updatedUser}
        onBack={() => setSelectedUser(null)}
        onToggleStatus={handleToggleStatus}
      />
    );
  }

  return (
    <div className="page-container">
      {/* Page Title Header */}
      <div className="page-title-header">
        <div>
          <h1 className="page-heading">User Management</h1>
          <p className="page-subheading">Manage patient and guardian accounts</p>
        </div>
      </div>

      {/* Main Users Data Table */}
      <UserTable
        users={users}
        isLoading={!isLoaded}
        onSelectUser={setSelectedUser}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
};
