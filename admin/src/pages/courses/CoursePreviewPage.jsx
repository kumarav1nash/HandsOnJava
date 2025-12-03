import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, Clock, Award, FileText, Image as ImageIcon, Video, Tag, User } from 'lucide-react'
import DOMPurify from 'dompurify'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'
import { useAuthStore } from '../../stores/authStore'

const CoursePreviewPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = useAuthStore()

  const { data, isLoading, error } = useQuery({
    queryKey: ['course-preview', id],
    queryFn: async () => {
      const headers = {}
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`/api/admin/courses/${id}`, { headers })
      if (!res.ok) throw new Error('Failed to fetch course')
      return res.json()
    }
  })

  const course = data?.data || data || {}
  const attachments = course.attachments || []

  if (isLoading) {
    return <LoadingSpinner size="large" text="Loading course..." fullScreen />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/admin/courses')}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to Courses
                </button>
                <h1 className="text-xl font-semibold text-gray-900">Course Preview</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorMessage message="Failed to load course. Please try again." />
        </div>
      </div>
    )
  }

  const sanitizedContent = DOMPurify.sanitize(course.content || '')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/courses')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Courses
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Course Preview</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {course.thumbnail && (
            <div className="aspect-video bg-gray-200 flex items-center justify-center">
              <ImageIcon className="h-16 w-16 text-gray-400" />
            </div>
          )}

          <div className="p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title || 'Untitled Course'}</h1>
              <p className="text-lg text-gray-600">{course.shortDescription || 'No description provided'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Duration</p>
                  <p className="text-sm text-gray-500">{course.duration || 'Not specified'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Award className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Difficulty</p>
                  <p className="text-sm text-gray-500 capitalize">{course.difficulty || course.difficultyLevel || 'beginner'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Language</p>
                  <p className="text-sm text-gray-500">{course.language?.toUpperCase() || 'EN'}</p>
                </div>
              </div>
            </div>

            {Array.isArray(course.learningObjectives) && course.learningObjectives.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">What You'll Learn</h2>
                <ul className="space-y-2">
                  {course.learningObjectives.map((objective, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span className="text-blue-500 mt-1">•</span>
                      <span className="text-gray-700">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {sanitizedContent && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Content</h2>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
              </div>
            )}

            {attachments.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Materials</h2>
                <div className="space-y-2">
                  {attachments.map((file) => (
                    <div key={file.name + file.size} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      {String(file.type || '').startsWith('image/') && <ImageIcon className="h-5 w-5 text-gray-400" />}
                      {String(file.type || '').startsWith('video/') && <Video className="h-5 w-5 text-gray-400" />}
                      {!String(file.type || '').startsWith('image/') && !String(file.type || '').startsWith('video/') && <FileText className="h-5 w-5 text-gray-400" />}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        {file.size != null && <p className="text-xs text-gray-500">{file.size} bytes</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(course.tags) && course.tags.length > 0 && (
              <div className="mt-6 flex items-center flex-wrap gap-2">
                {course.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {course.instructor && (
              <div className="mt-6 flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-2" />
                <span>By {course.instructor}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoursePreviewPage

