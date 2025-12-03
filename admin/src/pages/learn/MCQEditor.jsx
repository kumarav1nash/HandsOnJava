import React, { useState } from 'react'
import { Plus, Trash2, CheckCircle } from 'lucide-react'
import { adminLearnApi } from '../../services/api'
import { toast } from 'sonner'

const MCQEditor = ({ onCreated }) => {
  const [title, setTitle] = useState('')
  const [questions, setQuestions] = useState([])
  const [qInput, setQInput] = useState({ prompt: '', options: [], explanation: '' })
  const [optInput, setOptInput] = useState('')
  const [saving, setSaving] = useState(false)

  const addOption = () => {
    if (!optInput.trim()) return
    const id = `${Date.now()}`
    setQInput({ ...qInput, options: [...qInput.options, { id, text: optInput, correct: false }] })
    setOptInput('')
  }

  const toggleCorrect = (id) => {
    setQInput({ ...qInput, options: qInput.options.map(o => o.id === id ? { ...o, correct: !o.correct } : o) })
  }

  const removeOption = (id) => {
    setQInput({ ...qInput, options: qInput.options.filter(o => o.id !== id) })
  }

  const addQuestion = () => {
    if (!qInput.prompt.trim() || qInput.options.length === 0) return
    setQuestions([...questions, qInput])
    setQInput({ prompt: '', options: [], explanation: '' })
  }

  const removeQuestion = (idx) => setQuestions(questions.filter((_, i) => i !== idx))

  const handleSave = async () => {
    if (!title.trim() || questions.length === 0) {
      toast.error('Title and at least one question are required')
      return
    }
    setSaving(true)
    try {
      const payload = { title, questions }
      const res = await adminLearnApi.createMcq(payload)
      toast.success('MCQ set created')
      onCreated && onCreated(res?.id || res?.data?.id || payload.title)
    } catch (e) {
      toast.error('Failed to create MCQ')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md" />
      </div>

      <div className="p-4 border rounded">
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Question Prompt</label>
          import RichTextEditor from '../../components/RichTextEditor'

          // ... (inside component)

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Question Prompt</label>
            <RichTextEditor
              value={qInput.prompt}
              onChange={(val) => setQInput({ ...qInput, prompt: val })}
              height={200}
              placeholder="Enter question prompt..."
            />
          </div>
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
          <div className="flex gap-2">
            <input value={optInput} onChange={e => setOptInput(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-md" />
            <button type="button" onClick={addOption} className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2 space-y-2">
            {qInput.options.map(opt => (
              <div key={opt.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => toggleCorrect(opt.id)} className={`p-1 rounded ${opt.correct ? 'text-green-600' : 'text-gray-400'}`}>
                    <CheckCircle className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-gray-700">{opt.text}</span>
                </div>
                <button type="button" onClick={() => removeOption(opt.id)} className="text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Explanation</label>
          <textarea value={qInput.explanation} onChange={e => setQInput({ ...qInput, explanation: e.target.value })} rows={2} className="block w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
        <button type="button" onClick={addQuestion} className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white">Add Question</button>
      </div>

      <div className="space-y-2">
        {questions.map((q, idx) => (
          <div key={idx} className="p-3 border rounded">
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium text-gray-800">Question {idx + 1}</div>
              <button type="button" onClick={() => removeQuestion(idx)} className="text-red-600"><Trash2 className="h-4 w-4" /></button>
            </div>
            <div className="text-sm text-gray-700 mt-1">{q.prompt}</div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-primary-600 text-white rounded-md disabled:opacity-50">{saving ? 'Saving...' : 'Save MCQ'}</button>
      </div>
    </div>
  )
}

export default MCQEditor

