import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Transaction } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Skeleton } from '../common/Skeleton';

interface PaymentsTableProps {
  transactions: Transaction[];
  onSelectTransaction: (txn: Transaction) => void;
  selectedTransactionId?: string;
  isLoading?: boolean;
}

export const PaymentsTable: React.FC<PaymentsTableProps> = ({
  transactions,
  onSelectTransaction,
  selectedTransactionId,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'held_escrow' | 'payout_disbursed' | 'refunded' | 'cod'>('all');

  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch =
      txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.taskId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.helperName.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === 'held_escrow') matchesStatus = txn.status === 'held_escrow';
    else if (statusFilter === 'payout_disbursed') matchesStatus = txn.status === 'payout_disbursed';
    else if (statusFilter === 'refunded') matchesStatus = txn.status === 'refunded';
    else if (statusFilter === 'cod') matchesStatus = txn.method.toLowerCase().includes('cod');

    return matchesSearch && matchesStatus;
  });

  const filterTabs: { key: typeof statusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'held_escrow', label: 'In Escrow' },
    { key: 'payout_disbursed', label: 'Disbursed' },
    { key: 'refunded', label: 'Refunded' },
    { key: 'cod', label: 'COD Cash' },
  ];

  return (
    <div className="table-card-panel p-4 sm:p-6">
      {/* Search and filter toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
        <div className="search-filter-box w-full sm:max-w-xs">
          <Search size={16} className="table-search-icon" />
          <input
            type="text"
            className="table-search-input w-full"
            placeholder="Search by Txn ID, Task ID, Patient or Helper..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-tabs-group overflow-x-auto flex items-center gap-1 max-w-full pb-1 sm:pb-0">
          {filterTabs.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`filter-tab-btn whitespace-nowrap ${statusFilter === t.key ? 'active' : ''}`}
              onClick={() => setStatusFilter(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Slim 5-column table - row click opens the detail panel */}
      <div className="table-wrapper overflow-x-auto w-full">
        <table className="data-table">
          <thead>
            <tr>
              <th>TXN / TASK</th>
              <th>PATIENT &amp; HELPER</th>
              <th>GROSS AMOUNT</th>
              <th>METHOD</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <Skeleton variant="table-row" count={5} />
            ) : filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-4 text-muted">
                  No transactions match your filter criteria.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((txn) => (
                <tr
                  key={txn.id}
                  className={`table-row-hover clickable-row${selectedTransactionId === txn.id ? ' row-selected' : ''}`}
                  onClick={() => onSelectTransaction(txn)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <strong className="code-text text-sm">#{txn.id}</strong>
                    <div className="text-muted text-xs mt-0.5">Task #{txn.taskId}</div>
                  </td>
                  <td>
                    <div className="text-sm font-semibold">{txn.patientName}</div>
                    <div className="text-xs text-muted">{txn.helperName}</div>
                  </td>
                  <td className="font-semibold">
                    Rs. {txn.grossAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td>
                    <span className="method-pill-tag">{txn.method}</span>
                  </td>
                  <td>
                    <StatusBadge status={txn.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
