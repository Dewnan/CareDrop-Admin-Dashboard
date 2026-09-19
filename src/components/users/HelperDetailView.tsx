import React from 'react';
import { ArrowLeft, UserX, Trash2, Star, CheckCircle2, Clock } from 'lucide-react';
import { Helper } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { StatusBadge } from '../common/StatusBadge';

interface HelperDetailViewProps {
  helper: Helper;
  onBack: () => void;
  onToggleStatus?: (helperId: string) => void;
}

// Full page helper detail inspector view matching UserDetailView style
export const HelperDetailView: React.FC<HelperDetailViewProps> = ({
  helper,
  onBack,
  onToggleStatus,
}) => {
  return (
    <div className="user-detail-container">
      {/* Breadcrumb Navigation */}
      <div className="breadcrumb-bar">
        <button type="button" className="breadcrumb-back-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Helper Management</span>
        </button>
        <span className="breadcrumb-separator">&gt;</span>
        <span className="breadcrumb-current">{helper.name}</span>
      </div>

      <div className="user-detail-grid">
        {/* Main Helper Profile Card */}
        <div className="user-profile-main-card">
          <div className="profile-header-top">
            <div className="profile-title-group">
              <UserAvatar
                name={helper.name}
                avatarInitials={helper.avatar}
                avatarUrl={helper.avatarUrl}
                className="profile-avatar-lg avatar-teal"
              />
              <div>
                <h2 className="profile-full-name">{helper.name}</h2>
                <p className="profile-sub-title">
                  Caregiver | Joined {helper.submittedAt || '10 Jan 2026'}
                </p>
                <div className="profile-badges-row">
                  <StatusBadge status={helper.status} />
                  <span className="badge badge-role">Helper</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="profile-actions-buttons">
              <button
                type="button"
                className={`btn-action ${helper.status === 'suspended' ? 'btn-success-light' : 'btn-amber-light'}`}
                onClick={() => onToggleStatus && onToggleStatus(helper.id)}
              >
                <UserX size={15} />
                <span>{helper.status === 'suspended' ? 'Reactivate' : 'Suspend'}</span>
              </button>
              <button
                type="button"
                className="btn-action btn-red-light"
                onClick={() => alert(`Delete requested for helper ${helper.id}`)}
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
              <span className="info-value">{helper.name}</span>
            </div>
            <div className="info-field-row">
              <span className="info-label">Helper ID</span>
              <span className="info-value">{helper.id}</span>
            </div>
            <div className="info-field-row">
              <span className="info-label">Phone Number</span>
              <span className="info-value">{helper.phone}</span>
            </div>
            <div className="info-field-row">
              <span className="info-label">Email Address</span>
              <span className="info-value">{helper.email}</span>
            </div>
            <div className="info-field-row">
              <span className="info-label">Average Star Rating</span>
              <span className="info-value">{helper.rating} / 5.0</span>
            </div>
            <div className="info-field-row">
              <span className="info-label">Account Joined Date</span>
              <span className="info-value">{helper.submittedAt || '10 Jan 2026'}</span>
            </div>
          </div>
        </div>

        {/* Right Side Key Performance Cards */}
        <div className="user-stats-column">
          <div className="side-stat-box">
            <p className="side-stat-label">Total Completed Tasks</p>
            <h3 className="side-stat-num text-primary">{helper.tasksCount}</h3>
          </div>
          <div className="side-stat-box">
            <p className="side-stat-label">Average Rating</p>
            <h3 className="side-stat-num text-amber">{helper.rating} <Star size={16} className="star-icon-filled" /></h3>
          </div>
          <div className="side-stat-box">
            <p className="side-stat-label">Gross Earnings</p>
            <h3 className="side-stat-num text-success">Rs. {helper.earnings.toLocaleString()}</h3>
          </div>
          <div className="side-stat-box">
            <p className="side-stat-label">Current Status</p>
            <h3 className="side-stat-num text-purple">{helper.status.toUpperCase()}</h3>
          </div>
        </div>
      </div>

      {/* Recent Completed Tasks Activity List */}
      <div className="recent-tasks-panel">
        <h3 className="panel-section-title">Fulfilled Task History</h3>
        <div className="tasks-timeline-list">
          <div className="timeline-task-item">
            <div className="task-item-left">
              <span className="task-icon-box"><CheckCircle2 size={18} className="text-success" /></span>
              <div>
                <h4 className="task-item-title">Medication Pickup - Hospital Ampang</h4>
                <p className="task-item-sub">Patient: Siti Aminah binti Rahman</p>
              </div>
            </div>
            <div className="task-item-right">
              <span className="task-date">22 Jul</span>
              <StatusBadge status="completed" label="Done" />
              <strong className="task-amount">Rs. 22</strong>
            </div>
          </div>

          <div className="timeline-task-item">
            <div className="task-item-left">
              <span className="task-icon-box"><CheckCircle2 size={18} className="text-success" /></span>
              <div>
                <h4 className="task-item-title">Elderly Home Care Assistance</h4>
                <p className="task-item-sub">Patient: Rajan Kumar</p>
              </div>
            </div>
            <div className="task-item-right">
              <span className="task-date">18 Jul</span>
              <StatusBadge status="completed" label="Done" />
              <strong className="task-amount">Rs. 45</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
