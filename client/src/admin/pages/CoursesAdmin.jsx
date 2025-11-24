import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { listAdminCourses, createCourse, upsertCourse, deleteCourse, addPage, updatePage, deletePage, addSection, updateSection, deleteSection, setConcept, setCode, addQuestion, updateQuestion, deleteQuestion, addOption, updateOption, deleteOption } from '../../services/coursesAdminApi'
import { listProblems } from '../../services/problemsClient'

export default function CoursesAdmin() {
  const [courses, setCourses] = useState([])
  const [course, setCourse] = useState({ id: '', title: '', summary: '', level: 'Beginner' })
  const [selectedPage, setSelectedPage] = useState(null)
  const [newPage, setNewPage] = useState({ title: '', position: 1 })
  const [newSection, setNewSection] = useState({ type: 'CONCEPT', position: 1 })
  const [conceptContent, setConceptContent] = useState('')
  const [codeProblemId, setCodeProblemId] = useState('')
  const [problems, setProblems] = useState([])
  const [mcq, setMcq] = useState({ prompt: '', explanation: '', options: [] })
  const [selectedQuestionId, setSelectedQuestionId] = useState(null)

  const load = useCallback(async () => {
    try {
      const data = await listAdminCourses()
      setCourses(data)
    } catch (e) {
      console.error(e)
      toast.error('Failed to load courses')
    }
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    (async () => { try { setProblems(await listProblems()) } catch {} })()
  }, [])

  const onCreate = async () => {
    try {
      if (!course.id || !course.title) { toast.error('Course id and title required'); return }
      await createCourse(course)
      toast.success('Course created')
      await load()
    } catch (e) { console.error(e); toast.error('Failed to create course') }
  }

  const onUpdate = async () => {
    try { await upsertCourse(course); toast.success('Course saved'); await load() } catch (e) { console.error(e); toast.error('Failed to save course') }
  }

  const onDelete = async () => {
    try { await deleteCourse(course.id); toast.success('Course deleted'); setCourse({ id: '', title: '', summary: '', level: 'Beginner' }); await load() } catch (e) { console.error(e); toast.error('Failed to delete course') }
  }

  const onAddPage = async () => {
    try {
      if (!course.id) { toast.error('Select a course first'); return }
      const created = await addPage(course.id, { title: newPage.title, position: Number(newPage.position) || 1 })
      setSelectedPage(created)
      toast.success('Page added')
      setNewPage({ title: '', position: 1 })
    } catch (e) { console.error(e); toast.error('Failed to add page') }
  }

  const onAddSection = async () => {
    try {
      if (!selectedPage?.id) { toast.error('Select a page first'); return }
      const section = await addSection(selectedPage.id, { type: newSection.type, position: Number(newSection.position) || 1 })
      toast.success('Section added')
      if (newSection.type === 'CONCEPT' && conceptContent) {
        await setConcept(section.id, { content: conceptContent })
        toast.success('Concept content saved')
        setConceptContent('')
      }
      if (newSection.type === 'CODE' && codeProblemId) {
        await setCode(section.id, { problemId: codeProblemId })
        toast.success('Code section linked')
        setCodeProblemId('')
      }
    } catch (e) { console.error(e); toast.error('Failed to add section') }
  }

  const onAddQuestion = async () => {
    try {
      const sectionId = selectedPage?.id ? await ensureLatestSectionIdForType(selectedPage.id, 'MCQ') : null
      if (!sectionId) { toast.error('Add an MCQ section first'); return }
      const q = await addQuestion(sectionId, { prompt: mcq.prompt, explanation: mcq.explanation })
      setSelectedQuestionId(q.id)
      toast.success('Question added')
    } catch (e) { console.error(e); toast.error('Failed to add question') }
  }

  const onAddOption = async () => {
    try {
      if (!selectedQuestionId) { toast.error('Add/select a question first'); return }
      const optionText = prompt('Option text:') || ''
      const correct = !!confirm('Mark correct? OK=yes, Cancel=no')
      await addOption(selectedQuestionId, { text: optionText, correct })
      toast.success('Option added')
    } catch (e) { console.error(e); toast.error('Failed to add option') }
  }

  async function ensureLatestSectionIdForType(pageId, type) {
    // Placeholder: backend doesn’t expose page fetch; rely on last created section kept in client state
    // In future we can fetch page with sections to select precisely
    return null
  }

  return (
    <div className="admin-content-page">
      <header className="admin-section-header">
        <h3>Courses</h3>
        <p className="muted">Create courses, pages, and add sections (Concept, MCQ, Code)</p>
      </header>

      <div className="panel">
        <div className="panel__header">
          <nav className="subtabs" role="tablist" aria-label="Courses management">
            <button className="btn btn--ghost active" disabled>Courses</button>
          </nav>
        </div>
        <div className="panel__content grid-two" aria-live="polite">
          <section>
            <h4>Course</h4>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-md)' }}>
              <div>
                <label htmlFor="courseId">Course ID</label>
                <input id="courseId" className="input" value={course.id} onChange={e => setCourse({ ...course, id: e.target.value })} placeholder="e.g., java-oop" />
              </div>
              <div>
                <label htmlFor="courseSelect">Existing Courses</label>
                <select id="courseSelect" className="input" value={course.id} onChange={e => {
                  const id = e.target.value
                  setCourse(courses.find(c => c.id === id) || { id, title: '', summary: '', level: 'Beginner' })
                }}>
                  <option value="">Select…</option>
                  {courses.map(c => (<option key={c.id} value={c.id}>{c.id} — {c.title}</option>))}
                </select>
              </div>
              <div style={{ gridColumn: '1 / span 2' }}>
                <label htmlFor="title">Title</label>
                <input id="title" className="input" value={course.title} onChange={e => setCourse({ ...course, title: e.target.value })} />
              </div>
              <div style={{ gridColumn: '1 / span 2' }}>
                <label htmlFor="summary">Summary</label>
                <textarea id="summary" className="input" rows={2} value={course.summary} onChange={e => setCourse({ ...course, summary: e.target.value })} />
              </div>
              <div>
                <label htmlFor="level">Level</label>
                <select id="level" className="input" value={course.level} onChange={e => setCourse({ ...course, level: e.target.value })}>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                  <option>Mixed</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: 'var(--space-md)', display: 'flex', gap: 'var(--space-sm)' }}>
              <button className="btn" onClick={onCreate} disabled={!course.id || !course.title}>Create</button>
              <button className="btn" onClick={onUpdate} disabled={!course.id}>Save</button>
              <button className="btn btn--danger" onClick={onDelete} disabled={!course.id}>Delete</button>
            </div>
          </section>

          <section>
            <h4>Pages & Sections</h4>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-md)' }}>
              <div>
                <label htmlFor="pageTitle">New Page Title</label>
                <input id="pageTitle" className="input" value={newPage.title} onChange={e => setNewPage({ ...newPage, title: e.target.value })} />
              </div>
              <div>
                <label htmlFor="pagePos">Position</label>
                <input id="pagePos" className="input" type="number" value={newPage.position} onChange={e => setNewPage({ ...newPage, position: e.target.value })} />
              </div>
              <div style={{ gridColumn: '1 / span 2' }}>
                <button className="btn" onClick={onAddPage} disabled={!course.id || !newPage.title}>Add Page</button>
              </div>
              <div style={{ gridColumn: '1 / span 2' }}>
                <label htmlFor="selectedPage">Selected Page</label>
                <input id="selectedPage" className="input" value={selectedPage?.title || ''} onChange={() => {}} placeholder="Shown after creation" disabled />
              </div>

              <div>
                <label htmlFor="sectionType">Section Type</label>
                <select id="sectionType" className="input" value={newSection.type} onChange={e => setNewSection({ ...newSection, type: e.target.value })}>
                  <option value="CONCEPT">Concept</option>
                  <option value="MCQ">MCQ</option>
                  <option value="CODE">Code</option>
                </select>
              </div>
              <div>
                <label htmlFor="sectionPos">Section Position</label>
                <input id="sectionPos" className="input" type="number" value={newSection.position} onChange={e => setNewSection({ ...newSection, position: e.target.value })} />
              </div>
              {newSection.type === 'CONCEPT' && (
                <div style={{ gridColumn: '1 / span 2' }}>
                  <label htmlFor="conceptContent">Concept Content</label>
                  <textarea id="conceptContent" className="input" rows={4} value={conceptContent} onChange={e => setConceptContent(e.target.value)} />
                </div>
              )}
              {newSection.type === 'CODE' && (
                <div style={{ gridColumn: '1 / span 2' }}>
                  <label htmlFor="problemSelect">Problem</label>
                  <select id="problemSelect" className="input" value={codeProblemId} onChange={e => setCodeProblemId(e.target.value)}>
                    <option value="">Select…</option>
                    {problems.map(p => (<option key={p.id} value={p.id}>{p.id} — {p.title}</option>))}
                  </select>
                </div>
              )}
              {newSection.type === 'MCQ' && (
                <div style={{ gridColumn: '1 / span 2' }}>
                  <label htmlFor="mcqPrompt">Question Prompt</label>
                  <input id="mcqPrompt" className="input" value={mcq.prompt} onChange={e => setMcq({ ...mcq, prompt: e.target.value })} />
                  <label htmlFor="mcqExplanation">Explanation</label>
                  <input id="mcqExplanation" className="input" value={mcq.explanation} onChange={e => setMcq({ ...mcq, explanation: e.target.value })} />
                  <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                    <button className="btn" onClick={onAddSection} disabled={!selectedPage?.id}>Add MCQ Section</button>
                    <button className="btn" onClick={onAddQuestion} disabled={!selectedPage?.id || !mcq.prompt}>Add Question</button>
                    <button className="btn" onClick={onAddOption} disabled={!selectedQuestionId}>Add Option</button>
                  </div>
                </div>
              )}
              {newSection.type !== 'MCQ' && (
                <div style={{ gridColumn: '1 / span 2' }}>
                  <button className="btn" onClick={onAddSection} disabled={!selectedPage?.id}>Add Section</button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

