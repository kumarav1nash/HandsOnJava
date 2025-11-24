import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Filter, Download, Search, Calendar, AlertTriangle, Shield, User, FileText, RefreshCw } from 'lucide-react';
import { adminApi } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import './AuditLogPage.css';

const AuditLogPage = () => {
  const { token } = useAuthStore();
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    userId: '',
    action: '',
    severity: '',
    ipAddress: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const { data: auditLogs, isLoading, error, refetch } = useQuery({
    queryKey: ['audit-logs', filters, currentPage, pageSize],
    queryFn: () => adminApi.getAuditLogs({
      ...filters,
      page: currentPage,
      limit: pageSize,
      search: searchTerm
    }),
    enabled: !!token,
  });

  const { data: summary } = useQuery({
    queryKey: ['audit-summary'],
    queryFn: () => adminApi.getAuditSummary(),
    enabled: !!token,
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleExport = async (format) => {
    try {
      const data = await adminApi.exportAuditLogs(format, filters);
      const blob = new Blob([data], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'severity-high';
      case 'medium': return 'severity-medium';
      case 'low': return 'severity-low';
      default: return 'severity-info';
    }
  };

  const getActionIcon = (action) => {
    if (action.includes('login')) return <Shield size={16} />;
    if (action.includes('user')) return <User size={16} />;
    if (action.includes('course') || action.includes('content')) return <FileText size={16} />;
    return <AlertTriangle size={16} />;
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load audit logs" />;

  return (
    <div className="audit-log-page">
      <div className="page-header">
        <h1 className="page-title">Audit Logs</h1>
        <div className="page-actions">
          <button onClick={() => refetch()} className="btn btn-secondary">
            <RefreshCw size={16} />
            Refresh
          </button>
          <div className="export-dropdown">
            <button className="btn btn-primary">
              <Download size={16} />
              Export
            </button>
            <div className="dropdown-content">
              <button onClick={() => handleExport('csv')}>Export as CSV</button>
              <button onClick={() => handleExport('json')}>Export as JSON</button>
            </div>
          </div>
        </div>
      </div>

      <div className="audit-summary">
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-icon high">
              <AlertTriangle size={24} />
            </div>
            <div className="summary-content">
              <h3>High Severity</h3>
              <p>{summary?.highSeverity || 0}</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon medium">
              <Shield size={24} />
            </div>
            <div className="summary-content">
              <h3>Medium Severity</h3>
              <p>{summary?.mediumSeverity || 0}</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon low">
              <User size={24} />
            </div>
            <div className="summary-content">
              <h3>Low Severity</h3>
              <p>{summary?.lowSeverity || 0}</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon total">
              <FileText size={24} />
            </div>
            <div className="summary-content">
              <h3>Total Events</h3>
              <p>{summary?.totalEvents || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="filters-header">
          <h3 className="filters-title">
            <Filter size={18} />
            Filters
          </h3>
        </div>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Search</label>
            <div className="search-input">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="filter-group">
            <label>Start Date</label>
            <div className="date-input">
              <Calendar size={16} />
              <input
                type="datetime-local"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
          </div>
          <div className="filter-group">
            <label>End Date</label>
            <div className="date-input">
              <Calendar size={16} />
              <input
                type="datetime-local"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
          </div>
          <div className="filter-group">
            <label>User ID</label>
            <input
              type="text"
              placeholder="User ID"
              value={filters.userId}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>Action</label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
            >
              <option value="">All Actions</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="view">View</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Severity</label>
            <select
              value={filters.severity}
              onChange={(e) => handleFilterChange('severity', e.target.value)}
            >
              <option value="">All Severities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="info">Info</option>
            </select>
          </div>
          <div className="filter-group">
            <label>IP Address</label>
            <input
              type="text"
              placeholder="IP Address"
              value={filters.ipAddress}
              onChange={(e) => handleFilterChange('ipAddress', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="audit-log-table">
        <div className="table-header">
          <h3 className="table-title">
            Audit Events ({auditLogs?.total || 0})
          </h3>
          <div className="pagination-info">
            Page {currentPage} of {Math.ceil((auditLogs?.total || 0) / pageSize)}
          </div>
        </div>
        
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Severity</th>
                <th>IP Address</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs?.logs?.map((log) => (
                <tr key={log.id} className={getSeverityColor(log.severity)}>
                  <td>
                    <div className="timestamp">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </td>
                  <td>
                    <div className="user-info">
                      <div className="user-name">{log.userName || 'Unknown'}</div>
                      <div className="user-id">{log.userId}</div>
                    </div>
                  </td>
                  <td>
                    <div className="action-info">
                      <div className="action-icon">{getActionIcon(log.action)}</div>
                      <div className="action-text">{log.action}</div>
                    </div>
                  </td>
                  <td>
                    <div className="resource-info">
                      <div className="resource-type">{log.resourceType}</div>
                      <div className="resource-id">{log.resourceId}</div>
                    </div>
                  </td>
                  <td>
                    <span className={`severity-badge ${log.severity}`}>
                      {log.severity}
                    </span>
                  </td>
                  <td>
                    <div className="ip-address">{log.ipAddress}</div>
                  </td>
                  <td>
                    <div className="details">
                      <div className="details-message">{log.message}</div>
                      {log.details && (
                        <details className="details-expand">
                          <summary>More details</summary>
                          <pre className="details-json">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {auditLogs?.logs?.length === 0 && (
          <div className="no-results">
            <FileText size={48} />
            <p>No audit logs found matching your filters.</p>
          </div>
        )}

        {auditLogs?.total > pageSize && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              Previous
            </button>
            <div className="page-numbers">
              {Array.from({ length: Math.min(5, Math.ceil(auditLogs.total / pageSize)) }, (_, i) => {
                const page = Math.max(1, currentPage - 2) + i;
                if (page > Math.ceil(auditLogs.total / pageSize)) return null;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage >= Math.ceil(auditLogs.total / pageSize)}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogPage;