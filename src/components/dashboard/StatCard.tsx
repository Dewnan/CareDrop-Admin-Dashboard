import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  isPositiveTrend?: boolean;
  icon: React.ReactNode;
  iconBgColor?: string;
}

// Summary metric card displaying primary KPIs matching Frame 38 layout
export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  isPositiveTrend = true,
  icon,
  iconBgColor = 'bg-blue-light',
}) => {
  return (
    <article className="kpi-stat-card">
      <div className="kpi-card-top">
        <div className={`kpi-icon-box ${iconBgColor}`}>
          {icon}
        </div>
        {trend && (
          <div className={`kpi-trend-pill ${isPositiveTrend ? 'trend-up' : 'trend-down'}`}>
            {isPositiveTrend ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>{trend}</span>
          </div>
        )}
      </div>

      <div className="kpi-card-content">
        <h3 className="kpi-value">{value}</h3>
        <p className="kpi-title">{title}</p>
        {subtitle && <p className="kpi-subtitle">{subtitle}</p>}
      </div>
    </article>
  );
};
