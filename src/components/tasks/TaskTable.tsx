import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Task, TaskProgressStep } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Pagination } from '../common/Pagination';
import { Skeleton } from '../common/Skeleton';

interface TaskTableProps {
  tasks: Task[];
  onUpdateStatus: (taskId: string, newStatus: TaskProgressStep) => void;
  onSelectTask?: (task: Task) => void;
  isLoading?: boolean;
}

export const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  onUpdateStatus,
  onSelectTask,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const filterTabs = ['All', 'pending', 'enRoute', 'inProgress', 'completed', 'cancelled'];

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.helperName && t.helperName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'All') return true;
    return t.status === statusFilter;
  });

  const itemsPerPage = 5;
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="table-card-panel p-4 sm:p-6">
      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
        <div className="search-filter-box w-full sm:max-w-xs">
          <Search size={16} className="table-search-icon" />
          <input
            type="text"
            placeholder="Search tasks, category, or patient..."
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
              className={`filter-tab-btn whitespace-nowrap ${statusFilter === tab ? 'active' : ''}`}
              onClick={() => {
                setStatusFilter(tab);
                setCurrentPage(1);
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper overflow-x-auto w-full">
        <table className="data-table">
          <thead>
            <tr>
              <th>TASK DETAILS</th>
              <th>PATIENT</th>
              <th>ASSIGNED HELPER</th>
              <th>AMOUNT</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <Skeleton variant="table-row" count={5} />
            ) : paginatedTasks.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-4 text-muted">
                  No tasks match your filter criteria.
                </td>
              </tr>
            ) : (
              paginatedTasks.map((task) => (
                <tr 
                  key={task.id} 
                  className="table-row-hover clickable-row"
                  onClick={() => onSelectTask && onSelectTask(task)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <div>
                      <strong className="task-title-text">{task.title}</strong>
                      <div className="task-meta-sub">
                        <span className="task-category-pill">{task.category}</span>
                        <span className="task-id-tag">{task.id}</span>
                      </div>
                    </div>
                  </td>
                  <td>{task.patientName}</td>
                  <td>{task.helperName || <em className="text-muted">Unassigned</em>}</td>
                  <td className="font-semibold">
                    Rs. {task.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td>
                    <StatusBadge status={task.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>


      <Pagination
        currentPage={currentPage}
        totalItems={filteredTasks.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        itemLabel="tasks"
      />
    </div>
  );
};
