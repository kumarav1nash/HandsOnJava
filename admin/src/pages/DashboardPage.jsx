import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  BookOpen, 
  Code, 
  Users, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  Plus,
  Eye,
  Edit,
  BarChart3,
  Activity,
  ChevronRight
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { useAuthStore } from '../stores/authStore'

const DashboardPage = () => {
  const [quickStats, setQuickStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    totalProblems: 0,
    activeUsers: 0,
    recentActivity: []
  })

  const { token } = useAuthStore()

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const headers = {}
      if (token) headers['Authorization'] = `Bearer ${token}`
      const response = await fetch('/api/admin/dashboard/stats', {
        headers,
      })
      if (!response.ok) throw new Error('Failed to fetch dashboard data')
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  useEffect(() => {
    if (error) {
      toast.error('Failed to load dashboard data')
    }
  }, [error])

  useEffect(() => {
    if (dashboardData) {
      setQuickStats(dashboardData)
    }
  }, [dashboardData])

  const stats = [
    {
      name: 'Total Courses',
      value: quickStats.totalCourses,
      change: '+12%',
      changeType: 'increase',
      icon: BookOpen,
      color: 'blue',
      description: 'All courses in the system'
    },
    {
      name: 'Published Courses',
      value: quickStats.publishedCourses,
      change: '+8%',
      changeType: 'increase',
      icon: Eye,
      color: 'green',
      description: 'Courses available to users'
    },
    {
      name: 'Total Problems',
      value: quickStats.totalProblems,
      change: '+15%',
      changeType: 'increase',
      icon: Code,
      color: 'purple',
      description: 'Programming problems created'
    },
    {
      name: 'Active Users',
      value: quickStats.activeUsers,
      change: '+23%',
      changeType: 'increase',
      icon: Users,
      color: 'orange',
      description: 'Users active this month'
    }
  ]

  const quickActions = [
    {
      title: 'Create Course',
      description: 'Start building a new course',
      icon: Plus,
      href: '/courses/create',
      color: 'blue'
    },
    {
      title: 'Add Problem',
      description: 'Create a new programming problem',
      icon: Code,
      href: '/problems/create',
      color: 'green'
    },
    {
      title: 'View Analytics',
      description: 'Check detailed system analytics',
      icon: BarChart3,
      href: '/analytics',
      color: 'purple'
    },
    {
      title: 'System Settings',
      description: 'Configure system preferences',
      icon: Activity,
      href: '/settings',
      color: 'orange'
    }
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'course',
      action: 'created',
      title: 'Advanced Java Concepts',
      user: 'John Doe',
      time: '2 hours ago',
      icon: BookOpen,
      color: 'blue'
    },
    {
      id: 2,
      type: 'problem',
      action: 'updated',
      title: 'Binary Tree Traversal',
      user: 'Jane Smith',
      time: '4 hours ago',
      icon: Code,
      color: 'green'
    },
    {
      id: 3,
      type: 'course',
      action: 'published',
      title: 'React Fundamentals',
      user: 'Mike Johnson',
      time: '6 hours ago',
      icon: Eye,
      color: 'purple'
    },
    {
      id: 4,
      type: 'user',
      action: 'registered',
      title: 'New user registration',
      user: 'Sarah Wilson',
      time: '8 hours ago',
      icon: Users,
      color: 'orange'
    }
  ]

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600'
    }
    return colors[color] || colors.blue
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with your courses and content.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(stat.color)}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
              <Link
                to="/analytics"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View all analytics →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.title}
                    to={action.href}
                    className="group flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getColorClasses(action.color)} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary-700">
                        {action.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600" />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              <Link
                to="/audit-log"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View all activity →
              </Link>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = activity.icon
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getColorClasses(activity.color)}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.user} {activity.action} {activity.type}
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{activity.title}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                  Healthy
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Backup</span>
                <span className="text-sm text-gray-900">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Uptime</span>
                <span className="text-sm text-gray-900">99.9%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">CPU Usage</span>
                  <span className="text-sm font-medium text-gray-900">23%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '23%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Memory</span>
                  <span className="text-sm font-medium text-gray-900">67%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Storage</span>
                  <span className="text-sm font-medium text-gray-900">45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
