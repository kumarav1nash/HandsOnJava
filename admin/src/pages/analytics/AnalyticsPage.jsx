import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Users, BookOpen, Clock, TrendingUp, FileText, Award, AlertCircle, CheckCircle } from 'lucide-react';
import { adminApi } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import './AnalyticsPage.css';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const AnalyticsPage = () => {
  const { token } = useAuthStore();
  const [dateRange, setDateRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('overview');

  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['analytics', dateRange],
    queryFn: () => adminApi.getAnalytics(dateRange),
    enabled: !!token,
  });

  const { data: auditSummary } = useQuery({
    queryKey: ['audit-summary', dateRange],
    queryFn: () => adminApi.getAuditSummary(dateRange),
    enabled: !!token,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load analytics data" />;

  const StatCard = ({ title, value, icon: Icon, trend, color }) => (
    <div className="stat-card">
      <div className="stat-header">
        <div className="stat-icon" style={{ backgroundColor: `${color}20`, color }}>
          <Icon size={24} />
        </div>
        {trend && (
          <div className={`stat-trend ${trend > 0 ? 'positive' : 'negative'}`}>
            <TrendingUp size={16} />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className="stat-content">
        <h3 className="stat-title">{title}</h3>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );

  const MetricChart = ({ title, data, dataKey, color }) => (
    <div className="chart-container">
      <h3 className="chart-title">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const PieChartComponent = ({ title, data }) => (
    <div className="chart-container">
      <h3 className="chart-title">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1 className="page-title">Analytics Dashboard</h1>
        <div className="page-actions">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="date-range-select"
          >
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      <div className="metrics-grid">
        <StatCard
          title="Total Users"
          value={analytics?.totalUsers || 0}
          icon={Users}
          trend={analytics?.userGrowth}
          color="#3b82f6"
        />
        <StatCard
          title="Active Courses"
          value={analytics?.activeCourses || 0}
          icon={BookOpen}
          trend={analytics?.courseGrowth}
          color="#10b981"
        />
        <StatCard
          title="Completion Rate"
          value={`${analytics?.completionRate || 0}%`}
          icon={Award}
          trend={analytics?.completionTrend}
          color="#f59e0b"
        />
        <StatCard
          title="Avg. Session Time"
          value={`${analytics?.avgSessionTime || 0}m`}
          icon={Clock}
          trend={analytics?.sessionTrend}
          color="#8b5cf6"
        />
      </div>

      <div className="charts-grid">
        <MetricChart
          title="User Activity Over Time"
          data={analytics?.userActivity || []}
          dataKey="activeUsers"
          color="#3b82f6"
        />
        <MetricChart
          title="Course Completions"
          data={analytics?.courseCompletions || []}
          dataKey="completions"
          color="#10b981"
        />
      </div>

      <div className="charts-grid">
        <PieChartComponent
          title="Course Distribution"
          data={analytics?.courseDistribution || []}
        />
        <div className="chart-container">
          <h3 className="chart-title">Recent Activity</h3>
          <div className="activity-list">
            {auditSummary?.recentActivity?.slice(0, 10).map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">
                  {activity.severity === 'high' ? (
                    <AlertCircle size={16} className="text-red-500" />
                  ) : (
                    <CheckCircle size={16} className="text-green-500" />
                  )}
                </div>
                <div className="activity-content">
                  <p className="activity-message">{activity.message}</p>
                  <p className="activity-time">{new Date(activity.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="security-summary">
        <h3 className="section-title">Security Summary</h3>
        <div className="security-stats">
          <div className="security-stat">
            <span className="stat-label">Failed Login Attempts</span>
            <span className="stat-value">{auditSummary?.failedLogins || 0}</span>
          </div>
          <div className="security-stat">
            <span className="stat-label">Suspicious Activities</span>
            <span className="stat-value">{auditSummary?.suspiciousActivities || 0}</span>
          </div>
          <div className="security-stat">
            <span className="stat-label">Permission Denials</span>
            <span className="stat-value">{auditSummary?.permissionDenials || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;