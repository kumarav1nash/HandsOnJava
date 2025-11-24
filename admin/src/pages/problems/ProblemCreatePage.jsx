import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ChevronLeft, 
  Save, 
  Eye, 
  Plus, 
  Trash2, 
  Copy,
  Settings,
  Code,
  FileText,
  CheckCircle,
  Circle,
  Radio,
  Square,
  Upload,
  Download,
  Play,
  Settings as SettingsIcon
} from 'lucide-react';
import { Editor } from '@monaco-editor/react';
import { toast } from 'sonner';

const ProblemCreatePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('basic');
  const [previewMode, setPreviewMode] = useState(false);
  
  const [problemData, setProblemData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    difficulty: 'medium',
    category: '',
    tags: [],
    type: 'multiple-choice', // multiple-choice, true-false, coding, fill-blank, essay
    points: 10,
    timeLimit: 60, // in minutes
    memoryLimit: 256, // in MB
    isPublic: true,
    status: 'draft',
    testCases: [],
    options: [], // for multiple choice
    correctAnswers: [], // for multiple choice and true-false
    starterCode: '',
    solutionCode: '',
    validationCode: '',
    rubric: {
      criteria: [],
      totalPoints: 100
    },
    hints: [],
    sampleInput: '',
    sampleOutput: '',
    explanation: ''
  });

  const [tagInput, setTagInput] = useState('');
  const [optionInput, setOptionInput] = useState('');
  const [testCaseInput, setTestCaseInput] = useState({
    input: '',
    expectedOutput: '',
    isPublic: true,
    explanation: ''
  });
  const [hintInput, setHintInput] = useState('');
  const [rubricInput, setRubricInput] = useState({
    name: '',
    description: '',
    points: 0
  });

  // Fetch categories for dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ['problem-categories'],
    queryFn: async () => {
      const response = await fetch('/api/admin/problem-categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    }
  });

  // Create problem mutation
  const createProblemMutation = useMutation({
    mutationFn: async (problemData) => {
      const response = await fetch('/api/admin/problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(problemData)
      });
      if (!response.ok) throw new Error('Failed to create problem');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['problems']);
      toast.success('Problem created successfully!');
      navigate('/admin/problems');
    },
    onError: (error) => {
      toast.error(`Failed to create problem: ${error.message}`);
    }
  });

  const handleInputChange = (field, value) => {
    setProblemData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !problemData.tags.includes(tagInput.trim())) {
      setProblemData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setProblemData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddOption = () => {
    if (optionInput.trim()) {
      const newOption = {
        id: Date.now(),
        text: optionInput.trim(),
        isCorrect: false
      };
      setProblemData(prev => ({
        ...prev,
        options: [...prev.options, newOption]
      }));
      setOptionInput('');
    }
  };

  const handleRemoveOption = (optionId) => {
    setProblemData(prev => ({
      ...prev,
      options: prev.options.filter(option => option.id !== optionId)
    }));
  };

  const handleToggleCorrectOption = (optionId) => {
    setProblemData(prev => ({
      ...prev,
      options: prev.options.map(option => 
        option.id === optionId 
          ? { ...option, isCorrect: !option.isCorrect }
          : option
      )
    }));
  };

  const handleAddTestCase = () => {
    if (testCaseInput.input.trim() && testCaseInput.expectedOutput.trim()) {
      const newTestCase = {
        id: Date.now(),
        ...testCaseInput
      };
      setProblemData(prev => ({
        ...prev,
        testCases: [...prev.testCases, newTestCase]
      }));
      setTestCaseInput({ input: '', expectedOutput: '', isPublic: true, explanation: '' });
    }
  };

  const handleRemoveTestCase = (testCaseId) => {
    setProblemData(prev => ({
      ...prev,
      testCases: prev.testCases.filter(tc => tc.id !== testCaseId)
    }));
  };

  const handleAddHint = () => {
    if (hintInput.trim()) {
      setProblemData(prev => ({
        ...prev,
        hints: [...prev.hints, hintInput.trim()]
      }));
      setHintInput('');
    }
  };

  const handleRemoveHint = (hintToRemove) => {
    setProblemData(prev => ({
      ...prev,
      hints: prev.hints.filter(hint => hint !== hintToRemove)
    }));
  };

  const handleAddRubricCriteria = () => {
    if (rubricInput.name.trim() && rubricInput.points > 0) {
      const newCriteria = {
        id: Date.now(),
        ...rubricInput
      };
      setProblemData(prev => ({
        ...prev,
        rubric: {
          ...prev.rubric,
          criteria: [...prev.rubric.criteria, newCriteria]
        }
      }));
      setRubricInput({ name: '', description: '', points: 0 });
    }
  };

  const handleRemoveRubricCriteria = (criteriaId) => {
    setProblemData(prev => ({
      ...prev,
      rubric: {
        ...prev.rubric,
        criteria: prev.rubric.criteria.filter(criteria => criteria.id !== criteriaId)
      }
    }));
  };

  const handleSave = () => {
    if (!problemData.title.trim()) {
      toast.error('Problem title is required');
      return;
    }
    
    if (problemData.type === 'multiple-choice' && problemData.options.length === 0) {
      toast.error('At least one option is required for multiple choice questions');
      return;
    }
    
    if (problemData.type === 'coding' && problemData.testCases.length === 0) {
      toast.error('At least one test case is required for coding problems');
      return;
    }
    
    createProblemMutation.mutate(problemData);
  };

  const handlePreview = () => {
    setPreviewMode(!previewMode);
  };

  const runTestCase = (input, expectedOutput) => {
    // Simulate running test case
    toast.success('Test case executed successfully');
  };

  const questionTypeOptions = [
    { value: 'multiple-choice', label: 'Multiple Choice', icon: Radio },
    { value: 'true-false', label: 'True/False', icon: CheckCircle },
    { value: 'coding', label: 'Coding', icon: Code },
    { value: 'fill-blank', label: 'Fill in the Blank', icon: FileText },
    { value: 'essay', label: 'Essay', icon: FileText }
  ];

  if (previewMode) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handlePreview}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to Editor
                </button>
                <h1 className="text-xl font-semibold text-gray-900">
                  Problem Preview
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-8">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {problemData.title || 'Untitled Problem'}
                  </h1>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    problemData.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    problemData.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {problemData.difficulty}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">
                  {problemData.shortDescription || 'No description provided'}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Points: {problemData.points}</span>
                  <span>Time Limit: {problemData.timeLimit} min</span>
                  <span>Memory Limit: {problemData.memoryLimit} MB</span>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Problem Description</h2>
                <div className="prose max-w-none text-gray-700">
                  {problemData.description || 'No description provided'}
                </div>
              </div>

              {problemData.type === 'multiple-choice' && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Options</h2>
                  <div className="space-y-3">
                    {problemData.options.map(option => (
                      <div key={option.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Radio className="h-5 w-5 text-gray-400" />
                        <span className="flex-1">{option.text}</span>
                        {option.isCorrect && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {problemData.type === 'coding' && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Sample Test Case</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Sample Input</h3>
                      <pre className="bg-gray-100 p-3 rounded-md text-sm">{problemData.sampleInput || 'No sample input'}</pre>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Sample Output</h3>
                      <pre className="bg-gray-100 p-3 rounded-md text-sm">{problemData.sampleOutput || 'No sample output'}</pre>
                    </div>
                  </div>
                  {problemData.explanation && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Explanation</h3>
                      <p className="text-gray-600">{problemData.explanation}</p>
                    </div>
                  )}
                </div>
              )}

              {problemData.hints.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Hints</h2>
                  <ul className="space-y-2">
                    {problemData.hints.map((hint, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <span className="text-blue-500 mt-1">•</span>
                        <span className="text-gray-700">{hint}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {problemData.rubric.criteria.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Scoring Rubric</h2>
                  <div className="space-y-3">
                    {problemData.rubric.criteria.map(criteria => (
                      <div key={criteria.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{criteria.name}</h3>
                          <span className="text-sm text-gray-500">{criteria.points} points</span>
                        </div>
                        <p className="text-sm text-gray-600">{criteria.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/problems')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Problems
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                Create New Problem
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePreview}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </button>
              <button
                onClick={handleSave}
                disabled={createProblemMutation.isPending}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 mr-2" />
                {createProblemMutation.isPending ? 'Creating...' : 'Create Problem'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'basic', name: 'Basic Information', icon: FileText },
                { id: 'question', name: 'Question Setup', icon: Settings },
                { id: 'test-cases', name: 'Test Cases', icon: Play },
                { id: 'rubric', name: 'Scoring Rubric', icon: SettingsIcon }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Problem Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={problemData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter problem title"
                    />
                  </div>

                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                      Question Type
                    </label>
                    <select
                      id="type"
                      value={problemData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {questionTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty
                    </label>
                    <select
                      id="difficulty"
                      value={problemData.difficulty}
                      onChange={(e) => handleInputChange('difficulty', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-2">
                      Points
                    </label>
                    <input
                      type="number"
                      id="points"
                      value={problemData.points}
                      onChange={(e) => handleInputChange('points', parseInt(e.target.value) || 0)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      id="category"
                      value={problemData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description
                  </label>
                  <textarea
                    id="shortDescription"
                    rows={2}
                    value={problemData.shortDescription}
                    onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief description of the problem"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Problem Description *
                  </label>
                  <textarea
                    id="description"
                    rows={5}
                    value={problemData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Detailed description of the problem"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add a tag"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {problemData.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 mb-2">
                      Time Limit (minutes)
                    </label>
                    <input
                      type="number"
                      id="timeLimit"
                      value={problemData.timeLimit}
                      onChange={(e) => handleInputChange('timeLimit', parseInt(e.target.value) || 60)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                    />
                  </div>

                  <div>
                    <label htmlFor="memoryLimit" className="block text-sm font-medium text-gray-700 mb-2">
                      Memory Limit (MB)
                    </label>
                    <input
                      type="number"
                      id="memoryLimit"
                      value={problemData.memoryLimit}
                      onChange={(e) => handleInputChange('memoryLimit', parseInt(e.target.value) || 256)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    id="isPublic"
                    type="checkbox"
                    checked={problemData.isPublic}
                    onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
                    Make this problem public
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'question' && (
              <div className="space-y-6">
                {problemData.type === 'multiple-choice' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Answer Options
                      </label>
                      <div className="flex space-x-2 mb-2">
                        <input
                          type="text"
                          value={optionInput}
                          onChange={(e) => setOptionInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOption())}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Add an option"
                        />
                        <button
                          type="button"
                          onClick={handleAddOption}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        {problemData.options.map(option => (
                          <div key={option.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                            <button
                              type="button"
                              onClick={() => handleToggleCorrectOption(option.id)}
                              className={`p-2 rounded-full ${
                                option.isCorrect ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'
                              }`}
                            >
                              {option.isCorrect ? <CheckCircle className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                            </button>
                            <span className="flex-1">{option.text}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(option.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {problemData.type === 'true-false' && (
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correct Answer
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="trueFalseAnswer"
                          value="true"
                          checked={problemData.correctAnswers.includes('true')}
                          onChange={(e) => handleInputChange('correctAnswers', [e.target.value])}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2">True</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="trueFalseAnswer"
                          value="false"
                          checked={problemData.correctAnswers.includes('false')}
                          onChange={(e) => handleInputChange('correctAnswers', [e.target.value])}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2">False</span>
                      </label>
                    </div>
                  </div>
                )}

                {problemData.type === 'coding' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Starter Code
                      </label>
                      <div className="border border-gray-300 rounded-md overflow-hidden">
                        <Editor
                          height="200px"
                          defaultLanguage="javascript"
                          value={problemData.starterCode}
                          onChange={(value) => handleInputChange('starterCode', value || '')}
                          options={{
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            fontSize: 14,
                            lineNumbers: 'on',
                            roundedSelection: false,
                            scrollbar: {
                              vertical: 'hidden',
                              horizontal: 'hidden'
                            }
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Solution Code
                      </label>
                      <div className="border border-gray-300 rounded-md overflow-hidden">
                        <Editor
                          height="200px"
                          defaultLanguage="javascript"
                          value={problemData.solutionCode}
                          onChange={(value) => handleInputChange('solutionCode', value || '')}
                          options={{
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            fontSize: 14,
                            lineNumbers: 'on'
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sample Input
                        </label>
                        <textarea
                          rows={4}
                          value={problemData.sampleInput}
                          onChange={(e) => handleInputChange('sampleInput', e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                          placeholder="Sample input for the problem"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sample Output
                        </label>
                        <textarea
                          rows={4}
                          value={problemData.sampleOutput}
                          onChange={(e) => handleInputChange('sampleOutput', e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                          placeholder="Expected output for the sample input"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Explanation
                      </label>
                      <textarea
                        rows={3}
                        value={problemData.explanation}
                        onChange={(e) => handleInputChange('explanation', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Explanation of the solution"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hints
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={hintInput}
                      onChange={(e) => setHintInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHint())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add a hint"
                    />
                    <button
                      type="button"
                      onClick={handleAddHint}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {problemData.hints.map((hint, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                        <span className="flex-1 text-sm text-gray-700">{hint}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveHint(hint)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'test-cases' && problemData.type === 'coding' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Test Cases</h3>
                    <div className="text-sm text-gray-500">
                      {problemData.testCases.length} test cases
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {problemData.testCases.map(testCase => (
                      <div key={testCase.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              testCase.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {testCase.isPublic ? 'Public' : 'Private'}
                            </span>
                            <button
                              type="button"
                              onClick={() => runTestCase(testCase.input, testCase.expectedOutput)}
                              className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Run
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveTestCase(testCase.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Input</label>
                            <pre className="bg-gray-100 p-2 rounded text-xs font-mono">{testCase.input}</pre>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Expected Output</label>
                            <pre className="bg-gray-100 p-2 rounded text-xs font-mono">{testCase.expectedOutput}</pre>
                          </div>
                        </div>
                        {testCase.explanation && (
                          <div className="mt-3">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Explanation</label>
                            <p className="text-sm text-gray-600">{testCase.explanation}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Add New Test Case</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Input *
                        </label>
                        <textarea
                          rows={4}
                          value={testCaseInput.input}
                          onChange={(e) => setTestCaseInput(prev => ({ ...prev, input: e.target.value }))}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                          placeholder="Test input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expected Output *
                        </label>
                        <textarea
                          rows={4}
                          value={testCaseInput.expectedOutput}
                          onChange={(e) => setTestCaseInput(prev => ({ ...prev, expectedOutput: e.target.value }))}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                          placeholder="Expected output"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Explanation
                      </label>
                      <textarea
                        rows={2}
                        value={testCaseInput.explanation}
                        onChange={(e) => setTestCaseInput(prev => ({ ...prev, explanation: e.target.value }))}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Explanation of this test case"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        id="isPublic"
                        type="checkbox"
                        checked={testCaseInput.isPublic}
                        onChange={(e) => setTestCaseInput(prev => ({ ...prev, isPublic: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
                        Make this test case public (visible to students)
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddTestCase}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Test Case
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'rubric' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Scoring Rubric</h3>
                    <div className="text-sm text-gray-500">
                      Total: {problemData.rubric.criteria.reduce((sum, criteria) => sum + criteria.points, 0)} points
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {problemData.rubric.criteria.map(criteria => (
                      <div key={criteria.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{criteria.name}</h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">{criteria.points} points</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveRubricCriteria(criteria.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{criteria.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Add Criteria</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Criteria Name *
                      </label>
                      <input
                        type="text"
                        value={rubricInput.name}
                        onChange={(e) => setRubricInput(prev => ({ ...prev, name: e.target.value }))}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Code Quality, Correctness, Efficiency"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        rows={2}
                        value={rubricInput.description}
                        onChange={(e) => setRubricInput(prev => ({ ...prev, description: e.target.value }))}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Description of what this criteria evaluates"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Points *
                      </label>
                      <input
                        type="number"
                        value={rubricInput.points}
                        onChange={(e) => setRubricInput(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddRubricCriteria}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Criteria
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemCreatePage;