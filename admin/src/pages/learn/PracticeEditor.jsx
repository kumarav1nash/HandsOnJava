import React, { useState } from 'react'
import { toast } from 'sonner'
import { adminLearnApi } from '../../services/api'
import RichTextEditor from '../../components/RichTextEditor'
import EditorPane from '../../components/preview/EditorPane'

const PracticeEditor = ({ onCreated }) => {
  const [title, setTitle] = useState('')
  const [goal, setGoal] = useState('')
  const [starterCode, setStarterCode] = useState('')
  const [stdin, setStdin] = useState('')
  const [expectedStdout, setExpectedStdout] = useState('')
  const [hint, setHint] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!title.trim() || !goal.trim()) {
      toast.error('Title and goal are required')
      return
    }
    setSaving(true)
    try {
      const payload = { title, goal, starterCode, stdin, expectedStdout, hint }
      const res = await adminLearnApi.createPractice(payload)
      toast.success('Practice created')
      onCreated && onCreated(res?.id || res?.data?.id || payload.title)
    } catch (e) {
      toast.error('Failed to create practice')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Goal</label>
          <RichTextEditor value={goal} onChange={setGoal} height={200} placeholder="Enter practice goal..." />
        </div>
      </div>

      <div className="h-64">
        <label className="block text-sm font-medium text-gray-700 mb-2">Starter Code</label>
        <EditorPane value={starterCode} onChange={setStarterCode} language="java" height="200px" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sample Input</label>
          <textarea value={stdin} onChange={e => setStdin(e.target.value)} rows={4} className="block w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Expected Output</label>
          <textarea value={expectedStdout} onChange={e => setExpectedStdout(e.target.value)} rows={4} className="block w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Hint</label>
        <textarea value={hint} onChange={e => setHint(e.target.value)} rows={3} className="block w-full px-3 py-2 border border-gray-300 rounded-md" />
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-primary-600 text-white rounded-md disabled:opacity-50">{saving ? 'Saving...' : 'Save Practice'}</button>
      </div>
    </div>
  )
}

export default PracticeEditor

