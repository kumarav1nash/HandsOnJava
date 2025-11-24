import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Eye, Upload, Tag, BookOpen, Clock, User } from 'lucide-react'

const CourseEditPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('basic')
  const [isLoading, setIsLoading] = useState(false)
  const [course, setCourse] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    duration: '',
    tags: [],
    learningObjectives: [],
    prerequisites: [],
    status: 'draft',
    content: '',
    metadata: {}
  })

  const [newTag, setNewTag] = useState('')
  const [newObjective, setNewObjective] = useState('')
  const [newPrerequisite, setNewPrerequisite] = useState('')

  // Mock course data - in real app, fetch from API
  useEffect(() => {
    // Simulate loading course data
    setTimeout(() => {
      setCourse({
        title: 'Introduction to Java Programming',
        description: 'Learn Java programming from scratch with hands-on exercises and real-world projects.',
        category: 'Programming',
        difficulty: 'beginner',
        duration: '8 weeks',
        tags: ['Java', 'Programming', 'OOP', 'Beginner'],
        learningObjectives: [
          'Understand Java syntax and basic programming concepts',
          'Master object-oriented programming principles',
          'Build real-world Java applications'
        ],
        prerequisites: ['Basic computer skills', 'No prior programming experience required'],
        status: 'published',
        content: 'Welcome to this comprehensive Java programming course...',
        metadata: {
          instructor: 'John Doe',
          language: 'English',
          level: 'Beginner'
        }
      })
    }, 1000)
  }, [id])

  const handleInputChange = (field, value) => {
    setCourse(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !course.tags.includes(newTag.trim())) {
      setCourse(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove) => {
    setCourse(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const addObjective = () => {
    if (newObjective.trim()) {
      setCourse(prev => ({
        ...prev,
        learningObjectives: [...prev.learningObjectives, newObjective.trim()]
      }))
      setNewObjective('')
    }
  }

  const removeObjective = (index) => {
    setCourse(prev => ({
      ...prev,
      learningObjectives: prev.learningObjectives.filter((_, i) => i !== index)
    }))
  }

  const addPrerequisite = () => {
    if (newPrerequisite.trim()) {
      setCourse(prev => ({
        ...prev,
        prerequisites: [...prev.prerequisites, newPrerequisite.trim()]
      }))
      setNewPrerequisite('')
    }
  }

  const removePrerequisite = (index) => {
    setCourse(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((_, i) => i !== index)
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In real app, make API call to save course
      console.log('Saving course:', course)
      
      // Navigate back to course management
      navigate('/admin/courses')
    } catch (error) {
      console.error('Failed to save course:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreview = () => {
    // Navigate to preview page
    navigate(`/admin/courses/preview/${id}`)
  }

  const tabs = [
    { id: 'basic', label: 'Basic Information', icon: BookOpen },
    { id: 'content', label: 'Course Content', icon: Tag },
    { id: 'media', label: 'Media & Files', icon: Upload },
    { id: 'settings', label: 'Settings', icon: User }
  ]

  return (
    <div className="course-edit-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <button 
            className="back-button"
            onClick={() => navigate('/admin/courses')}
          >
            <ArrowLeft size={20} />
            Back to Courses
          </button>
          
          <div className="header-actions">
            <button className="preview-button" onClick={handlePreview}>
              <Eye size={16} />
              Preview
            </button>
            <button 
              className="save-button"
              onClick={handleSave}
              disabled={isLoading}
            >
              <Save size={16} />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Course Title */}
      <div className="course-header">
        <h1>Edit Course: {course.title || 'Loading...'}</h1>
        <div className="course-status">
          <span className={`status-badge ${course.status}`}>
            {course.status}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'basic' && (
          <div className="basic-info-tab">
            <div className="form-group">
              <label htmlFor="title">Course Title *</label>
              <input
                id="title"
                type="text"
                value={course.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter course title"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Course Description *</label>
              <textarea
                id="description"
                value={course.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter course description"
                className="form-textarea"
                rows={4}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  value={course.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="form-select"
                >
                  <option value="">Select category</option>
                  <option value="Programming">Programming</option>
                  <option value="Design">Design</option>
                  <option value="Business">Business</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Data Science">Data Science</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="difficulty">Difficulty Level *</label>
                <select
                  id="difficulty"
                  value={course.difficulty}
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                  className="form-select"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="duration">Duration</label>
              <input
                id="duration"
                type="text"
                value={course.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                placeholder="e.g., 8 weeks, 3 months"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Tags</label>
              <div className="tag-input-container">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  className="form-input"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <button type="button" onClick={addTag} className="add-button">
                  Add
                </button>
              </div>
              <div className="tags-list">
                {course.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="remove-tag"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="content-tab">
            <div className="form-group">
              <label>Learning Objectives</label>
              <div className="objective-input-container">
                <input
                  type="text"
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  placeholder="Add a learning objective"
                  className="form-input"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
                />
                <button type="button" onClick={addObjective} className="add-button">
                  Add
                </button>
              </div>
              <div className="objectives-list">
                {course.learningObjectives.map((objective, index) => (
                  <div key={index} className="objective-item">
                    <span>{objective}</span>
                    <button
                      type="button"
                      onClick={() => removeObjective(index)}
                      className="remove-objective"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Prerequisites</label>
              <div className="prerequisite-input-container">
                <input
                  type="text"
                  value={newPrerequisite}
                  onChange={(e) => setNewPrerequisite(e.target.value)}
                  placeholder="Add a prerequisite"
                  className="form-input"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrerequisite())}
                />
                <button type="button" onClick={addPrerequisite} className="add-button">
                  Add
                </button>
              </div>
              <div className="prerequisites-list">
                {course.prerequisites.map((prerequisite, index) => (
                  <div key={index} className="prerequisite-item">
                    <span>{prerequisite}</span>
                    <button
                      type="button"
                      onClick={() => removePrerequisite(index)}
                      className="remove-prerequisite"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="media-tab">
            <div className="upload-section">
              <h3>Course Thumbnail</h3>
              <div className="upload-area">
                <Upload size={48} />
                <p>Drag and drop your course thumbnail here</p>
                <button className="upload-button">Choose File</button>
              </div>
            </div>

            <div className="upload-section">
              <h3>Course Materials</h3>
              <div className="upload-area">
                <Upload size={48} />
                <p>Upload course materials, PDFs, presentations, etc.</p>
                <button className="upload-button">Choose Files</button>
              </div>
            </div>

            <div className="uploaded-files">
              <h4>Uploaded Files</h4>
              <div className="files-list">
                <p>No files uploaded yet</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-tab">
            <div className="form-group">
              <label htmlFor="status">Course Status</label>
              <select
                id="status"
                value={course.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="form-select"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="form-group">
              <label>Instructor</label>
              <input
                type="text"
                value={course.metadata.instructor || ''}
                onChange={(e) => handleInputChange('metadata', {
                  ...course.metadata,
                  instructor: e.target.value
                })}
                placeholder="Enter instructor name"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Language</label>
              <select
                value={course.metadata.language || 'English'}
                onChange={(e) => handleInputChange('metadata', {
                  ...course.metadata,
                  language: e.target.value
                })}
                className="form-select"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Chinese">Chinese</option>
              </select>
            </div>

            <div className="danger-zone">
              <h4>Danger Zone</h4>
              <div className="danger-actions">
                <button className="danger-button secondary">
                  Archive Course
                </button>
                <button className="danger-button">
                  Delete Course
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Styles */}
      <style jsx>{`
        .course-edit-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .page-header {
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 1rem;
          margin-bottom: 2rem;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .back-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          color: #374151;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .back-button:hover {
          background: #e5e7eb;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .preview-button, .save-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .preview-button {
          background: white;
          color: #374151;
        }

        .preview-button:hover {
          background: #f9fafb;
        }

        .save-button {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .save-button:hover:not(:disabled) {
          background: #2563eb;
        }

        .save-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .course-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .course-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #111827;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .status-badge.draft {
          background: #fef3c7;
          color: #92400e;
        }

        .status-badge.published {
          background: #d1fae5;
          color: #065f46;
        }

        .status-badge.archived {
          background: #fee2e2;
          color: #991b1b;
        }

        .tabs-container {
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 2rem;
        }

        .tabs {
          display: flex;
          gap: 0.5rem;
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab:hover {
          color: #374151;
        }

        .tab.active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
        }

        .tab-content {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #374151;
        }

        .form-input, .form-textarea, .form-select {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .form-input:focus, .form-textarea:focus, .form-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .tag-input-container, .objective-input-container, .prerequisite-input-container {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .add-button {
          padding: 0.5rem 1rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .add-button:hover {
          background: #2563eb;
        }

        .tags-list, .objectives-list, .prerequisites-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .tag {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.75rem;
          background: #e5e7eb;
          border-radius: 9999px;
          font-size: 0.875rem;
        }

        .remove-tag, .remove-objective, .remove-prerequisite {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          font-size: 1.25rem;
          line-height: 1;
        }

        .remove-tag:hover, .remove-objective:hover, .remove-prerequisite:hover {
          color: #ef4444;
        }

        .objective-item, .prerequisite-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
        }

        .upload-section {
          margin-bottom: 2rem;
        }

        .upload-section h3 {
          margin-bottom: 1rem;
          font-size: 1.125rem;
          font-weight: 600;
        }

        .upload-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          border: 2px dashed #d1d5db;
          border-radius: 0.5rem;
          background: #f9fafb;
          cursor: pointer;
          transition: all 0.2s;
        }

        .upload-area:hover {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .upload-button {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
        }

        .uploaded-files {
          margin-top: 2rem;
        }

        .files-list {
          padding: 1rem;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          text-align: center;
          color: #6b7280;
        }

        .danger-zone {
          margin-top: 2rem;
          padding: 1.5rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 0.5rem;
        }

        .danger-zone h4 {
          margin-bottom: 1rem;
          color: #991b1b;
          font-weight: 600;
        }

        .danger-actions {
          display: flex;
          gap: 1rem;
        }

        .danger-button {
          padding: 0.5rem 1rem;
          background: #dc2626;
          color: white;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .danger-button:hover {
          background: #b91c1c;
        }

        .danger-button.secondary {
          background: #f59e0b;
        }

        .danger-button.secondary:hover {
          background: #d97706;
        }
      `}</style>
    </div>
  )
}

export default CourseEditPage