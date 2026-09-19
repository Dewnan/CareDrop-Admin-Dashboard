import React from 'react';

interface SkeletonProps {
  variant?: 'card' | 'table-row' | 'text' | 'avatar' | 'chart';
  count?: number;
  className?: string;
}

// Skeleton placeholder loader components for smooth loading states
export const Skeleton: React.FC<SkeletonProps> = ({ 
  variant = 'text', 
  count = 1,
  className = '' 
}) => {
  const items = Array.from({ length: count });

  if (variant === 'card') {
    return (
      <div className="skeleton-grid">
        {items.map((_, i) => (
          <div className="skeleton-card shimmer" key={i}>
            <div className="skeleton-header">
              <div className="skeleton-circle" />
              <div className="skeleton-line short" />
            </div>
            <div className="skeleton-line title" />
            <div className="skeleton-line medium" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table-row') {
    return (
      <>
        {items.map((_, i) => (
          <tr className="skeleton-tr" key={i}>
            <td colSpan={10}>
              <div className="skeleton-row-wrap shimmer">
                <div className="skeleton-circle sm" />
                <div className="skeleton-line medium" />
                <div className="skeleton-line short" />
                <div className="skeleton-line short" />
              </div>
            </td>
          </tr>
        ))}
      </>
    );
  }

  if (variant === 'chart') {
    return (
      <div className="skeleton-chart-box shimmer">
        <div className="skeleton-circle lg" />
        <div className="skeleton-line medium" />
      </div>
    );
  }

  return (
    <>
      {items.map((_, i) => (
        <div 
          className={`skeleton-line ${variant} shimmer ${className}`} 
          key={i} 
        />
      ))}
    </>
  );
};
