import React from 'react';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';
import { NavTab } from '../components/layout/Sidebar';

interface NotFoundPageProps {
  onNavigateHome: (tab: NavTab) => void;
}

// Custom 404 Page matching project development standards rule #5
export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigateHome }) => {
  return (
    <div className="not-found-container">
      <div className="not-found-card">
        <div className="not-found-icon-box">
          <FileQuestion size={48} className="text-primary" />
        </div>

        <span className="error-code-badge">ERROR 404</span>

        <h1 className="not-found-title">Page Not Found</h1>
        <p className="not-found-description">
          The administration route or resource you are looking for does not exist, has been moved, or requires higher security access claims.
        </p>

        <div className="not-found-actions">
          <button
            type="button"
            className="btn-action btn-secondary"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={16} />
            <span>Go Back</span>
          </button>
          <button
            type="button"
            className="btn-action btn-primary"
            onClick={() => onNavigateHome('dashboard')}
          >
            <Home size={16} />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
