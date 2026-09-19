import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { SupportTicket } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Skeleton } from '../common/Skeleton';

interface SupportTicketListProps {
  tickets: SupportTicket[];
  onSelectTicket: (ticket: SupportTicket) => void;
  isLoading?: boolean;
}

export const SupportTicketList: React.FC<SupportTicketListProps> = ({
  tickets,
  onSelectTicket,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'helper'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved'>('all');

  const filteredTickets = tickets.filter((t) => {
    // Search query filter (Subject, Ticket ID, User Name, Category)
    const matchesSearch =
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());

    // Role filter
    let matchesRole = true;
    if (roleFilter === 'user') {
      matchesRole = t.userRole === 'patient' || t.userRole === 'guardian';
    } else if (roleFilter === 'helper') {
      matchesRole = t.userRole === 'helper';
    }

    // Status filter
    let matchesStatus = true;
    if (statusFilter === 'pending') {
      matchesStatus = t.status === 'open' || t.status === 'pending' || t.status === 'in_progress';
    } else if (statusFilter === 'resolved') {
      matchesStatus = t.status === 'resolved' || t.status === 'closed';
    }

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="table-card-panel">
      {/* Top Toolbar: Search & Role Filters */}
      <div className="panel-header-toolbar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="global-search-input"
            placeholder="Search tickets by ID, subject, user name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Controls Right */}
        <div className="filter-controls-right">
          <div className="filter-select-wrapper">
            <span className="filter-select-label">Role:</span>
            <select
              id="role-filter-select"
              className="filter-select-box"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
            >
              <option value="all">All Roles</option>
              <option value="user">Patients & Guardians</option>
              <option value="helper">Helpers</option>
            </select>
          </div>

          <div className="filter-select-wrapper">
            <span className="filter-select-label">Status:</span>
            <select
              id="status-filter-select"
              className="filter-select-box"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Full-width Ticket Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>SUBJECT</th>
              <th>CATEGORY</th>
              <th>SUBMITTED BY</th>
              <th>SUBMITTED DATE</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <Skeleton variant="table-row" count={5} />
            ) : filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-4 text-muted">
                  No support tickets match your filter criteria.
                </td>
              </tr>
            ) : (
              filteredTickets.map((t) => {
                const isHelper = t.userRole === 'helper';
                const roleLabel = isHelper
                  ? 'Helper'
                  : t.userRole === 'guardian'
                  ? 'Guardian'
                  : 'Patient';

                return (
                  <tr
                    key={t.id}
                    className="table-row-hover cursor-pointer"
                    onClick={() => onSelectTicket(t)}
                  >
                    <td>
                      <div className="ticket-subject-cell">
                        <span className="font-semibold text-main block">{t.subject}</span>
                      </div>
                    </td>
                    <td>
                      <span className="category-tag-pill">{t.category}</span>
                    </td>
                    <td>
                      <div className="user-submitted-cell flex-column gap-1">
                        <span className="font-medium text-main">{t.userName}</span>
                      </div>
                    </td>
                    <td className="text-muted text-sm">{t.createdAt}</td>
                    <td>
                      <StatusBadge status={t.status} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
