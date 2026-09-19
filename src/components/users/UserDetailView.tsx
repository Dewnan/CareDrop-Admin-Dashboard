import React from 'react';
import { ArrowLeft, UserX, Trash2, Package, FileText, Clock } from 'lucide-react';
import { User } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { StatusBadge } from '../common/StatusBadge';

interface UserDetailViewProps {
  user: User;
  onBack: () => void;
  onToggleStatus: (userId: string) => void;
}

// User detail profile inspector view matching Frame 40 layout
export const UserDetailView: React.FC<UserDetailViewProps> = ({
  user,
  onBack,
  onToggleStatus,
}) => {
  return (
    <div className="user-detail-container">
      {/* Breadcrumb Navigation */}
      <div className="breadcrumb-bar">
        <button type="button" className="breadcrumb-back-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>User Management</span>
        </button>
        <span className="breadcrumb-separator">&gt;</span>
        <span className="breadcrumb-current">{user.name}</span>
      </div>

      <div className="user-detail-grid">
        {/* Main User Profile Card */}
        <div className="user-profile-main-card">
          <div className="profile-header-top">
            <div className="profile-title-group">
              <UserAvatar
                name={user.name}
                avatarInitials={user.avatar}
                avatarUrl={user.avatarUrl}
                className="profile-avatar-lg"
              />
              <div>
                <h2 className="profile-full-name">{user.name}</h2>
                <p className="profile-sub-title">
                  {user.type.charAt(0).toUpperCase() + user.type.slice(1)} | Member since {user.joinedDate}
                </p>
                <div className="profile-badges-row">
                  <StatusBadge status={user.status} />
                  <span className="badge badge-role">{user.type}</span>
                </div>
              </div>
            </div>

            {/* Profile Action Buttons matching Frame 40 */}
            <div className="profile-actions-buttons">
              <button
                type="button"
                className={`btn-action ${user.status === 'active' ? 'btn-amber-light' : 'btn-success-light'}`}
                onClick={() => onToggleStatus(user.id)}
              >
                <UserX size={15} />
                <span>{user.status === 'active' ? 'Suspend' : 'Reactivate'}</span>
              </button>
              <button
                type="button"
                className="btn-action btn-red-light"
                onClick={() => alert(`Delete requested for user ${user.id}`)}
              >
                <Trash2 size={15} />
                <span>Delete</span>
              </button>
            </div>
          </div>

          <div className="divider-line" />

          {/* Detailed Info Fields Table */}
          <div className="profile-info-grid">
            <div className="info-field-row">
              <span className="info-label">Full Name</span>
              <span className="info-value">{user.name}</span>
            </div>
            <div className="info-field-row">
              <span className="info-label">IC Number</span>
              <span className="info-value">{user.icNumber || '901014-14-5678'}</span>
            </div>
            <div className="info-field-row">
              <span className="info-label">Phone</span>
              <span className="info-value">{user.phone}</span>
            </div>
            <div className="info-field-row">
              <span className="info-label">Email</span>
              <span className="info-value">{user.email}</span>
            </div>
            <div className="info-field-row">
              <span className="info-label">Date of Birth</span>
              <span className="info-value">{user.dateOfBirth || '14 Oct 1990'}</span>
            </div>
            <div className="info-field-row">
              <span className="info-label">Address</span>
              <span className="info-value">{user.address || 'Jalan Ampang, Kuala Lumpur'}</span>
            </div>
          </div>
        </div>

        {/* Right Side Key Performance Cards */}
        <div className="user-stats-column">
          <div className="side-stat-box">
            <p className="side-stat-label">Total Tasks</p>
            <h3 className="side-stat-num text-primary">{user.tasksCount}</h3>
          </div>
          <div className="side-stat-box">
            <p className="side-stat-label">Completed</p>
            <h3 className="side-stat-num text-success">{Math.max(0, user.tasksCount - 2)}</h3>
          </div>
          <div className="side-stat-box">
            <p className="side-stat-label">Cancelled</p>
            <h3 className="side-stat-num text-danger">1</h3>
          </div>
          <div className="side-stat-box">
            <p className="side-stat-label">Total Spent</p>
            <h3 className="side-stat-num text-purple">Rs. {user.totalSpent || 284}</h3>
          </div>
        </div>
      </div>

      {/* Recent Tasks Activity List */}
      <div className="recent-tasks-panel">
        <h3 className="panel-section-title">Recent Tasks</h3>
        <div className="tasks-timeline-list">
          <div className="timeline-task-item">
            <div className="task-item-left">
              <span className="task-icon-box"><Package size={18} /></span>
              <div>
                <h4 className="task-item-title">Medication Pickup</h4>
                <p className="task-item-sub">Hospital Ampang Outpatient</p>
              </div>
            </div>
            <div className="task-item-right">
              <span className="task-date">22 Jul</span>
              <StatusBadge status="active" label="Active" />
              <strong className="task-amount">Rs. 22</strong>
            </div>
          </div>

          <div className="timeline-task-item">
            <div className="task-item-left">
              <span className="task-icon-box"><FileText size={18} /></span>
              <div>
                <h4 className="task-item-title">Document Filing</h4>
                <p className="task-item-sub">Clinic Central Specialist</p>
              </div>
            </div>
            <div className="task-item-right">
              <span className="task-date">18 Jul</span>
              <StatusBadge status="completed" label="Done" />
              <strong className="task-amount">Rs. 15</strong>
            </div>
          </div>

          <div className="timeline-task-item">
            <div className="task-item-left">
              <span className="task-icon-box"><Clock size={18} /></span>
              <div>
                <h4 className="task-item-title">Queue Management</h4>
                <p className="task-item-sub">HKL Specialist Tower</p>
              </div>
            </div>
            <div className="task-item-right">
              <span className="task-date">12 Jul</span>
              <StatusBadge status="completed" label="Done" />
              <strong className="task-amount">Rs. 18</strong>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

