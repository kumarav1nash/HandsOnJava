import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import LoginPage from './pages/auth/LoginPage'
import AdminLayout from './components/layout/AdminLayout'
import DashboardPage from './pages/DashboardPage'
import CourseManagementPage from './pages/courses/CourseManagementPage'
import CourseCreatePage from './pages/courses/CourseCreatePage'
import CourseEditPage from './pages/courses/CourseEditPage'
import ProblemManagementPage from './pages/problems/ProblemManagementPage'
import ProblemCreatePage from './pages/problems/ProblemCreatePage'
import ProblemEditPage from './pages/problems/ProblemEditPage'
import AnalyticsPage from './pages/analytics/AnalyticsPage'
import SettingsPage from './pages/settings/SettingsPage'
import AuditLogPage from './pages/audit/AuditLogPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import './App.css'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />} 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          
          {/* Course Management Routes */}
          <Route path="courses">
            <Route index element={<CourseManagementPage />} />
            <Route path="create" element={<CourseCreatePage />} />
            <Route path="edit/:id" element={<CourseEditPage />} />
            <Route path="preview/:id" element={<div>Course Preview</div>} />
          </Route>
          
          {/* Problem Management Routes */}
          <Route path="problems">
            <Route index element={<ProblemManagementPage />} />
            <Route path="create" element={<ProblemCreatePage />} />
            <Route path="edit/:id" element={<ProblemEditPage />} />
          </Route>
          
          {/* Analytics and Settings */}
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="audit-log" element={<AuditLogPage />} />
        </Route>
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App