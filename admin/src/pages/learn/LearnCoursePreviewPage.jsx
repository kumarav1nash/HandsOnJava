import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react'
import { adminLearnApi } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'
import ConceptPreview from '../../components/preview/ConceptPreview'
import MCQPreview from '../../components/preview/MCQPreview'
import PracticePreview from '../../components/preview/PracticePreview'

const LearnCoursePreviewPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, error } = useQuery({
    queryKey: ['learn-course', id],
    queryFn: () => adminLearnApi.getCourse(id)
  })

  const course = data?.data || data || {}
  const modules = course.modules || []

  if (isLoading) return <LoadingSpinner size="large" text="Loading course..." fullScreen />
  if (error) return <ErrorMessage message="Failed to load course" />

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/learn/courses/builder')} className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Builder
              </button>
              <h1 className="text-xl font-semibold text-gray-900">{course.title || 'Course'}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {modules.length === 0 ? (
            <div className="text-sm text-gray-600">No modules in this course.</div>
          ) : (
            modules.map((m, idx) => (
              <ModulePreview key={idx} module={m} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}



const ModulePreview = ({ module }) => {
  const { type, refId } = module
  const { data } = useQuery({
    queryKey: ['learn-module', type, refId],
    queryFn: () => {
      if (type === 'concept') return adminLearnApi.getConcept(refId)
      if (type === 'mcq') return adminLearnApi.getMcq(refId)
      if (type === 'practice') return adminLearnApi.getPractice(refId)
      return Promise.resolve({})
    }
  })
  const payload = data?.data || data || {}

  if (type === 'concept') return <ConceptPreview concept={payload} />
  if (type === 'mcq') return <MCQPreview mcq={payload} />
  if (type === 'practice') return <PracticePreview practice={payload} />

  return null
}

export default LearnCoursePreviewPage
