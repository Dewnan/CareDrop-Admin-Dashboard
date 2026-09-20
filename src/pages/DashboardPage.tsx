import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  Activity,
  CheckCircle2,
  CreditCard,
  AlertTriangle,
  LifeBuoy,
  RotateCw,
  ArrowRight
} from 'lucide-react';

import { StatCard } from '../components/dashboard/StatCard';
import { Skeleton } from '../components/common/Skeleton';
import { dataService } from '../services/dataService';
import { useLiveData } from '../hooks/useLiveData';
import { NavTab } from '../components/layout/Sidebar';
import { Transaction } from '../types';

interface DashboardPageProps {
  onNavigate: (tab: NavTab) => void;
}

const formatCurrencyShort = (val: number) => {
  if (val >= 1_000_000) return `Rs. ${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `Rs. ${(val / 1_000).toFixed(1)}K`;
  return `Rs. ${val.toFixed(2)}`;
};

const formatCompactNum = (num: number) => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
};

const generateTrendPath = (txns: Transaction[]) => {
  if (!txns || txns.length === 0) {
    return {
      area: "M 0 100 L 500 100 L 500 120 L 0 120 Z",
      line: "M 0 100 L 500 100"
    };
  }
  
  const pointsCount = 6;
  const stepX = 500 / (pointsCount - 1);
  const bucketSize = Math.max(1, Math.ceil(txns.length / pointsCount));
  
  const heights = Array.from({ length: pointsCount }, (_, i) => {
    const chunk = txns.slice(i * bucketSize, (i + 1) * bucketSize);
    return chunk.reduce((acc, t) => acc + (t.grossAmount || 0), 0);
  });
  
  const maxVal = Math.max(...heights, 1);
  const coords = heights.map((val, i) => ({
    x: Math.round(i * stepX),
    y: Math.round(100 - (val / maxVal) * 65),
  }));

  let lineD = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1];
    const curr = coords[i];
    const cpX = (prev.x + curr.x) / 2;
    lineD += ` Q ${cpX} ${prev.y}, ${curr.x} ${curr.y}`;
  }
  const areaD = `${lineD} L 500 120 L 0 120 Z`;
  return { area: areaD, line: lineD };
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { metrics, transactions, logs: allLogs, isLoaded } = useLiveData();
  const logs = allLogs.slice(0, 3);

  const handleRefresh = () => {
    setIsRefreshing(true);
    dataService.subscribeToLiveData();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const totalTasks = metrics.totalTasksCount || 0;
  const completedTasks = metrics.completedTasks || 0;
  const activeTasks = metrics.activeTasks || 0;
  const pendingTasks = metrics.pendingTasksCount || 0;
  const cancelledTasks = metrics.cancelledTasksCount || 0;

  const completedPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const activePct = totalTasks > 0 ? Math.round((activeTasks / totalTasks) * 100) : 0;
  const pendingPct = totalTasks > 0 ? Math.round((pendingTasks / totalTasks) * 100) : 0;
  const cancelledPct = totalTasks > 0 ? Math.round((cancelledTasks / totalTasks) * 100) : 0;

  const trendPaths = generateTrendPath(transactions);

  return (
    <div className="dashboard-page-container">
      {/* Top Header Section */}
      <div className="page-title-header">
        <div>
          <h1 className="page-heading">Dashboard Overview</h1>
        </div>
        <button
          type="button"
          className="btn-action btn-secondary"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RotateCw size={16} className={isRefreshing ? 'spin-anim' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stat Cards Grid matching Frame 38 */}
      {!isLoaded || isRefreshing ? (
        <Skeleton variant="card" count={7} />
      ) : (
        <div className="kpi-grid-10">
          <StatCard
            title="Total Users"
            value={metrics.totalUsers.toLocaleString()}
            icon={<Users size={18} className="text-primary" />}
            iconBgColor="bg-blue-light"
          />
          <StatCard
            title="Active Helpers"
            value={metrics.activeHelpers.toLocaleString()}
            subtitle={`${metrics.onlineHelpersCount} online now`}
            icon={<UserCheck size={18} className="text-teal" />}
            iconBgColor="bg-teal-light"
          />
          <StatCard
            title="Active Tasks"
            value={metrics.activeTasks}
            icon={<Activity size={18} className="text-green" />}
            iconBgColor="bg-green-light"
          />

          <StatCard
            title="Completed Tasks"
            value={metrics.completedTasks.toLocaleString()}
            subtitle="All time"
            icon={<CheckCircle2 size={18} className="text-purple" />}
            iconBgColor="bg-purple-light"
          />
          <StatCard
            title="Total Transactions"
            value={metrics.totalTransactions}
            icon={<CreditCard size={18} className="text-primary" />}
            iconBgColor="bg-blue-light"
          />
          <StatCard
            title="Pending Disputes"
            value={metrics.pendingDisputes}
            subtitle={`${metrics.escalatedDisputesCount} escalated`}
            icon={<AlertTriangle size={18} className="text-danger" />}
            iconBgColor="bg-red-light"
          />
          <StatCard
            title="Support Tickets"
            value={metrics.supportTickets}
            subtitle={`${metrics.unresolvedTicketsCount} unresolved`}
            icon={<LifeBuoy size={18} className="text-purple" />}
            iconBgColor="bg-purple-light"
          />
        </div>
      )}

      {/* Analytics & Overview Charts Grid */}
      <div className="charts-overview-grid">
        {/* Donut Chart: Task Status Overview */}
        <div className="chart-panel-card">
          <div className="panel-header-simple">
            <h3 className="panel-title">Task Status Overview</h3>
          </div>
          <div className="donut-chart-container">
            <div className="donut-svg-wrapper">
              <svg viewBox="0 0 36 36" className="donut-svg">
                <path
                  className="donut-ring"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="3.8"
                />
                {/* Completed segment */}
                {completedPct > 0 && (
                  <path
                    className="donut-segment segment-completed"
                    strokeDasharray={`${completedPct} 100`}
                    strokeDashoffset="0"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="3.8"
                  />
                )}
                {/* Active segment */}
                {activePct > 0 && (
                  <path
                    className="donut-segment segment-active"
                    strokeDasharray={`${activePct} 100`}
                    strokeDashoffset={`${-completedPct}`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="3.8"
                  />
                )}
                {/* Pending segment */}
                {pendingPct > 0 && (
                  <path
                    className="donut-segment segment-pending"
                    strokeDasharray={`${pendingPct} 100`}
                    strokeDashoffset={`${-(completedPct + activePct)}`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="3.8"
                  />
                )}
                {/* Cancelled segment */}
                {cancelledPct > 0 && (
                  <path
                    className="donut-segment segment-cancelled"
                    strokeDasharray={`${cancelledPct} 100`}
                    strokeDashoffset={`${-(completedPct + activePct + pendingPct)}`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="3.8"
                  />
                )}
              </svg>
              <div className="donut-center-text">
                <span className="donut-big-num">{formatCompactNum(totalTasks)}</span>
                <span className="donut-label">Total</span>
              </div>
            </div>

            <div className="donut-legend-list">
              <div className="legend-item">
                <span className="legend-color bg-amber" />
                <span className="legend-name">Active</span>
                <strong className="legend-value">{activeTasks.toLocaleString()}</strong>
              </div>
              <div className="legend-item">
                <span className="legend-color bg-green" />
                <span className="legend-name">Completed</span>
                <strong className="legend-value">{completedTasks.toLocaleString()}</strong>
              </div>
              <div className="legend-item">
                <span className="legend-color bg-danger" />
                <span className="legend-name">Cancelled</span>
                <strong className="legend-value">{cancelledTasks.toLocaleString()}</strong>
              </div>
              <div className="legend-item">
                <span className="legend-color bg-primary" />
                <span className="legend-name">Pending</span>
                <strong className="legend-value">{pendingTasks.toLocaleString()}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Line Trend Chart: Transaction Summary */}
        <div className="chart-panel-card">
          <div className="panel-header-flex">
            <div>
              <h3 className="panel-title">Transaction Summary</h3>
              <div className="flex-stats-summary">
                <div>
                  <span className="summary-label">Total</span>
                  <h4 className="summary-val text-primary">
                    {formatCurrencyShort(metrics.totalRevenueVal || 0)}
                  </h4>
                </div>
                <div>
                  <span className="summary-label">Today</span>
                  <h4 className="summary-val text-success">
                    {formatCurrencyShort(metrics.todayRevenueVal || 0)}
                  </h4>
                </div>

                <div>
                  <span className="summary-label">Disputes</span>
                  <h4 className="summary-val text-danger">{metrics.pendingDisputes}</h4>
                </div>
              </div>
            </div>
          </div>

          <div className="trend-svg-container">
            <svg viewBox="0 0 500 120" className="area-chart-svg">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={trendPaths.area}
                fill="url(#chartGrad)"
              />
              <path
                d={trendPaths.line}
                fill="none"
                stroke="#2563EB"
                strokeWidth="3"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Activity & Pending Actions */}
      <div className="bottom-dashboard-grid">
        <div className="panel-card">
          <div className="panel-header-flex">
            <h3 className="panel-title">Recent Operational Activity</h3>
            <button
              type="button"
              className="btn-link-action"
              onClick={() => onNavigate('settings')}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="recent-activity-list">
            {logs.map((log) => (
              <div key={log.id} className="activity-item-row">
                <div className="activity-icon-badge">
                  <CheckCircle2 size={16} className="text-teal" />
                </div>
                <div>
                  <p className="activity-text">
                    <strong>{log.target}</strong> - {log.action}
                  </p>
                  <small className="activity-time">{log.timestamp}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel-card">
          <div className="panel-header-simple">
            <h3 className="panel-title">Pending Actions Required</h3>
          </div>

          <div className="pending-actions-list">
            <div
              className="pending-action-item"
              onClick={() => onNavigate('support')}
            >
              <div className="action-item-left">
                <LifeBuoy size={20} className="text-purple" />
                <div>
                  <strong>Unresolved Support Tickets</strong>
                  <p className="action-sub">Customer inquiries pending</p>
                </div>
              </div>
              <span className="action-count-pill bg-purple-light text-purple">
                {metrics.unresolvedTicketsCount}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

