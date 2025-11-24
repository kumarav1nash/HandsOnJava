import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Upload,
  Download,
  BarChart3,
  Settings,
  AlertCircle,
  MoreVertical,
  Clock,
  CheckCircle,
  XCircle,
  Archive,
  RefreshCw,
  Copy,
  Share2,
  Star,
  Tag,
  Calendar,
  User
} from 'lucide-react'
import { toast } from 'sonner'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const CourseManagementPage = () => {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    difficulty: '',
    tags: [],
    category: '',
    instructor: '',
    dateRange: { start: '', end: '' }
  })
  const [selectedCourses, setSelectedCourses] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [sortBy, setSortBy] = useState('updatedAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)

  // Fetch courses with filters and pagination
  const { data: coursesData, isLoading, error } = useQuery({
    queryKey: ['courses', searchTerm, filters, currentPage, pageSize, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams({
        query: searchTerm,
        status: filters.status,
        difficultyLevel: filters.difficulty,
        tags: filters.tags.join(','),
        category: filters.category,
        instructor: filters.instructor,
        startDate: filters.dateRange.start,
        endDate: filters.dateRange.end,
        page: currentPage - 1,
        size: pageSize,
        sort: `${sortBy},${sortOrder}`
      })

      const response = await fetch(`/api/admin/courses/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      })
      if (!response.ok) throw new Error('Failed to fetch courses')
      return response.json()
    },
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  // Delete course mutation
  const deleteCourseMutation = useMutation({
    mutationFn: async (courseId) => {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      })
      if (!response.ok) throw new Error('Failed to delete course')
      return response.json()
    },
    onSuccess: () => {
      toast.success('Course deleted successfully')
      queryClient.invalidateQueries(['courses'])
    },
    onError: () => {
      toast.error('Failed to delete course')
    }
  })

  // Publish course mutation
  const publishCourseMutation = useMutation({
    mutationFn: async (courseId) => {
      const response = await fetch(`/api/admin/courses/${courseId}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      })
      if (!response.ok) throw new Error('Failed to publish course')
      return response.json()
    },
    onSuccess: () => {
      toast.success('Course published successfully')
      queryClient.invalidateQueries(['courses'])
    },
    onError: () => {
      toast.error('Failed to publish course')
    }
  })

  // Unpublish course mutation
  const unpublishCourseMutation = useMutation({
    mutationFn: async (courseId) => {
      const response = await fetch(`/api/admin/courses/${courseId}/unpublish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      })
      if (!response.ok) throw new Error('Failed to unpublish course')
      return response.json()
    },
    onSuccess: () => {
      toast.success('Course unpublished successfully')
      queryClient.invalidateQueries(['courses'])
    },
    onError: () => {
      toast.error('Failed to unpublish course')
    }
  })

  // Archive course mutation
  const archiveCourseMutation = useMutation({
    mutationFn: async (courseId) => {
      const response = await fetch(`/api/admin/courses/${courseId}/archive`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      })
      if (!response.ok) throw new Error('Failed to archive course')
      return response.json()
    },
    onSuccess: () => {
      toast.success('Course archived successfully')
      queryClient.invalidateQueries(['courses'])
    },
    onError: () => {
      toast.error('Failed to archive course')
    }
  })

  const handleDeleteCourse = (courseId) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      deleteCourseMutation.mutate(courseId)
    }
  }

  const handlePublishCourse = (courseId) => {
    publishCourseMutation.mutate(courseId)
  }

  const handleUnpublishCourse = (courseId) => {
    unpublishCourseMutation.mutate(courseId)
  }

  const handleArchiveCourse = (courseId) => {
    if (window.confirm('Are you sure you want to archive this course?')) {
      archiveCourseMutation.mutate(courseId)
    }
  }

  const handleCourseSelect = (courseId, selected) => {
    if (selected) {
      setSelectedCourses([...selectedCourses, courseId])
    } else {
      setSelectedCourses(selectedCourses.filter(id => id !== courseId))
    }
  }

  const handleSelectAll = (selected) => {
    if (selected) {
      setSelectedCourses(coursesData?.data?.map(course => course.id) || [])
    } else {
      setSelectedCourses([])
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PUBLISHED': return { bg: 'bg-green-100', text: 'text-green-800', badge: 'bg-green-100 text-green-800' }
      case 'DRAFT': return { bg: 'bg-yellow-100', text: 'text-yellow-800', badge: 'bg-yellow-100 text-yellow-800' }
      case 'IN_REVIEW': return { bg: 'bg-blue-100', text: 'text-blue-800', badge: 'bg-blue-100 text-blue-800' }
      case 'ARCHIVED': return { bg: 'bg-gray-100', text: 'text-gray-800', badge: 'bg-gray-100 text-gray-800' }
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', badge: 'bg-gray-100 text-gray-800' }
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'BEGINNER': return 'text-green-600 bg-green-100'
      case 'INTERMEDIATE': return 'text-orange-600 bg-orange-100'
      case 'ADVANCED': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const courses = coursesData?.data || []
  const totalPages = Math.ceil((coursesData?.total || 0) / pageSize)

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load courses</h3>
        <p className="text-gray-600 mb-6">Please try refreshing the page or contact support.</p>
        <button
          onClick={() => queryClient.invalidateQueries(['courses'])}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600 mt-1">
            Create, edit, and manage your courses with advanced tools and analytics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          {selectedCourses.length > 0 && (
            <button
              onClick={() => setShowBulkActions(true)}
              className="px-4 py-2 border border-orange-300 rounded-lg text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100"
            >
              Bulk Actions ({selectedCourses.length})
            </button>
          )}
          <Link
            to="/courses/create"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Course
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses by title, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="updatedAt">Last Updated</option>
            <option value="createdAt">Created Date</option>
            <option value="title">Title</option>
            <option value="status">Status</option>
            <option value="difficulty">Difficulty</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            title={`Sort ${sortOrder === 'desc' ? 'ascending' : 'descending'}`}
          >
            <RefreshCw className={`w-4 h-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Statuses</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                  <option value="IN_REVIEW">In Review</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Levels</option>
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Categories</option>
                  <option value="programming">Programming</option>
                  <option value="algorithms">Algorithms</option>
                  <option value="data-structures">Data Structures</option>
                  <option value="web-development">Web Development</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instructor</label>
                <input
                  type="text"
                  placeholder="Search by instructor..."
                  value={filters.instructor}
                  onChange={(e) => setFilters({ ...filters, instructor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setFilters({
                  status: '',
                  difficulty: '',
                  tags: [],
                  category: '',
                  instructor: '',
                  dateRange: { start: '', end: '' }
                })}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Clear Filters
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{coursesData?.total || 0}</p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-bold text-gray-900">
                {courses.filter(c => c.status === 'PUBLISHED').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Drafts</p>
              <p className="text-2xl font-bold text-gray-900">
                {courses.filter(c => c.status === 'DRAFT').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Archived</p>
              <p className="text-2xl font-bold text-gray-900">
                {courses.filter(c => c.status === 'ARCHIVED').length}
              </p>
            </div>
            <Archive className="w-8 h-8 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {selectedCourses.length > 0 && (
          <div className="p-6 border-b border-gray-200 bg-primary-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedCourses.length === courses.length && courses.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  {selectedCourses.length} courses selected
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    // Bulk publish
                    selectedCourses.forEach(id => handlePublishCourse(id))
                    setSelectedCourses([])
                  }}
                  className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Publish All
                </button>
                <button
                  onClick={() => {
                    // Bulk archive
                    selectedCourses.forEach(id => handleArchiveCourse(id))
                    setSelectedCourses([])
                  }}
                  className="px-3 py-1.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Archive All
                </button>
                <button
                  onClick={() => {
                    // Bulk delete
                    if (window.confirm(`Are you sure you want to delete ${selectedCourses.length} courses?`)) {
                      selectedCourses.forEach(id => handleDeleteCourse(id))
                      setSelectedCourses([])
                    }
                  }}
                  className="px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete All
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filters.status || filters.difficulty || filters.tags.length > 0
                  ? "Try adjusting your search criteria or filters"
                  : "Get started by creating your first course"
                }
              </p>
              {!searchTerm && filters.status === '' && filters.difficulty === '' && filters.tags.length === 0 && (
                <Link
                  to="/courses/create"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 mx-auto w-fit"
                >
                  <Plus className="w-4 h-4" />
                  Create Your First Course
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const statusColor = getStatusColor(course.status)
                const difficultyColor = getDifficultyColor(course.difficultyLevel)
                
                return (
                  <div key={course.id} className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedCourses.includes(course.id)}
                            onChange={(e) => handleCourseSelect(course.id, e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-primary-600" />
                          </div>
                        </div>
                        <div className="relative group">
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <Link
                              to={`/courses/edit/${course.id}`}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Course
                            </Link>
                            <Link
                              to={`/courses/preview/${course.id}`}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Preview Course
                            </Link>
                            <div className="border-t border-gray-200 my-1"></div>
                            {course.status === 'DRAFT' && (
                              <button
                                onClick={() => handlePublishCourse(course.id)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Publish Course
                              </button>
                            )}
                            {course.status === 'PUBLISHED' && (
                              <button
                                onClick={() => handleUnpublishCourse(course.id)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Unpublish Course
                              </button>
                            )}
                            <button
                              onClick={() => handleArchiveCourse(course.id)}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Archive className="w-4 h-4 mr-2" />
                              Archive Course
                            </button>
                            <div className="border-t border-gray-200 my-1"></div>
                            <button
                              onClick={() => handleDeleteCourse(course.id)}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Course
                            </button>
                          </div>
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

                      <div className="flex items-center justify-between mb-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor.badge}`}>
                          {course.status}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${difficultyColor}`}>
                          {course.difficultyLevel}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          Updated {new Date(course.updatedAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          By {course.instructor || 'Admin'}
                        </div>
                        {course.tags && course.tags.length > 0 && (
                          <div className="flex items-center">
                            <Tag className="w-4 h-4 mr-2" />
                            <div className="flex flex-wrap gap-1">
                              {course.tags.slice(0, 2).map((tag, index) => (
                                <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                  {tag}
                                </span>
                              ))}
                              {course.tags.length > 2 && (
                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                  +{course.tags.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, coursesData?.total || 0)} of {coursesData?.total || 0} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 text-sm border rounded-lg ${
                        pageNum === currentPage
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CourseManagementPage