import React, { useState } from 'react';
import { CreditCard, DollarSign, Lock, ArrowUpRight } from 'lucide-react';
import { PaymentsTable } from '../components/payments/PaymentsTable';
import { TransactionDetailPanel } from '../components/payments/TransactionDetailPanel';
import { dataService } from '../services/dataService';
import { useLiveData } from '../hooks/useLiveData';
import { Skeleton } from '../components/common/Skeleton';
import { Transaction } from '../types';

export const PaymentsPage: React.FC = () => {
  const { transactions, isLoaded } = useLiveData();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const handleSimulateRefund = (id: string) => {
    dataService.simulateRefund(id);
    // Refresh the selected transaction from updated list so panel reflects new status
    setSelectedTransaction(null);
  };

  const handleSimulatePayout = (id: string) => {
    dataService.simulatePayout(id);
    setSelectedTransaction(null);
  };

  const handleSelectTransaction = (txn: Transaction) => {
    // Toggle: clicking the same row closes the panel
    setSelectedTransaction((prev) => (prev?.id === txn.id ? null : txn));
  };

  // Calculate ledger metrics
  const totalVolume = transactions.reduce((acc, t) => acc + t.grossAmount, 0);
  const platformFees = transactions.reduce((acc, t) => acc + t.platformFee, 0);
  const heldEscrow = transactions
    .filter((t) => t.status === 'held_escrow')
    .reduce((acc, t) => acc + t.grossAmount, 0);
  const totalDisbursed = transactions
    .filter((t) => t.status === 'payout_disbursed')
    .reduce((acc, t) => acc + t.netHelperEarnings, 0);

  return (
    <div className="page-container">
      <div className="page-title-header">
        <div>
          <h1 className="page-heading">Financials &amp; Escrow Ledger</h1>
          <p className="page-subheading">
            Track gross transaction volume, 15% platform commission fees, and helper payout disbursements
          </p>
        </div>
      </div>

      {/* Financial Summary KPI Cards */}
      {!isLoaded ? (
        <Skeleton variant="card" count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-card-title">Gross Volume</span>
              <div className="stat-icon-wrapper bg-blue-light">
                <DollarSign size={18} className="text-primary-blue" />
              </div>
            </div>
            <h2 className="stat-card-value">
              Rs. {totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h2>
            <span className="stat-card-subtitle">Total platform task payments</span>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-card-title">Platform Commission</span>
              <div className="stat-icon-wrapper bg-purple-light">
                <CreditCard size={18} className="text-purple" />
              </div>
            </div>
            <h2 className="stat-card-value">
              Rs. {platformFees.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h2>
            <span className="stat-card-subtitle">15% CareDrop service revenue</span>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-card-title">Held in Escrow</span>
              <div className="stat-icon-wrapper bg-amber-light">
                <Lock size={18} className="text-warning" />
              </div>
            </div>
            <h2 className="stat-card-value">
              Rs. {heldEscrow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h2>
            <span className="stat-card-subtitle">Pending active task completion</span>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-card-title">Disbursed Payouts</span>
              <div className="stat-icon-wrapper bg-emerald-light">
                <ArrowUpRight size={18} className="text-success" />
              </div>
            </div>
            <h2 className="stat-card-value">
              Rs. {totalDisbursed.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h2>
            <span className="stat-card-subtitle">Net earnings sent to helpers</span>
          </div>
        </div>
      )}

      {/* Table + Detail Panel split layout */}
      <div className={`grid grid-cols-1 ${selectedTransaction ? 'lg:grid-cols-3' : 'grid-cols-1'} gap-6 items-start`}>
        <div className={selectedTransaction ? 'lg:col-span-2' : 'w-full'}>
          <PaymentsTable
            transactions={transactions}
            isLoading={!isLoaded}
            onSelectTransaction={handleSelectTransaction}
            selectedTransactionId={selectedTransaction?.id}
          />
        </div>

        {selectedTransaction && (
          <div className="lg:col-span-1 w-full">
            <TransactionDetailPanel
              transaction={selectedTransaction}
              onClose={() => setSelectedTransaction(null)}
              onSimulateRefund={handleSimulateRefund}
              onSimulatePayout={handleSimulatePayout}
            />
          </div>
        )}
      </div>
    </div>
  );
};
