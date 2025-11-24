import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Save, RefreshCw, Shield, Bell, Database, Key, Mail, Globe } from 'lucide-react';
import { adminApi } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import SuccessMessage from '../../components/common/SuccessMessage';
import './SettingsPage.css';

const SettingsPage = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({});
  const [originalSettings, setOriginalSettings] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  const { data: currentSettings, isLoading, error } = useQuery({
    queryKey: ['settings'],
    queryFn: () => adminApi.getSettings(),
    enabled: !!token,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (updatedSettings) => adminApi.updateSettings(updatedSettings),
    onSuccess: () => {
      queryClient.invalidateQueries(['settings']);
      setHasChanges(false);
      setSuccess('Settings updated successfully');
    },
    onError: (error) => {
      setError(error.message || 'Failed to update settings');
    },
  });

  const [success, setSuccess] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (currentSettings) {
      setSettings(currentSettings);
      setOriginalSettings(currentSettings);
    }
  }, [currentSettings]);

  useEffect(() => {
    if (JSON.stringify(settings) !== JSON.stringify(originalSettings)) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  }, [settings, originalSettings]);

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    updateSettingsMutation.mutate(settings);
  };

  const handleReset = () => {
    setSettings(originalSettings);
    setHasChanges(false);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'api', label: 'API', icon: Key },
    { id: 'email', label: 'Email', icon: Mail },
  ];

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load settings" />;

  const SettingInput = ({ section, key, label, type = 'text', options = [], placeholder = '' }) => (
    <div className="setting-item">
      <label className="setting-label">{label}</label>
      {type === 'select' ? (
        <select
          value={settings[section]?.[key] || ''}
          onChange={(e) => handleSettingChange(section, key, e.target.value)}
          className="setting-select"
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      ) : type === 'checkbox' ? (
        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={settings[section]?.[key] || false}
            onChange={(e) => handleSettingChange(section, key, e.target.checked)}
          />
          <span className="checkbox-slider"></span>
        </label>
      ) : type === 'textarea' ? (
        <textarea
          value={settings[section]?.[key] || ''}
          onChange={(e) => handleSettingChange(section, key, e.target.value)}
          className="setting-textarea"
          placeholder={placeholder}
          rows={4}
        />
      ) : (
        <input
          type={type}
          value={settings[section]?.[key] || ''}
          onChange={(e) => handleSettingChange(section, key, e.target.value)}
          className="setting-input"
          placeholder={placeholder}
        />
      )}
    </div>
  );

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <div className="page-actions">
          {hasChanges && (
            <>
              <button onClick={handleReset} className="btn btn-secondary">
                <RefreshCw size={16} />
                Reset Changes
              </button>
              <button onClick={handleSave} className="btn btn-primary" disabled={updateSettingsMutation.isLoading}>
                <Save size={16} />
                {updateSettingsMutation.isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}
        </div>
      </div>

      {success && <SuccessMessage message={success} onClose={() => setSuccess('')} />}
      {errorMessage && <ErrorMessage message={errorMessage} onClose={() => setErrorMessage('')} />}

      <div className="settings-container">
        <div className="settings-sidebar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="settings-content">
          {activeTab === 'general' && (
            <div className="settings-section">
              <h2 className="section-title">General Settings</h2>
              <SettingInput
                section="general"
                key="siteName"
                label="Site Name"
                placeholder="Enter site name"
              />
              <SettingInput
                section="general"
                key="siteDescription"
                label="Site Description"
                type="textarea"
                placeholder="Enter site description"
              />
              <SettingInput
                section="general"
                key="timezone"
                label="Timezone"
                type="select"
                options={[
                  { value: 'UTC', label: 'UTC' },
                  { value: 'America/New_York', label: 'Eastern Time' },
                  { value: 'America/Chicago', label: 'Central Time' },
                  { value: 'America/Denver', label: 'Mountain Time' },
                  { value: 'America/Los_Angeles', label: 'Pacific Time' },
                ]}
              />
              <SettingInput
                section="general"
                key="maintenanceMode"
                label="Maintenance Mode"
                type="checkbox"
              />
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section">
              <h2 className="section-title">Security Settings</h2>
              <SettingInput
                section="security"
                key="sessionTimeout"
                label="Session Timeout (minutes)"
                type="number"
                placeholder="60"
              />
              <SettingInput
                section="security"
                key="maxLoginAttempts"
                label="Max Login Attempts"
                type="number"
                placeholder="5"
              />
              <SettingInput
                section="security"
                key="lockoutDuration"
                label="Lockout Duration (minutes)"
                type="number"
                placeholder="30"
              />
              <SettingInput
                section="security"
                key="requireStrongPasswords"
                label="Require Strong Passwords"
                type="checkbox"
              />
              <SettingInput
                section="security"
                key="enableTwoFactor"
                label="Enable Two-Factor Authentication"
                type="checkbox"
              />
              <SettingInput
                section="security"
                key="enableAuditLogging"
                label="Enable Audit Logging"
                type="checkbox"
              />
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2 className="section-title">Notification Settings</h2>
              <SettingInput
                section="notifications"
                key="emailNotifications"
                label="Email Notifications"
                type="checkbox"
              />
              <SettingInput
                section="notifications"
                key="smsNotifications"
                label="SMS Notifications"
                type="checkbox"
              />
              <SettingInput
                section="notifications"
                key="pushNotifications"
                label="Push Notifications"
                type="checkbox"
              />
              <SettingInput
                section="notifications"
                key="newUserNotifications"
                label="Notify on New User Registration"
                type="checkbox"
              />
              <SettingInput
                section="notifications"
                key="courseCompletionNotifications"
                label="Notify on Course Completion"
                type="checkbox"
              />
            </div>
          )}

          {activeTab === 'database' && (
            <div className="settings-section">
              <h2 className="section-title">Database Settings</h2>
              <SettingInput
                section="database"
                key="backupEnabled"
                label="Enable Automatic Backups"
                type="checkbox"
              />
              <SettingInput
                section="database"
                key="backupFrequency"
                label="Backup Frequency"
                type="select"
                options={[
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'monthly', label: 'Monthly' },
                ]}
              />
              <SettingInput
                section="database"
                key="backupRetention"
                label="Backup Retention (days)"
                type="number"
                placeholder="30"
              />
              <SettingInput
                section="database"
                key="connectionTimeout"
                label="Connection Timeout (seconds)"
                type="number"
                placeholder="30"
              />
            </div>
          )}

          {activeTab === 'api' && (
            <div className="settings-section">
              <h2 className="section-title">API Settings</h2>
              <SettingInput
                section="api"
                key="rateLimitEnabled"
                label="Enable Rate Limiting"
                type="checkbox"
              />
              <SettingInput
                section="api"
                key="rateLimitRequests"
                label="Rate Limit (requests per minute)"
                type="number"
                placeholder="100"
              />
              <SettingInput
                section="api"
                key="enableCORS"
                label="Enable CORS"
                type="checkbox"
              />
              <SettingInput
                section="api"
                key="apiVersion"
                label="API Version"
                type="select"
                options={[
                  { value: 'v1', label: 'Version 1' },
                  { value: 'v2', label: 'Version 2' },
                ]}
              />
            </div>
          )}

          {activeTab === 'email' && (
            <div className="settings-section">
              <h2 className="section-title">Email Settings</h2>
              <SettingInput
                section="email"
                key="smtpHost"
                label="SMTP Host"
                placeholder="smtp.gmail.com"
              />
              <SettingInput
                section="email"
                key="smtpPort"
                label="SMTP Port"
                type="number"
                placeholder="587"
              />
              <SettingInput
                section="email"
                key="smtpSecure"
                label="SMTP Secure"
                type="checkbox"
              />
              <SettingInput
                section="email"
                key="fromEmail"
                label="From Email"
                type="email"
                placeholder="noreply@example.com"
              />
              <SettingInput
                section="email"
                key="fromName"
                label="From Name"
                placeholder="Your App Name"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;