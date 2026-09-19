import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  Activity, 
  CheckCircle2, 
  CreditCard, 
  AlertTriangle, 
  LifeBuoy, 
  Star, 
  TrendingUp, 
  RotateCw,
  ArrowRight
} from 'lucide-react';

import { StatCard } from '../components/dashboard/StatCard';
import { Skeleton } from '../components/common/Skeleton';
import { dataService } from '../services/dataService';
import { useLiveData } from '../hooks/useLiveData';
import { NavTab } from '../components/layout/Sidebar';

interface DashboardPageProps {
  onNavigate: (tab: NavTab) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { metrics, logs: allLogs, isLoaded } = useLiveData();
  const logs = allLogs.slice(0, 3);

  const handleRefresh = () => {
    setIsRefreshing(true);
    dataService.subscribeToLiveData();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="dashboard-page-container">
      {/* Top Header Section */}
      <div className="page-title-header">
        <div>
          <h1 className="page-heading">Dashboard Overview</h1>
          <p className="page-subheading">
            Welcome back, Super Admin - Today is Wednesday, 22 Jul 2026
          </p>
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

      {/* 10 KPI Stat Cards Grid matching Frame 38 */}
      {!isLoaded || isRefreshing ? (
        <Skeleton variant="card" count={10} />
      ) : (
        <div className="kpi-grid-10">
          <StatCard
            title="Total Users"
            value={metrics.totalUsers.toLocaleString()}
            subtitle="+142 this week"
            trend={metrics.totalUsersTrend}
            icon={<Users size={20} className="text-primary" />}
            iconBgColor="bg-blue-light"
          />
          <StatCard
            title="Active Helpers"
            value={metrics.activeHelpers.toLocaleString()}
            subtitle={`${metrics.onlineHelpersCount} online now`}
            trend="+8%"
            icon={<UserCheck size={20} className="text-teal" />}
            iconBgColor="bg-teal-light"
          />
          <StatCard
            title="Active Tasks"
            value={metrics.activeTasks}
            subtitle="Right now"
            trend="+8%"
            icon={<Activity size={20} className="text-green" />}
            iconBgColor="bg-green-light"
          />

          <StatCard
            title="Completed Tasks"
            value={metrics.completedTasks.toLocaleString()}
            subtitle="All time"
            icon={<CheckCircle2 size={20} className="text-purple" />}
            iconBgColor="bg-purple-light"
          />
          <StatCard
            title="Total Transactions"
            value={metrics.totalTransactions}
            subtitle="This month"
            trend="+8%"
            icon={<CreditCard size={20} className="text-primary" />}
            iconBgColor="bg-blue-light"
          />
          <StatCard
            title="Pending Disputes"
            value={metrics.pendingDisputes}
            subtitle={`${metrics.escalatedDisputesCount} escalated`}
            icon={<AlertTriangle size={20} className="text-danger" />}
            iconBgColor="bg-red-light"
          />
          <StatCard
            title="Support Tickets"
            value={metrics.supportTickets}
            subtitle={`${metrics.unresolvedTicketsCount} unresolved`}
            icon={<LifeBuoy size={20} className="text-purple" />}
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
                <path
                  className="donut-segment segment-completed"
                  strokeDasharray="75, 100"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="3.8"
                />
              </svg>
              <div className="donut-center-text">
                <span className="donut-big-num">48.6K</span>
                <span className="donut-label">Total</span>
              </div>
            </div>

            <div className="donut-legend-list">
              <div className="legend-item">
                <span className="legend-color bg-amber" />
                <span className="legend-name">Active</span>
                <strong className="legend-value">{metrics.activeTasks}</strong>
              </div>
              <div className="legend-item">
                <span className="legend-color bg-green" />
                <span className="legend-name">Completed</span>
                <strong className="legend-value">48,620</strong>
              </div>
              <div className="legend-item">
                <span className="legend-color bg-danger" />
                <span className="legend-name">Cancelled</span>
                <strong className="legend-value">34</strong>
              </div>
              <div className="legend-item">
                <span className="legend-color bg-primary" />
                <span className="legend-name">Pending</span>
                <strong className="legend-value">127</strong>
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
                  <h4 className="summary-val text-primary">Rs. 1.24M</h4>
                </div>
                <div>
                  <span className="summary-label">Today</span>
                  <h4 className="summary-val text-success">Rs. 42.8K</h4>
                </div>

                <div>
                  <span className="summary-label">Disputes</span>
                  <h4 className="summary-val text-danger">23</h4>
                </div>
              </div>
            </div>
            <select className="form-select-sm">
              <option>This Month</option>
              <option>Last Month</option>
            </select>
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
                d="M 0 100 Q 50 80, 100 85 T 200 60 T 300 70 T 400 40 T 500 30 L 500 120 L 0 120 Z"
                fill="url(#chartGrad)"
              />
              <path
                d="M 0 100 Q 50 80, 100 85 T 200 60 T 300 70 T 400 40 T 500 30"
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
