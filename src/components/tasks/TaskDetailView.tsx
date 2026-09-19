import React from 'react';
import { ArrowLeft, CheckCircle2, XCircle, MapPin, Info, Calendar, ClipboardList } from 'lucide-react';
import { Task, TaskProgressStep } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface TaskDetailViewProps {
  task: Task;
  onBack: () => void;
  onUpdateStatus: (taskId: string, newStatus: TaskProgressStep) => void;
}

// Full page task detail inspector view matching UserDetailView style
export const TaskDetailView: React.FC<TaskDetailViewProps> = ({
  task,
  onBack,
  onUpdateStatus,
}) => {
  return (
    <div className="user-detail-container">
      {/* Breadcrumb Navigation */}
      <div className="breadcrumb-bar">
        <button type="button" className="breadcrumb-back-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Task Oversight</span>
        </button>
        <span className="breadcrumb-separator">&gt;</span>
        <span className="breadcrumb-current">Task #{task.id}</span>
      </div>

      <div className="user-detail-grid">
        {/* Main Task Profile Card */}
        <div className="user-profile-main-card">
          <div className="profile-header-top">
            <div className="profile-title-group">
              <div className="profile-avatar-lg">
                <ClipboardList size={28} />
              </div>
              <div>
                <h2 className="profile-full-name">{task.title}</h2>
                <p className="profile-sub-title">
                  Category: {task.category} | Created: {task.createdAt}
                </p>
                <div className="profile-badges-row">
                  <StatusBadge status={task.status} />
                  <span className="badge badge-neutral">{task.priority.toUpperCase()} Priority</span>
                </div>
              </div>
            </div>


            {/* Force Actions */}
            <div className="profile-actions-buttons">
              {task.status !== 'completed' && task.status !== 'cancelled' && (
                <>
                  <button
                    type="button"
                    className="btn-action btn-success-light"
                    onClick={() => onUpdateStatus(task.id, 'completed')}
                  >
                    <CheckCircle2 size={15} />
                    <span>Force Complete</span>
                  </button>
                  <button
                    type="button"
                    className="btn-action btn-red-light"
                    onClick={() => onUpdateStatus(task.id, 'cancelled')}
                  >
                    <XCircle size={15} />
                    <span>Force Cancel</span>
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="divider-line" />

          {/* Detailed Info Fields Table */}
          <div className="profile-info-grid">
            <div className="info-field-row">
              <span className="info-label">Task Reference Code</span>
              <span className="info-value">{task.id}</span>
            </div>
            <div className="info-field-row">
              <span className="info-label">Category</span>
              <span className="info-value">{task.category}</span>
            </div>
            <div className="info-field-row">
              <span className="info-label">Patient Name</span>
              <span className="info-value">{task.patientName}</span>
            </div>
            <div className="info-field-row">
              <span className="info-label">Assigned Helper</span>
              <span className="info-value">{task.helperName || 'Unassigned'}</span>
            </div>
            <div className="info-field-row">
              <span className="info-label">Pickup Location</span>
              <span className="info-value">{task.pickupAddress}</span>
            </div>
            <div className="info-field-row">
              <span className="info-label">Delivery Address</span>
              <span className="info-value">{task.deliveryAddress}</span>
            </div>
            <div className="info-field-row">
              <span className="info-label">Scheduled Execution Time</span>
              <span className="info-value">{task.scheduledTime || 'Immediate Fulfillment'}</span>
            </div>
            <div className="info-field-row">
              <span className="info-label">Total Task Price</span>
              <span className="info-value text-primary">Rs. {task.amount}</span>
            </div>
          </div>
        </div>

        {/* Right Side Key Performance Cards */}
        <div className="user-stats-column">
          <div className="side-stat-box">
            <p className="side-stat-label">Task Amount</p>
            <h3 className="side-stat-num text-primary">Rs. {task.amount}</h3>
          </div>
          <div className="side-stat-box">
            <p className="side-stat-label">Progress Step</p>
            <h3 className="side-stat-num text-purple">{task.status.toUpperCase()}</h3>
          </div>
          <div className="side-stat-box">
            <p className="side-stat-label">Priority Level</p>
            <h3 className="side-stat-num text-amber">{task.priority.toUpperCase()}</h3>
          </div>
        </div>
      </div>

      {/* Uploaded Proof Photo Section */}
      <div className="recent-tasks-panel">
        <h3 className="panel-section-title">Proof of Fulfillment & Location Assets</h3>
        {task.proofImageUrl ? (
          <div className="mt-2">
            <p className="body-label mb-2">Uploaded Proof Photo (Supabase Storage):</p>
            <div className="document-preview-box">
              <img
                src={task.proofImageUrl}
                alt="Proof of fulfillment"
                className="document-preview-img"
              />
            </div>
          </div>
        ) : (
          <div className="info-alert-box">
            <Info size={16} /> Proof of fulfillment photo will be uploaded by the assigned helper upon task completion.
          </div>
        )}
      </div>
    </div>
  );
};
