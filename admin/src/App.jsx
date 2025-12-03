import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import LoginPage from './pages/auth/LoginPage'
import AdminLayout from './components/layout/AdminLayout'
import DashboardPage from './pages/DashboardPage'
import CourseManagementPage from './pages/courses/CourseManagementPage'
import CourseCreatePage from './pages/courses/CourseCreatePage'
import CourseEditPage from './pages/courses/CourseEditPage'
import CoursePreviewPage from './pages/courses/CoursePreviewPage'
import ProblemManagementPage from './pages/problems/ProblemManagementPage'
import ProblemCreatePage from './pages/problems/ProblemCreatePage'
import ProblemEditPage from './pages/problems/ProblemEditPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import './App.css'
import CourseBuilderPage from './pages/learn/CourseBuilderPage'
import LearnCoursePreviewPage from './pages/learn/LearnCoursePreviewPage'

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
            <Route path="preview/:id" element={<CoursePreviewPage />} />
          </Route>

          {/* Learn Content Builder */}
          <Route path="learn">
            <Route path="courses/builder" element={<CourseBuilderPage />} />
            <Route path="courses/preview/:id" element={<LearnCoursePreviewPage />} />
          </Route>

          {/* Problem Management Routes */}
          <Route path="problems">
            <Route index element={<ProblemManagementPage />} />
            <Route path="create" element={<ProblemCreatePage />} />
            <Route path="edit/:id" element={<ProblemEditPage />} />
          </Route>


        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
