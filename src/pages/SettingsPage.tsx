import React, { useState, useCallback } from 'react';
import { SettingsPanel } from '../components/settings/SettingsPanel';
import { AdminManagementPanel } from '../components/settings/AdminManagementPanel';
import { dataService } from '../services/dataService';
import { AdminRecord } from '../types';

export const SettingsPage: React.FC = () => {
  const [admins, setAdmins] = useState<AdminRecord[]>(() => dataService.getAdmins());

  const handleAddAdmin = useCallback(async (email: string) => {
    await dataService.addAdmin(email);
    setAdmins(dataService.getAdmins());
  }, []);

  const handleRemoveAdmin = useCallback(async (id: string) => {
    await dataService.removeAdmin(id);
    setAdmins(dataService.getAdmins());
  }, []);

  return (
    <div className="page-container">
      <div className="page-title-header">
        <div>
          <h1 className="page-heading">Platform Settings</h1>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <SettingsPanel />
        <AdminManagementPanel
          admins={admins}
          onAddAdmin={handleAddAdmin}
          onRemoveAdmin={handleRemoveAdmin}
        />
      </div>
    </div>
  );
};

