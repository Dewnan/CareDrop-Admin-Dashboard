import React from 'react';
import { X, User, Calendar, ArrowUpRight, RefreshCw, Send, CheckCircle2 } from 'lucide-react';
import { Transaction } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface TransactionDetailPanelProps {
  transaction: Transaction;
  onClose: () => void;
  onSimulateRefund: (id: string) => void;
  onSimulatePayout: (id: string) => void;
}

// Renders a single label/value info row inside the detail panel
const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="txn-detail-row">
    <span className="txn-detail-label">{label}</span>
    <span className="txn-detail-value">{value}</span>
  </div>
);

export const TransactionDetailPanel: React.FC<TransactionDetailPanelProps> = ({
  transaction: txn,
  onClose,
  onSimulateRefund,
  onSimulatePayout,
}) => {
  const fmt = (n: number) =>
    `Rs. ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <aside className="txn-detail-panel">
      {/* Panel Header */}
      <div className="txn-detail-header">
        <div>
          <p className="txn-detail-header-label">Transaction Detail</p>
          <h2 className="txn-detail-header-id">#{txn.id}</h2>
        </div>
        <button type="button" className="txn-panel-close-btn" onClick={onClose} title="Close panel">
          <X size={18} />
        </button>
      </div>

      {/* Status + Method Row */}
      <div className="txn-detail-status-row">
        <StatusBadge status={txn.status} />
        <span className="method-pill-tag">{txn.method}</span>
      </div>

      <div className="txn-detail-divider" />

      {/* Participants */}
      <div className="txn-detail-section">
        <p className="txn-detail-section-title">Participants</p>
        <DetailRow
          label="Patient"
          value={
            <span className="flex-align-center gap-2">
              <User size={14} className="text-muted" />
              {txn.patientName}
            </span>
          }
        />
        <DetailRow
          label="Helper"
          value={
            <span className="flex-align-center gap-2">
              <User size={14} className="text-muted" />
              {txn.helperName}
            </span>
          }
        />
      </div>

      <div className="txn-detail-divider" />

      {/* Reference IDs */}
      <div className="txn-detail-section">
        <p className="txn-detail-section-title">References</p>
        <DetailRow label="Transaction ID" value={<span className="code-text font-bold">#{txn.id}</span>} />
        <DetailRow label="Linked Task ID" value={<span className="code-text font-bold">#{txn.taskId}</span>} />
        <DetailRow
          label="Created"
          value={
            <span className="flex-align-center gap-2">
              <Calendar size={14} className="text-muted" />
              {txn.createdAt}
            </span>
          }
        />
        {txn.disbursedAt && (
          <DetailRow
            label="Disbursed"
            value={
              <span className="flex-align-center gap-2">
                <CheckCircle2 size={14} className="text-success" />
                {txn.disbursedAt}
              </span>
            }
          />
        )}
      </div>

      <div className="txn-detail-divider" />

      {/* Financial Breakdown */}
      <div className="txn-detail-section">
        <p className="txn-detail-section-title">Financial Breakdown</p>
        <DetailRow label="Gross Amount" value={<span className="font-semibold">{fmt(txn.grossAmount)}</span>} />
        <DetailRow
          label="Platform Fee (15%)"
          value={<span className="text-danger font-semibold">- {fmt(txn.platformFee)}</span>}
        />
        <div className="txn-detail-divider txn-detail-divider--dashed" />
        <DetailRow
          label="Net Helper Earnings"
          value={<span className="text-success font-bold">{fmt(txn.netHelperEarnings)}</span>}
        />
      </div>

      {/* Action Buttons - only when actionable */}
      {txn.status === 'held_escrow' && (
        <>
          <div className="txn-detail-divider" />
          <div className="txn-detail-actions">
            <button
              type="button"
              className="btn-action btn-purple-light w-full"
              onClick={() => onSimulatePayout(txn.id)}
            >
              <Send size={15} />
              <span>Disburse Payout to Helper</span>
            </button>
            <button
              type="button"
              className="btn-action btn-danger-light w-full"
              onClick={() => onSimulateRefund(txn.id)}
            >
              <RefreshCw size={15} />
              <span>Simulate Refund to Patient</span>
            </button>
          </div>
        </>
      )}

      {txn.status === 'payout_disbursed' && (
        <>
          <div className="txn-detail-divider" />
          <div className="txn-detail-notice txn-detail-notice--success">
            <ArrowUpRight size={16} />
            <span>Payout has been disbursed to the helper.</span>
          </div>
        </>
      )}

      {txn.status === 'refunded' && (
        <>
          <div className="txn-detail-divider" />
          <div className="txn-detail-notice txn-detail-notice--danger">
            <RefreshCw size={16} />
            <span>This transaction was refunded to the patient.</span>
          </div>
        </>
      )}
    </aside>
  );
};
