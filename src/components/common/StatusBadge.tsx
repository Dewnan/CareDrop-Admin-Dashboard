import React from 'react';

export type StatusBadgeType = 
  | 'active' 
  | 'suspended' 
  | 'pending' 
  | 'verified' 
  | 'rejected' 
  | 'inProgress' 
  | 'completed' 
  | 'cancelled' 
  | 'guardian' 
  | 'patient'
  | 'open'
  | 'in_review'
  | 'resolved';

interface StatusBadgeProps {
  status: StatusBadgeType | string;
  label?: string;
  size?: 'sm' | 'md';
}

// Uniform status badge renderer for visual consistency across tables & details
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'md' }) => {
  const normalized = status.toLowerCase().replace(/\s+/g, '_');
  const displayText = label || status;

  let colorClass = 'badge-neutral';

  switch (normalized) {
    case 'active':
    case 'online':
    case 'verified':
    case 'completed':
    case 'resolved':
    case 'done':
      colorClass = 'badge-success';
      break;
    case 'offline':
      colorClass = 'badge-neutral';
      break;

    case 'pending':
    case 'in_review':
    case 'open':
      colorClass = 'badge-warning';
      break;
    case 'suspended':
    case 'cancelled':
    case 'rejected':
    case 'critical':
    case 'high':
      colorClass = 'badge-danger';
      break;
    case 'inprogress':
    case 'in_progress':
    case 'enroute':
    case 'en_route':
      colorClass = 'badge-info';
      break;
    case 'guardian':
    case 'patient':
      colorClass = 'badge-role';
      break;
    default:
      colorClass = 'badge-neutral';
  }

  return (
    <span className={`badge badge-${size} ${colorClass}`}>
      <span className="badge-dot" />
      {displayText}
    </span>
  );
};
