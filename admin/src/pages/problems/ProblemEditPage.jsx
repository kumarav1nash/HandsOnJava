import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Eye, Play, Plus, Trash2 } from 'lucide-react'

const ProblemEditPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('basic')
  const [isLoading, setIsLoading] = useState(false)
  const [problem, setProblem] = useState({
    title: '',
    description: '',
    type: 'coding',
    difficulty: 'easy',
    points: 10,
    timeLimit: 30,
    memoryLimit: 256,
    hints: [],
    testCases: [],
    scoringRubric: [],
    courseId: '',
    status: 'draft',
    content: ''
  })

  const [newHint, setNewHint] = useState('')
  const [newTestCase, setNewTestCase] = useState({
    input: '',
    expectedOutput: '',
    isPublic: true,
    description: ''
  })
  const [newRubricItem, setNewRubricItem] = useState({
    criteria: '',
    points: 0,
    description: ''
  })

  // Mock problem data - in real app, fetch from API
  useEffect(() => {
    // Simulate loading problem data
    setTimeout(() => {
      setProblem({
        title: 'Two Sum Problem',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
        type: 'coding',
        difficulty: 'easy',
        points: 10,
        timeLimit: 30,
        memoryLimit: 256,
        hints: [
          'A really brute force way would be to search for all possible pairs of numbers but that would be too slow.',
          'A more efficient way is to use a hash table to store the numbers we have seen so far.'
        ],
        testCases: [
          {
            id: '1',
            input: '[2,7,11,15]\\ntarget = 9',
            expectedOutput: '[0,1]',
            isPublic: true,
            description: 'Example 1: nums = [2,7,11,15], target = 9'
          },
          {
            id: '2',
            input: '[3,2,4]\\ntarget = 6',
            expectedOutput: '[1,2]',
            isPublic: true,
            description: 'Example 2: nums = [3,2,4], target = 6'
          },
          {
            id: '3',
            input: '[3,3]\\ntarget = 6',
            expectedOutput: '[0,1]',
            isPublic: false,
            description: 'Hidden test case'
          }
        ],
        scoringRubric: [
          {
            id: '1',
            criteria: 'Correctness',
            points: 8,
            description: 'Solution produces correct output for all test cases'
          },
          {
            id: '2',
            criteria: 'Efficiency',
            points: 2,
            description: 'Solution has optimal time complexity O(n)'
          }
        ],
        courseId: 'course-001',
        status: 'published',
        content: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your solution here\n    }\n}'
      })
    }, 1000)
  }, [id])

  const handleInputChange = (field, value) => {
    setProblem(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addHint = () => {
    if (newHint.trim()) {
      setProblem(prev => ({
        ...prev,
        hints: [...prev.hints, newHint.trim()]
      }))
      setNewHint('')
    }
  }

  const removeHint = (index) => {
    setProblem(prev => ({
      ...prev,
      hints: prev.hints.filter((_, i) => i !== index)
    }))
  }

  const addTestCase = () => {
    if (newTestCase.input.trim() && newTestCase.expectedOutput.trim()) {
      setProblem(prev => ({
        ...prev,
        testCases: [...prev.testCases, {
          id: Date.now().toString(),
          ...newTestCase
        }]
      }))
      setNewTestCase({
        input: '',
        expectedOutput: '',
        isPublic: true,
        description: ''
      })
    }
  }

  const removeTestCase = (testCaseId) => {
    setProblem(prev => ({
      ...prev,
      testCases: prev.testCases.filter(tc => tc.id !== testCaseId)
    }))
  }

  const addRubricItem = () => {
    if (newRubricItem.criteria.trim() && newRubricItem.points > 0) {
      setProblem(prev => ({
        ...prev,
        scoringRubric: [...prev.scoringRubric, {
          id: Date.now().toString(),
          ...newRubricItem
        }]
      }))
      setNewRubricItem({
        criteria: '',
        points: 0,
        description: ''
      })
    }
  }

  const removeRubricItem = (rubricId) => {
    setProblem(prev => ({
      ...prev,
      scoringRubric: prev.scoringRubric.filter(item => item.id !== rubricId)
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In real app, make API call to save problem
      console.log('Saving problem:', problem)
      
      // Navigate back to problem management
      navigate('/admin/problems')
    } catch (error) {
      console.error('Failed to save problem:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreview = () => {
    // Navigate to preview page
    console.log('Preview problem:', problem)
  }

  const runTestCase = (testCase) => {
    // Simulate running test case
    console.log('Running test case:', testCase)
  }

  const tabs = [
    { id: 'basic', label: 'Basic Information' },
    { id: 'test-cases', label: 'Test Cases' },
    { id: 'rubric', label: 'Scoring Rubric' },
    { id: 'settings', label: 'Settings' }
  ]

  const problemTypes = [
    { value: 'coding', label: 'Coding Problem' },
    { value: 'multiple-choice', label: 'Multiple Choice' },
    { value: 'true-false', label: 'True/False' },
    { value: 'essay', label: 'Essay' },
    { value: 'fill-blank', label: 'Fill in the Blank' }
  ]

  return (
    <div className="problem-edit-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <button 
            className="back-button"
            onClick={() => navigate('/admin/problems')}
          >
            <ArrowLeft size={20} />
            Back to Problems
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

      {/* Problem Title */}
      <div className="problem-header">
        <h1>Edit Problem: {problem.title || 'Loading...'}</h1>
        <div className="problem-status">
          <span className={`status-badge ${problem.status}`}>
            {problem.status}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'basic' && (
          <div className="basic-info-tab">
            <div className="form-group">
              <label htmlFor="title">Problem Title *</label>
              <input
                id="title"
                type="text"
                value={problem.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter problem title"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Problem Description *</label>
              <textarea
                id="description"
                value={problem.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter problem description"
                className="form-textarea"
                rows={6}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="type">Problem Type *</label>
                <select
                  id="type"
                  value={problem.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="form-select"
                >
                  {problemTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="difficulty">Difficulty Level *</label>
                <select
                  id="difficulty"
                  value={problem.difficulty}
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                  className="form-select"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="points">Points *</label>
                <input
                  id="points"
                  type="number"
                  value={problem.points}
                  onChange={(e) => handleInputChange('points', parseInt(e.target.value) || 0)}
                  min="1"
                  max="1000"
                  className="form-input"
                />
              </div>
            </div>

            {problem.type === 'coding' && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="timeLimit">Time Limit (seconds)</label>
                  <input
                    id="timeLimit"
                    type="number"
                    value={problem.timeLimit}
                    onChange={(e) => handleInputChange('timeLimit', parseInt(e.target.value) || 0)}
                    min="1"
                    max="300"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="memoryLimit">Memory Limit (MB)</label>
                  <input
                    id="memoryLimit"
                    type="number"
                    value={problem.memoryLimit}
                    onChange={(e) => handleInputChange('memoryLimit', parseInt(e.target.value) || 0)}
                    min="1"
                    max="1024"
                    className="form-input"
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Hints</label>
              <div className="hint-input-container">
                <textarea
                  value={newHint}
                  onChange={(e) => setNewHint(e.target.value)}
                  placeholder="Add a hint for students"
                  className="form-textarea"
                  rows={2}
                />
                <button type="button" onClick={addHint} className="add-button">
                  Add Hint
                </button>
              </div>
              <div className="hints-list">
                {problem.hints.map((hint, index) => (
                  <div key={index} className="hint-item">
                    <span className="hint-number">Hint {index + 1}:</span>
                    <span className="hint-text">{hint}</span>
                    <button
                      type="button"
                      onClick={() => removeHint(index)}
                      className="remove-hint"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Course</label>
              <select
                value={problem.courseId}
                onChange={(e) => handleInputChange('courseId', e.target.value)}
                className="form-select"
              >
                <option value="">Select a course</option>
                <option value="course-001">Introduction to Algorithms</option>
                <option value="course-002">Data Structures</option>
                <option value="course-003">Java Programming Basics</option>
                <option value="course-004">Database Design</option>
                <option value="course-005">Digital Logic</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'test-cases' && problem.type === 'coding' && (
          <div className="test-cases-tab">
            <div className="test-cases-header">
              <h3>Test Cases</h3>
              <p>Add test cases to validate student solutions</p>
            </div>

            <div className="add-test-case">
              <h4>Add New Test Case</h4>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={newTestCase.description}
                  onChange={(e) => setNewTestCase(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this test case"
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>Input</label>
                <textarea
                  value={newTestCase.input}
                  onChange={(e) => setNewTestCase(prev => ({ ...prev, input: e.target.value }))}
                  placeholder="Enter input for the test case"
                  className="form-textarea"
                  rows={3}
                />
              </div>
              
              <div className="form-group">
                <label>Expected Output</label>
                <textarea
                  value={newTestCase.expectedOutput}
                  onChange={(e) => setNewTestCase(prev => ({ ...prev, expectedOutput: e.target.value }))}
                  placeholder="Enter expected output"
                  className="form-textarea"
                  rows={2}
                />
              </div>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newTestCase.isPublic}
                    onChange={(e) => setNewTestCase(prev => ({ ...prev, isPublic: e.target.checked }))}
                  />
                  <span>Visible to students (public test case)</span>
                </label>
              </div>
              
              <button type="button" onClick={addTestCase} className="add-button">
                Add Test Case
              </button>
            </div>

            <div className="test-cases-list">
              <h4>Existing Test Cases ({problem.testCases.length})</h4>
              {problem.testCases.map((testCase) => (
                <div key={testCase.id} className="test-case-item">
                  <div className="test-case-header">
                    <div className="test-case-info">
                      <span className="test-case-title">{testCase.description || 'Test Case'}</span>
                      <span className={`visibility-badge ${testCase.isPublic ? 'public' : 'private'}`}>
                        {testCase.isPublic ? 'Public' : 'Private'}
                      </span>
                    </div>
                    <div className="test-case-actions">
                      <button
                        onClick={() => runTestCase(testCase)}
                        className="run-button"
                        title="Run Test Case"
                      >
                        <Play size={16} />
                      </button>
                      <button
                        onClick={() => removeTestCase(testCase.id)}
                        className="remove-button"
                        title="Remove Test Case"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="test-case-content">
                    <div className="input-section">
                      <strong>Input:</strong>
                      <pre>{testCase.input}</pre>
                    </div>
                    <div className="output-section">
                      <strong>Expected Output:</strong>
                      <pre>{testCase.expectedOutput}</pre>
                    </div>
                  </div>
                </div>
              ))}
              {problem.testCases.length === 0 && (
                <div className="no-test-cases">
                  <p>No test cases added yet. Add some test cases above.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'rubric' && (
          <div className="rubric-tab">
            <div className="rubric-header">
              <h3>Scoring Rubric</h3>
              <p>Define how this problem will be scored</p>
            </div>

            <div className="add-rubric-item">
              <h4>Add Scoring Criteria</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Criteria</label>
                  <input
                    type="text"
                    value={newRubricItem.criteria}
                    onChange={(e) => setNewRubricItem(prev => ({ ...prev, criteria: e.target.value }))}
                    placeholder="e.g., Correctness, Efficiency"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Points</label>
                  <input
                    type="number"
                    value={newRubricItem.points}
                    onChange={(e) => setNewRubricItem(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                    min="1"
                    max={problem.points}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newRubricItem.description}
                  onChange={(e) => setNewRubricItem(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what needs to be achieved for full points"
                  className="form-textarea"
                  rows={2}
                />
              </div>
              <button type="button" onClick={addRubricItem} className="add-button">
                Add Criteria
              </button>
            </div>

            <div className="rubric-summary">
              <div className="total-points">
                Total Points: {problem.scoringRubric.reduce((sum, item) => sum + item.points, 0)} / {problem.points}
              </div>
              {problem.scoringRubric.reduce((sum, item) => sum + item.points, 0) !== problem.points && (
                <div className="points-warning">
                  ⚠️ Total rubric points don't match problem points
                </div>
              )}
            </div>

            <div className="rubric-items-list">
              <h4>Scoring Criteria ({problem.scoringRubric.length})</h4>
              {problem.scoringRubric.map((item) => (
                <div key={item.id} className="rubric-item">
                  <div className="rubric-item-header">
                    <div className="rubric-item-info">
                      <span className="rubric-criteria">{item.criteria}</span>
                      <span className="rubric-points">{item.points} points</span>
                    </div>
                    <button
                      onClick={() => removeRubricItem(item.id)}
                      className="remove-button"
                      title="Remove Criteria"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="rubric-description">
                    {item.description}
                  </div>
                </div>
              ))}
              {problem.scoringRubric.length === 0 && (
                <div className="no-rubric-items">
                  <p>No scoring criteria added yet. Add some criteria above.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-tab">
            <div className="form-group">
              <label htmlFor="status">Problem Status</label>
              <select
                id="status"
                value={problem.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="form-select"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="danger-zone">
              <h4>Danger Zone</h4>
              <div className="danger-actions">
                <button className="danger-button secondary">
                  Archive Problem
                </button>
                <button className="danger-button">
                  Delete Problem
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Styles */}
      <style jsx>{`
        .problem-edit-page {
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

        .problem-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .problem-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #111827;
        }

        .problem-status {
          display: flex;
          align-items: center;
          gap: 1rem;
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

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .hint-input-container, .add-test-case, .add-rubric-item {
          background: #f9fafb;
          padding: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          margin-bottom: 1.5rem;
        }

        .add-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
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

        .hints-list, .test-cases-list, .rubric-items-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .hint-item, .test-case-item, .rubric-item {
          padding: 1rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
        }

        .hint-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .hint-number {
          font-weight: 600;
          color: #3b82f6;
          min-width: 60px;
        }

        .hint-text {
          flex: 1;
          color: #374151;
        }

        .remove-hint, .remove-button {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 0.25rem;
          transition: color 0.2s;
        }

        .remove-hint:hover, .remove-button:hover {
          color: #ef4444;
        }

        .test-case-header, .rubric-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .test-case-info, .rubric-item-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .visibility-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .visibility-badge.public {
          background: #d1fae5;
          color: #065f46;
        }

        .visibility-badge.private {
          background: #fee2e2;
          color: #991b1b;
        }

        .test-case-actions, .rubric-item-actions {
          display: flex;
          gap: 0.5rem;
        }

        .run-button {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.375rem 0.75rem;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 0.25rem;
          cursor: pointer;
          font-size: 0.75rem;
        }

        .run-button:hover {
          background: #059669;
        }

        .test-case-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .input-section, .output-section {
          padding: 1rem;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 0.25rem;
        }

        .input-section strong, .output-section strong {
          display: block;
          margin-bottom: 0.5rem;
          color: #374151;
        }

        .input-section pre, .output-section pre {
          margin: 0;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          white-space: pre-wrap;
          word-break: break-all;
        }

        .no-test-cases, .no-rubric-items {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
          border: 2px dashed #d1d5db;
          border-radius: 0.375rem;
        }

        .rubric-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          margin-bottom: 1.5rem;
        }

        .total-points {
          font-size: 1.125rem;
          font-weight: 600;
          color: #374151;
        }

        .points-warning {
          color: #dc2626;
          font-weight: 500;
        }

        .rubric-criteria {
          font-weight: 600;
          color: #374151;
        }

        .rubric-points {
          font-weight: 600;
          color: #3b82f6;
        }

        .rubric-description {
          color: #6b7280;
          font-size: 0.875rem;
          margin-top: 0.5rem;
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

export default ProblemEditPage