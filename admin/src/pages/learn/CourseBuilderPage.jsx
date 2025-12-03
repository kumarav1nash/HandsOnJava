import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminLearnApi } from '../../services/api'
import { Plus, GripVertical, Eye } from 'lucide-react'
import ConceptEditor from './ConceptEditor'
import MCQEditor from './MCQEditor'
import PracticeEditor from './PracticeEditor'

const CourseBuilderPage = () => {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [level, setLevel] = useState('Beginner')
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [modules, setModules] = useState([])
  const [activeEditor, setActiveEditor] = useState(null)

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (t) => setTags(tags.filter(x => x !== t))

  const addModule = (type, refId, label) => {
    setModules([...modules, { type, refId, label }])
    setActiveEditor(null)
  }

  const removeModule = (idx) => setModules(modules.filter((_, i) => i !== idx))

  const createCourseMutation = useMutation({
    mutationFn: async () => {
      const payload = { title, summary, level, tags, modules, status: 'DRAFT' }
      const res = await adminLearnApi.createCourse(payload)
      return res
    },
    onSuccess: (res) => {
      const id = res?.id || res?.data?.id
      toast.success('Course created')
      if (id) navigate(`/learn/courses/preview/${id}`)
    },
    onError: () => toast.error('Failed to create course')
  })

  const startEditor = (type) => setActiveEditor(type)

  const renderEditor = () => {
    if (activeEditor === 'concept') return <ConceptEditor onCreated={(id) => addModule('concept', id, 'Concept')} />
    if (activeEditor === 'mcq') return <MCQEditor onCreated={(id) => addModule('mcq', id, 'MCQ')} />
    if (activeEditor === 'practice') return <PracticeEditor onCreated={(id) => addModule('practice', id, 'Practice')} />
    return null
  }

  const { data: existingCoursesResp } = useQuery({
    queryKey: ['admin-learn-courses'],
    queryFn: () => adminLearnApi.listCourses()
  })
  const existingCourses = existingCoursesResp?.data || existingCoursesResp || []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-gray-900">Course Builder</h1>
            <div className="flex items-center gap-2">
              <button onClick={() => createCourseMutation.mutate()} disabled={createCourseMutation.isPending} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 disabled:opacity-50">
                {createCourseMutation.isPending ? 'Saving...' : 'Save & Preview'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                  <select value={level} onChange={e => setLevel(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                    <option>Mixed</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Summary</label>
                <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={3} className="block w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input value={tagInput} onChange={e => setTagInput(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-md" />
                  <button type="button" onClick={addTag} className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map(t => (
                    <span key={t} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{t}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Modules</h2>
                <div className="flex gap-2">
                  <button onClick={() => startEditor('concept')} className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white">Add Concept</button>
                  <button onClick={() => startEditor('mcq')} className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white">Add MCQ</button>
                  <button onClick={() => startEditor('practice')} className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white">Add Practice</button>
                </div>
              </div>
              {modules.length === 0 ? (
                <div className="text-sm text-gray-600">No modules yet. Add a Concept, MCQ, or Practice.</div>
              ) : (
                <div className="space-y-2">
                  {modules.map((m, idx) => (
                    <div key={`${m.type}-${m.refId}-${idx}`} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <div className="text-sm text-gray-800">{m.type.toUpperCase()}</div>
                        <div className="text-sm text-gray-500">{m.refId}</div>
                      </div>
                      <button onClick={() => removeModule(idx)} className="text-red-600">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {activeEditor && (
              <div className="bg-white rounded-lg border p-6">
                {renderEditor()}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
              <button onClick={() => createCourseMutation.mutate()} disabled={createCourseMutation.isPending} className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600">
                <Eye className="h-4 w-4 mr-2" />
                {createCourseMutation.isPending ? 'Saving...' : 'Save & Preview'}
              </button>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Existing Learn Courses</h2>
              {existingCourses.length === 0 ? (
                <div className="text-sm text-gray-600">No Learn courses yet.</div>
              ) : (
                <div className="space-y-2">
                  {existingCourses.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="text-sm text-gray-800 truncate">{c.title}</div>
                      <button onClick={() => navigate(`/learn/courses/preview/${c.id}`)} className="px-3 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200">Preview</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseBuilderPage
