import React, { useState } from 'react';
import { Search, Eye, Edit3, UserX, UserCheck } from 'lucide-react';
import { User } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { StatusBadge } from '../common/StatusBadge';
import { Pagination } from '../common/Pagination';
import { Skeleton } from '../common/Skeleton';

interface UserTableProps {
  users: User[];
  onSelectUser: (user: User) => void;
  onToggleStatus: (userId: string) => void;
  isLoading?: boolean;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  onSelectUser,
  onToggleStatus,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const filterTabs = ['All', 'Active', 'Suspended', 'Guardian', 'Patient'];

  // Filter users based on tab and search query
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery);

    if (!matchesSearch) return false;
    if (filterTab === 'All') return true;
    if (filterTab === 'Active') return u.status === 'active';
    if (filterTab === 'Suspended') return u.status === 'suspended';
    if (filterTab === 'Guardian') return u.type === 'guardian';
    if (filterTab === 'Patient') return u.type === 'patient';
    return true;
  });

  const itemsPerPage = 5;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="table-card-panel p-4 sm:p-6">
      {/* Control bar with search and category filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
        <div className="search-filter-box w-full sm:max-w-xs">
          <Search size={16} className="table-search-icon" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
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
              <th>USER NAME</th>
              <th>ACCOUNT TYPE</th>
              <th>STATUS</th>
              <th className="text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <Skeleton variant="table-row" count={5} />
            ) : paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center p-4 text-muted">
                  No users match your criteria.
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user) => (
                <tr 
                  key={user.id} 
                  className="table-row-hover clickable-row"
                  onClick={() => onSelectUser(user)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <div className="user-avatar-name-cell">
                      <UserAvatar
                        name={user.name}
                        avatarInitials={user.avatar}
                        avatarUrl={user.avatarUrl}
                        className="user-table-avatar"
                      />
                      <span className="user-table-name">{user.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="user-type-tag">
                      {user.type.charAt(0).toUpperCase() + user.type.slice(1)}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="action-buttons-cell">
                      <button
                        type="button"
                        className="btn-icon btn-secondary"
                        title="View details"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectUser(user);
                        }}
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        type="button"
                        className="btn-icon btn-secondary"
                        title="Edit user info"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectUser(user);
                        }}
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        type="button"
                        className={`btn-icon ${user.status === 'active' ? 'btn-danger-light' : 'btn-success-light'}`}
                        title={user.status === 'active' ? 'Suspend account' : 'Reactivate account'}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStatus(user.id);
                        }}
                      >
                        {user.status === 'active' ? <UserX size={15} /> : <UserCheck size={15} />}
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
        totalItems={filteredUsers.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        itemLabel="users"
      />
    </div>
  );
};
