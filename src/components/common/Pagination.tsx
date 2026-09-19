import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}

// Data table pagination bar matching design frame layout
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage = 5,
  onPageChange,
  itemLabel = 'items',
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="pagination-container">
      <p className="pagination-info">
        Showing <strong>{startItem}-{endItem}</strong> of <strong>{totalItems.toLocaleString()}</strong> {itemLabel}
      </p>

      <div className="pagination-controls">
        <button
          type="button"
          className="pagination-btn"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
          const pageNum = idx + 1;
          return (
            <button
              key={pageNum}
              type="button"
              className={`pagination-num ${currentPage === pageNum ? 'active' : ''}`}
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </button>
          );
        })}

        {totalPages > 5 && <span className="pagination-ellipsis">...</span>}

        <button
          type="button"
          className="pagination-btn"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
