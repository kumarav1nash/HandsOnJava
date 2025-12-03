import React, { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { adminLearnApi } from '../../services/api'
import { toast } from 'sonner'
import RichTextEditor from '../../components/RichTextEditor'
import EditorPane from '../../components/preview/EditorPane'

const ConceptEditor = ({ onCreated }) => {
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [overview, setOverview] = useState('')
  const [difficulty, setDifficulty] = useState('Beginner')
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [starterCode, setStarterCode] = useState('')
  const [steps, setSteps] = useState([])
  const [stepInput, setStepInput] = useState({ description: '', stdin: '', expectedStdout: '', hint: '' })
  const [saving, setSaving] = useState(false)

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (t) => setTags(tags.filter(x => x !== t))

  const addStep = () => {
    const d = stepInput.description.trim()
    if (!d) return
    const id = `${Date.now()}`
    setSteps([...steps, { id, ...stepInput }])
    setStepInput({ description: '', stdin: '', expectedStdout: '', hint: '' })
  }

  const removeStep = (id) => setSteps(steps.filter(s => s.id !== id))

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }
    setSaving(true)
    try {
      const payload = { title, summary, overview, tags, difficulty, starterCode, steps }
      const res = await adminLearnApi.createConcept(payload)
      toast.success('Concept created')
      onCreated && onCreated(res?.id || res?.data?.id || payload.title)
    } catch (e) {
      toast.error('Failed to create concept')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md">
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Summary</label>
        <input value={summary} onChange={e => setSummary(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Overview</label>
        <RichTextEditor value={overview} onChange={setOverview} height={300} placeholder="Enter concept overview..." />
      </div>

      <div className="h-64">
        <label className="block text-sm font-medium text-gray-700 mb-2">Starter Code</label>
        <EditorPane value={starterCode} onChange={setStarterCode} language="java" height="200px" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
        <div className="flex gap-2 mb-2">
          <input value={tagInput} onChange={e => setTagInput(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-md" />
          <button type="button" onClick={addTag} className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm bg-white">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map(t => (
            <span key={t} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {t}
              <button type="button" onClick={() => removeTag(t)} className="ml-1 text-blue-600">
                <Trash2 className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Steps</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
          <input placeholder="Description" value={stepInput.description} onChange={e => setStepInput({ ...stepInput, description: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-md" />
          <input placeholder="stdin" value={stepInput.stdin} onChange={e => setStepInput({ ...stepInput, stdin: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-md" />
          <input placeholder="expected stdout" value={stepInput.expectedStdout} onChange={e => setStepInput({ ...stepInput, expectedStdout: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-md" />
          <input placeholder="hint" value={stepInput.hint} onChange={e => setStepInput({ ...stepInput, hint: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-md" />
        </div>
        <button type="button" onClick={addStep} className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white">Add Step</button>
        <div className="mt-3 space-y-2">
          {steps.map(s => (
            <div key={s.id} className="p-2 border rounded">
              <div className="flex justify-between">
                <div className="text-sm text-gray-700">{s.description}</div>
                <button type="button" onClick={() => removeStep(s.id)} className="text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-primary-600 text-white rounded-md disabled:opacity-50">{saving ? 'Saving...' : 'Save Concept'}</button>
      </div>
    </div>
  )
}

export default ConceptEditor

