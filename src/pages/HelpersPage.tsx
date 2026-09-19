import React, { useState } from 'react';
import { HelperTable } from '../components/users/HelperTable';
import { HelperDetailView } from '../components/users/HelperDetailView';
import { dataService } from '../services/dataService';
import { useLiveData } from '../hooks/useLiveData';
import { Helper } from '../types';

export const HelpersPage: React.FC = () => {
  const [selectedHelper, setSelectedHelper] = useState<Helper | null>(null);
  const { helpers, isLoaded } = useLiveData();

  const handleToggleStatus = (helperId: string) => {
    dataService.rejectHelper(helperId);
  };

  if (selectedHelper) {
    const updatedHelper = helpers.find((h) => h.id === selectedHelper.id) || selectedHelper;
    return (
      <HelperDetailView
        helper={updatedHelper}
        onBack={() => setSelectedHelper(null)}
        onToggleStatus={handleToggleStatus}
      />
    );
  }

  return (
    <div className="page-container">
      <div className="page-title-header">
        <div>
          <h1 className="page-heading">Helper Management</h1>
          <p className="page-subheading">Manage helper accounts and performance</p>
        </div>
      </div>

      <HelperTable
        helpers={helpers}
        isLoading={!isLoaded}
        onSelectHelper={setSelectedHelper}
      />
    </div>
  );
};
