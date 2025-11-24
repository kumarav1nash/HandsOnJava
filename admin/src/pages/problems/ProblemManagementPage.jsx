import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Filter, Edit, Trash2, Eye, Copy, Download } from 'lucide-react'

const ProblemManagementPage = () => {
  const navigate = useNavigate()
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterDifficulty, setFilterDifficulty] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')

  // Mock data - in real app, fetch from API
  useEffect(() => {
    const mockProblems = [
      {
        id: '1',
        title: 'Two Sum Problem',
        description: 'Find two numbers in an array that add up to a target sum.',
        type: 'coding',
        difficulty: 'easy',
        points: 10,
        course: 'Introduction to Algorithms',
        status: 'published',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-20T14:30:00Z',
        usageCount: 1250,
        averageScore: 75
      },
      {
        id: '2',
        title: 'Binary Tree Traversal',
        description: 'Implement inorder, preorder, and postorder traversal of a binary tree.',
        type: 'coding',
        difficulty: 'medium',
        points: 20,
        course: 'Data Structures',
        status: 'published',
        createdAt: '2024-01-10T09:00:00Z',
        updatedAt: '2024-01-18T16:45:00Z',
        usageCount: 890,
        averageScore: 68
      },
      {
        id: '3',
        title: 'Object-Oriented Programming Concepts',
        description: 'Test your understanding of OOP principles.',
        type: 'multiple-choice',
        difficulty: 'beginner',
        points: 5,
        course: 'Java Programming Basics',
        status: 'published',
        createdAt: '2024-01-05T14:00:00Z',
        updatedAt: '2024-01-12T11:20:00Z',
        usageCount: 2100,
        averageScore: 82
      },
      {
        id: '4',
        title: 'Database Normalization',
        description: 'Determine the normal form of given database schemas.',
        type: 'essay',
        difficulty: 'hard',
        points: 30,
        course: 'Database Design',
        status: 'draft',
        createdAt: '2024-01-20T16:00:00Z',
        updatedAt: '2024-01-22T10:15:00Z',
        usageCount: 0,
        averageScore: 0
      },
      {
        id: '5',
        title: 'Boolean Logic',
        description: 'Evaluate the truth value of boolean expressions.',
        type: 'true-false',
        difficulty: 'easy',
        points: 2,
        course: 'Digital Logic',
        status: 'published',
        createdAt: '2024-01-08T11:30:00Z',
        updatedAt: '2024-01-15T13:45:00Z',
        usageCount: 1560,
        averageScore: 88
      }
    ]

    setTimeout(() => {
      setProblems(mockProblems)
      setLoading(false)
    }, 1000)
  }, [])

  // Filter and sort problems
  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         problem.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || problem.type === filterType
    const matchesDifficulty = filterDifficulty === 'all' || problem.difficulty === filterDifficulty
    
    return matchesSearch && matchesType && matchesDifficulty
  }).sort((a, b) => {
    let aValue = a[sortBy]
    let bValue = b[sortBy]
    
    // Handle date fields
    if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
      aValue = new Date(aValue)
      bValue = new Date(bValue)
    }
    
    // Handle numeric fields
    if (sortBy === 'points' || sortBy === 'usageCount' || sortBy === 'averageScore') {
      aValue = Number(aValue) || 0
      bValue = Number(bValue) || 0
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const handleCreateProblem = () => {
    navigate('/admin/problems/create')
  }

  const handleEditProblem = (problemId) => {
    navigate(`/admin/problems/edit/${problemId}`)
  }

  const handleViewProblem = (problemId) => {
    // Navigate to problem preview
    console.log(`View problem ${problemId}`)
  }

  const handleDuplicateProblem = (problemId) => {
    // Duplicate problem logic
    console.log(`Duplicate problem ${problemId}`)
  }

  const handleDeleteProblem = (problemId) => {
    if (window.confirm('Are you sure you want to delete this problem?')) {
      setProblems(problems.filter(p => p.id !== problemId))
    }
  }

  const handleExportProblems = () => {
    // Export problems logic
    const csvContent = [
      ['ID', 'Title', 'Type', 'Difficulty', 'Points', 'Status', 'Usage Count', 'Average Score'],
      ...filteredProblems.map(p => [
        p.id, p.title, p.type, p.difficulty, p.points, p.status, p.usageCount, p.averageScore
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'problems-export.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'hard': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'coding': return '💻'
      case 'multiple-choice': return '📝'
      case 'true-false': return '✅'
      case 'essay': return '✍️'
      case 'fill-blank': return '📝'
      default: return '📄'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-100'
      case 'draft': return 'text-yellow-600 bg-yellow-100'
      case 'archived': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="problem-management-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Problem Management</h1>
            <p className="text-gray-600 mt-1">Create, edit, and manage coding problems and assessments</p>
          </div>
          <div className="header-actions">
            <button 
              onClick={handleExportProblems}
              className="export-button"
            >
              <Download size={16} />
              Export
            </button>
            <button 
              onClick={handleCreateProblem}
              className="create-button"
            >
              <Plus size={16} />
              Create Problem
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-bar">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search problems..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="coding">Coding</option>
            <option value="multiple-choice">Multiple Choice</option>
            <option value="true-false">True/False</option>
            <option value="essay">Essay</option>
            <option value="fill-blank">Fill in Blank</option>
          </select>

          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-')
              setSortBy(field)
              setSortOrder(order)
            }}
            className="filter-select"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
            <option value="difficulty-asc">Difficulty Easy-Hard</option>
            <option value="difficulty-desc">Difficulty Hard-Easy</option>
            <option value="usageCount-desc">Most Used</option>
            <option value="averageScore-desc">Highest Score</option>
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-value">{problems.length}</div>
          <div className="stat-label">Total Problems</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{problems.filter(p => p.status === 'published').length}</div>
          <div className="stat-label">Published</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{problems.filter(p => p.status === 'draft').length}</div>
          <div className="stat-label">Drafts</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {Math.round(problems.reduce((sum, p) => sum + (p.usageCount || 0), 0) / problems.length)}
          </div>
          <div className="stat-label">Avg Usage</div>
        </div>
      </div>

      {/* Problems Table */}
      <div className="problems-table-container">
        <div className="table-header">
          <h2 className="text-lg font-semibold text-gray-900">
            Problems ({filteredProblems.length})
          </h2>
        </div>
        
        <div className="table-wrapper">
          <table className="problems-table">
            <thead>
              <tr>
                <th className="w-12">Icon</th>
                <th className="text-left">Title</th>
                <th className="text-left">Type</th>
                <th className="text-left">Difficulty</th>
                <th className="text-center">Points</th>
                <th className="text-center">Status</th>
                <th className="text-center">Usage</th>
                <th className="text-center">Avg Score</th>
                <th className="text-left">Course</th>
                <th className="text-left">Updated</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProblems.map((problem) => (
                <tr key={problem.id} className="table-row">
                  <td className="text-center">
                    <span className="problem-icon">{getTypeIcon(problem.type)}</span>
                  </td>
                  <td>
                    <div className="problem-title">
                      <div className="title-text">{problem.title}</div>
                      <div className="description-text">{problem.description}</div>
                    </div>
                  </td>
                  <td>
                    <span className="type-badge">
                      {problem.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </td>
                  <td>
                    <span className={`difficulty-badge ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className="points-badge">{problem.points}</span>
                  </td>
                  <td className="text-center">
                    <span className={`status-badge ${getStatusColor(problem.status)}`}>
                      {problem.status.charAt(0).toUpperCase() + problem.status.slice(1)}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className="usage-count">{problem.usageCount}</span>
                  </td>
                  <td className="text-center">
                    <span className="average-score">
                      {problem.averageScore > 0 ? `${problem.averageScore}%` : 'N/A'}
                    </span>
                  </td>
                  <td>
                    <div className="course-name">{problem.course}</div>
                  </td>
                  <td>
                    <div className="updated-date">
                      {new Date(problem.updatedAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleViewProblem(problem.id)}
                        className="action-button view"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEditProblem(problem.id)}
                        className="action-button edit"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDuplicateProblem(problem.id)}
                        className="action-button duplicate"
                        title="Duplicate"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteProblem(problem.id)}
                        className="action-button delete"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredProblems.length === 0 && (
            <div className="no-results">
              <div className="no-results-icon">📝</div>
              <h3>No problems found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .problem-management-page {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .export-button, .create-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .export-button {
          background: white;
          color: #374151;
        }

        .export-button:hover {
          background: #f9fafb;
        }

        .create-button {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .create-button:hover {
          background: #2563eb;
        }

        .filters-section {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          padding: 1rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
        }

        .search-bar {
          position: relative;
          flex: 1;
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
        }

        .search-input {
          width: 100%;
          padding: 0.5rem 0.75rem 0.5rem 2.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
        }

        .filter-controls {
          display: flex;
          gap: 1rem;
        }

        .filter-select {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          background: white;
        }

        .stats-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          padding: 1.5rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          text-align: center;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #111827;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }

        .problems-table-container {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .table-header {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .problems-table {
          width: 100%;
          border-collapse: collapse;
        }

        .problems-table th {
          padding: 0.75rem 1rem;
          text-align: left;
          font-weight: 600;
          color: #374151;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          font-size: 0.875rem;
        }

        .problems-table td {
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
          font-size: 0.875rem;
        }

        .table-row:hover {
          background: #f9fafb;
        }

        .problem-title {
          max-width: 250px;
        }

        .title-text {
          font-weight: 500;
          color: #111827;
          margin-bottom: 0.25rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .description-text {
          color: #6b7280;
          font-size: 0.75rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .type-badge, .difficulty-badge, .points-badge, .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .type-badge {
          background: #e0e7ff;
          color: #4338ca;
        }

        .difficulty-badge {
          text-transform: capitalize;
        }

        .points-badge {
          background: #f3f4f6;
          color: #374151;
          font-weight: 600;
        }

        .usage-count, .average-score {
          font-weight: 500;
          color: #374151;
        }

        .course-name {
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #6b7280;
        }

        .updated-date {
          color: #6b7280;
          font-size: 0.75rem;
        }

        .action-buttons {
          display: flex;
          gap: 0.25rem;
        }

        .action-button {
          padding: 0.375rem;
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 0.25rem;
          cursor: pointer;
          transition: all 0.2s;
          color: #6b7280;
        }

        .action-button:hover {
          background: #f9fafb;
        }

        .action-button.view:hover {
          color: #3b82f6;
          border-color: #3b82f6;
        }

        .action-button.edit:hover {
          color: #f59e0b;
          border-color: #f59e0b;
        }

        .action-button.duplicate:hover {
          color: #10b981;
          border-color: #10b981;
        }

        .action-button.delete:hover {
          color: #ef4444;
          border-color: #ef4444;
        }

        .no-results {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }

        .no-results-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .no-results h3 {
          font-size: 1.125rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: #374151;
        }
      `}</style>
    </div>
  )
}

export default ProblemManagementPage