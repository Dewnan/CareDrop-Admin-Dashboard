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
          <h1 className="page-heading">Financials</h1>
          <p className="page-subheading">
            Track gross transaction volume, and helper payout disbursements
          </p>
        </div>
      </div>

      {/* Financial Summary KPI Cards */}
      {!isLoaded ? (
        <Skeleton variant="card" count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50/50 border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider pr-2">Gross Volume</span>
              <div className="p-2 rounded-lg bg-white border border-slate-200 text-blue-600 shadow-2xs flex items-center justify-center shrink-0">
                <DollarSign size={18} />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Rs. {totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h2>
              <span className="text-xs text-slate-500 mt-1 block">Total platform task payments</span>
            </div>
          </div>

          <div className="bg-purple-50/50 border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider pr-2">Platform Commission</span>
              <div className="p-2 rounded-lg bg-white border border-slate-200 text-purple-600 shadow-2xs flex items-center justify-center shrink-0">
                <CreditCard size={18} />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Rs. {platformFees.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h2>
              <span className="text-xs text-slate-500 mt-1 block invisible" aria-hidden="true">Placeholder</span>
            </div>
          </div>

          <div className="bg-amber-50/50 border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider pr-2">On Hold</span>
              <div className="p-2 rounded-lg bg-white border border-slate-200 text-amber-600 shadow-2xs flex items-center justify-center shrink-0">
                <Lock size={18} />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Rs. {heldEscrow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h2>
              <span className="text-xs text-slate-500 mt-1 block">Pending active task completion</span>
            </div>
          </div>

          <div className="bg-emerald-50/50 border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider pr-2">Disbursed Payouts</span>
              <div className="p-2 rounded-lg bg-white border border-slate-200 text-emerald-600 shadow-2xs flex items-center justify-center shrink-0">
                <ArrowUpRight size={18} />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Rs. {totalDisbursed.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h2>
              <span className="text-xs text-slate-500 mt-1 block">Net earnings sent to helpers</span>
            </div>
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
