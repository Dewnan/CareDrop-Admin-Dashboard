import React, { useState } from 'react';
import { Search, Eye, Edit3, ShieldCheck, UserX, Star } from 'lucide-react';
import { Helper } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { StatusBadge } from '../common/StatusBadge';
import { Pagination } from '../common/Pagination';
import { Skeleton } from '../common/Skeleton';

interface HelperTableProps {
  helpers: Helper[];
  onSelectHelper?: (helper: Helper) => void;
  isLoading?: boolean;
}

export const HelperTable: React.FC<HelperTableProps> = ({
  helpers,
  onSelectHelper,
  isLoading = false,
}) => {

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const filterTabs = ['All', 'Online', 'Offline', 'Suspended'];

  const filteredHelpers = helpers.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.phone.includes(searchQuery);

    if (!matchesSearch) return false;
    if (filterTab === 'All') return true;
    if (filterTab === 'Online') return h.status === 'online';
    if (filterTab === 'Offline') return h.status === 'offline';
    if (filterTab === 'Suspended') return h.status === 'suspended';
    return true;
  });

  const itemsPerPage = 5;
  const paginatedHelpers = filteredHelpers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="table-card-panel">
      {/* Control Toolbar */}
      {/* Control bar with search and category filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
        <div className="search-filter-box w-full sm:max-w-xs">
          <Search size={16} className="table-search-icon" />
          <input
            type="text"
            placeholder="Search helpers or phone number..."
            className="table-search-input w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-tabs-group overflow-x-auto flex items-center gap-1 max-w-full pb-1 sm:pb-0">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`filter-tab-btn whitespace-nowrap ${filterTab === tab ? 'active' : ''}`}
              onClick={() => {
                setFilterTab(tab);
                setCurrentPage(1);
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Data Table */}
      <div className="table-wrapper overflow-x-auto w-full">
        <table className="data-table">
          <thead>
            <tr>
              <th>HELPER NAME</th>
              <th>TASKS COMPLETED</th>
              <th>RATING</th>
              <th>EARNINGS</th>
              <th>STATUS</th>
              <th className="text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <Skeleton variant="table-row" count={5} />
            ) : paginatedHelpers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-4 text-muted">
                  No helpers match your filter criteria.
                </td>
              </tr>
            ) : (
              paginatedHelpers.map((helper) => (
                <tr 
                  key={helper.id} 
                  className="table-row-hover clickable-row"
                  onClick={() => onSelectHelper && onSelectHelper(helper)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <div className="user-avatar-name-cell">
                      <UserAvatar
                        name={helper.name}
                        avatarInitials={helper.avatar}
                        avatarUrl={helper.avatarUrl}
                        className="user-table-avatar avatar-teal"
                      />
                      <span className="user-table-name">{helper.name}</span>
                    </div>
                  </td>
                  <td>{helper.tasksCount.toLocaleString()}</td>
                  <td>
                    <span className="rating-pill">
                      <Star size={13} className="star-icon-filled" />
                      {helper.rating.toFixed(1)}
                    </span>
                  </td>
                  <td className="font-semibold">
                    Rs. {helper.earnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td>
                    <StatusBadge status={helper.status} />
                  </td>
                  <td className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="action-buttons-cell">
                      <button
                        type="button"
                        className="btn-icon btn-secondary"
                        title="View helper profile"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectHelper) onSelectHelper(helper);
                        }}
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        type="button"
                        className="btn-icon btn-secondary"
                        title="Edit details"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectHelper) onSelectHelper(helper);
                        }}
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        type="button"
                        className="btn-icon btn-danger-light"
                        title="Suspend helper"
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`Toggle status requested for helper ${helper.id}`);
                        }}
                      >
                        <UserX size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>



      {/* Pagination Footer */}
      <Pagination
        currentPage={currentPage}
        totalItems={filteredHelpers.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        itemLabel="helpers"
      />
    </div>
  );
};
