import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Code, HelpCircle, BookOpen, Play, Settings } from 'lucide-react';

const SectionEditor = ({ section, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: section.title || '',
    description: section.description || '',
    content: section.content || {}
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData({
      title: section.title || '',
      description: section.description || '',
      content: section.content || {}
    });
  }, [section]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Section title is required';
    }

    switch (section.type) {
      case 'CONCEPT':
        if (!formData.content.text?.trim()) {
          newErrors.text = 'Concept content is required';
        }
        break;
      case 'CODE':
        if (!formData.content.code?.trim()) {
          newErrors.code = 'Code example is required';
        }
        if (!formData.content.language?.trim()) {
          newErrors.language = 'Programming language is required';
        }
        break;
      case 'MCQ':
        if (!formData.content.question?.trim()) {
          newErrors.question = 'Question is required';
        }
        const validOptions = formData.content.options?.filter(opt => opt.text.trim()) || [];
        if (validOptions.length < 2) {
          newErrors.options = 'At least 2 options are required';
        }
        const hasCorrectAnswer = validOptions.some(opt => opt.isCorrect);
        if (!hasCorrectAnswer) {
          newErrors.correctAnswer = 'At least one correct answer is required';
        }
        break;
      case 'PRACTICE':
        if (!formData.content.description?.trim()) {
          newErrors.description = 'Practice description is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave({
        ...section,
        title: formData.title,
        description: formData.description,
        content: formData.content
      });
    }
  };

  const getSectionTypeIcon = () => {
    switch (section.type) {
      case 'CONCEPT': return BookOpen;
      case 'CODE': return Code;
      case 'MCQ': return HelpCircle;
      case 'PRACTICE': return Play;
      default: return Settings;
    }
  };

  const getSectionTypeLabel = () => {
    switch (section.type) {
      case 'CONCEPT': return 'Concept Section';
      case 'CODE': return 'Code Example';
      case 'MCQ': return 'Multiple Choice Question';
      case 'PRACTICE': return 'Practice Exercise';
      default: return 'Section';
    }
  };

  const getSectionTypeColor = () => {
    switch (section.type) {
      case 'CONCEPT': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CODE': return 'bg-green-100 text-green-800 border-green-200';
      case 'MCQ': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'PRACTICE': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const Icon = getSectionTypeIcon();
  const sectionColor = getSectionTypeColor();

  const renderContentEditor = () => {
    switch (section.type) {
      case 'CONCEPT':
        return <ConceptEditor content={formData.content} onChange={(content) => setFormData({...formData, content})} errors={errors} />;
      case 'CODE':
        return <CodeEditor content={formData.content} onChange={(content) => setFormData({...formData, content})} errors={errors} />;
      case 'MCQ':
        return <MCQEditor content={formData.content} onChange={(content) => setFormData({...formData, content})} errors={errors} />;
      case 'PRACTICE':
        return <PracticeEditor content={formData.content} onChange={(content) => setFormData({...formData, content})} errors={errors} />;
      default:
        return <div>Unknown section type</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${sectionColor}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{getSectionTypeLabel()}</h2>
              <p className="text-sm text-gray-600">Edit section content and settings</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 py-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter section title"
              />
              {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of this section"
              />
            </div>
          </div>

          {/* Content Editor */}
          <div className="border-t border-gray-200 pt-6">
            {renderContentEditor()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Concept Editor Component
const ConceptEditor = ({ content, onChange, errors }) => {
  const [keyPoints, setKeyPoints] = useState(content.keyPoints || []);
  const [examples, setExamples] = useState(content.examples || []);
  const [newKeyPoint, setNewKeyPoint] = useState('');
  const [newExample, setNewExample] = useState('');

  const addKeyPoint = () => {
    if (newKeyPoint.trim()) {
      const updatedKeyPoints = [...keyPoints, newKeyPoint.trim()];
      setKeyPoints(updatedKeyPoints);
      onChange({...content, keyPoints: updatedKeyPoints});
      setNewKeyPoint('');
    }
  };

  const removeKeyPoint = (index) => {
    const updatedKeyPoints = keyPoints.filter((_, i) => i !== index);
    setKeyPoints(updatedKeyPoints);
    onChange({...content, keyPoints: updatedKeyPoints});
  };

  const addExample = () => {
    if (newExample.trim()) {
      const updatedExamples = [...examples, newExample.trim()];
      setExamples(updatedExamples);
      onChange({...content, examples: updatedExamples});
      setNewExample('');
    }
  };

  const removeExample = (index) => {
    const updatedExamples = examples.filter((_, i) => i !== index);
    setExamples(updatedExamples);
    onChange({...content, examples: updatedExamples});
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Concept Content *
        </label>
        <textarea
          value={content.text || ''}
          onChange={(e) => onChange({...content, text: e.target.value})}
          rows={6}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.text ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Explain the concept in detail..."
        />
        {errors.text && <p className="text-red-600 text-sm mt-1">{errors.text}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Key Points
        </label>
        <div className="space-y-2 mb-3">
          {keyPoints.map((point, index) => (
            <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
              <span className="flex-1 text-sm">{point}</span>
              <button
                onClick={() => removeKeyPoint(index)}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newKeyPoint}
            onChange={(e) => setNewKeyPoint(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyPoint())}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add a key point"
          />
          <button
            onClick={addKeyPoint}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Examples
        </label>
        <div className="space-y-2 mb-3">
          {examples.map((example, index) => (
            <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
              <span className="flex-1 text-sm">{example}</span>
              <button
                onClick={() => removeExample(index)}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newExample}
            onChange={(e) => setNewExample(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExample())}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add an example"
          />
          <button
            onClick={addExample}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Code Editor Component
const CodeEditor = ({ content, onChange, errors }) => {
  const languages = [
    'java', 'python', 'javascript', 'typescript', 'cpp', 'csharp', 'go', 'rust', 'kotlin', 'swift'
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Programming Language *
          </label>
          <select
            value={content.language || 'java'}
            onChange={(e) => onChange({...content, language: e.target.value})}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.language ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            {languages.map(lang => (
              <option key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>
          {errors.language && <p className="text-red-600 text-sm mt-1">{errors.language}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Code Title
          </label>
          <input
            type="text"
            value={content.title || ''}
            onChange={(e) => onChange({...content, title: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter code example title"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Code Description
        </label>
        <textarea
          value={content.description || ''}
          onChange={(e) => onChange({...content, description: e.target.value})}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe what this code example demonstrates"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Code Example *
        </label>
        <textarea
          value={content.code || ''}
          onChange={(e) => onChange({...content, code: e.target.value})}
          rows={8}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${
            errors.code ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Enter your code here..."
        />
        {errors.code && <p className="text-red-600 text-sm mt-1">{errors.code}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Expected Output (Optional)
        </label>
        <textarea
          value={content.output || ''}
          onChange={(e) => onChange({...content, output: e.target.value})}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          placeholder="Expected output or result"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Code Explanation
        </label>
        <textarea
          value={content.explanation || ''}
          onChange={(e) => onChange({...content, explanation: e.target.value})}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Explain how the code works..."
        />
      </div>
    </div>
  );
};

// MCQ Editor Component
const MCQEditor = ({ content, onChange, errors }) => {
  const [options, setOptions] = useState(content.options || [
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false }
  ]);

  const difficulties = ['EASY', 'MEDIUM', 'HARD'];

  const updateOption = (index, field, value) => {
    const updatedOptions = options.map((opt, i) => 
      i === index ? { ...opt, [field]: value } : opt
    );
    setOptions(updatedOptions);
    onChange({...content, options: updatedOptions});
  };

  const addOption = () => {
    if (options.length < 6) {
      const updatedOptions = [...options, { text: '', isCorrect: false }];
      setOptions(updatedOptions);
      onChange({...content, options: updatedOptions});
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const updatedOptions = options.filter((_, i) => i !== index);
      setOptions(updatedOptions);
      onChange({...content, options: updatedOptions});
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question *
        </label>
        <textarea
          value={content.question || ''}
          onChange={(e) => onChange({...content, question: e.target.value})}
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.question ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Enter your question here..."
        />
        {errors.question && <p className="text-red-600 text-sm mt-1">{errors.question}</p>}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Answer Options *
          </label>
          <button
            onClick={addOption}
            disabled={options.length >= 6}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Plus size={14} />
            <span>Add Option</span>
          </button>
        </div>
        
        <div className="space-y-3">
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={option.isCorrect}
                  onChange={(e) => updateOption(index, 'isCorrect', e.target.checked)}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-600">{String.fromCharCode(65 + index)}</span>
              </div>
              
              <input
                type="text"
                value={option.text}
                onChange={(e) => updateOption(index, 'text', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Option ${String.fromCharCode(65 + index)}`}
              />
              
              {options.length > 2 && (
                <button
                  onClick={() => removeOption(index)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
        
        {errors.options && <p className="text-red-600 text-sm mt-1">{errors.options}</p>}
        {errors.correctAnswer && <p className="text-red-600 text-sm mt-1">{errors.correctAnswer}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty Level
          </label>
          <select
            value={content.difficulty || 'MEDIUM'}
            onChange={(e) => onChange({...content, difficulty: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {difficulties.map(diff => (
              <option key={diff} value={diff}>
                {diff.charAt(0) + diff.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Limit (seconds)
          </label>
          <input
            type="number"
            value={content.timeLimit || ''}
            onChange={(e) => onChange({...content, timeLimit: parseInt(e.target.value) || 0})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0 for no limit"
            min="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Explanation (Optional)
        </label>
        <textarea
          value={content.explanation || ''}
          onChange={(e) => onChange({...content, explanation: e.target.value})}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Explain the correct answer..."
        />
      </div>
    </div>
  );
};

// Practice Editor Component
const PracticeEditor = ({ content, onChange, errors }) => {
  const [testCases, setTestCases] = useState(content.testCases || []);
  const [hints, setHints] = useState(content.hints || []);
  const [newTestCase, setNewTestCase] = useState({ input: '', expectedOutput: '' });
  const [newHint, setNewHint] = useState('');

  const addTestCase = () => {
    if (newTestCase.input.trim() && newTestCase.expectedOutput.trim()) {
      const updatedTestCases = [...testCases, newTestCase];
      setTestCases(updatedTestCases);
      onChange({...content, testCases: updatedTestCases});
      setNewTestCase({ input: '', expectedOutput: '' });
    }
  };

  const removeTestCase = (index) => {
    const updatedTestCases = testCases.filter((_, i) => i !== index);
    setTestCases(updatedTestCases);
    onChange({...content, testCases: updatedTestCases});
  };

  const addHint = () => {
    if (newHint.trim()) {
      const updatedHints = [...hints, newHint.trim()];
      setHints(updatedHints);
      onChange({...content, hints: updatedHints});
      setNewHint('');
    }
  };

  const removeHint = (index) => {
    const updatedHints = hints.filter((_, i) => i !== index);
    setHints(updatedHints);
    onChange({...content, hints: updatedHints});
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Practice Title
        </label>
        <input
          type="text"
          value={content.title || ''}
          onChange={(e) => onChange({...content, title: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter practice exercise title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Problem Description *
        </label>
        <textarea
          value={content.description || ''}
          onChange={(e) => onChange({...content, description: e.target.value})}
          rows={4}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.description ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Describe the programming problem..."
        />
        {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Starter Code (Optional)
        </label>
        <textarea
          value={content.starterCode || ''}
          onChange={(e) => onChange({...content, starterCode: e.target.value})}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          placeholder="Provide starter code for students..."
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Test Cases
          </label>
          <button
            onClick={addTestCase}
            disabled={!newTestCase.input.trim() || !newTestCase.expectedOutput.trim()}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Plus size={14} />
            <span>Add Test Case</span>
          </button>
        </div>
        
        <div className="space-y-3 mb-4">
          {testCases.map((testCase, index) => (
            <div key={index} className="p-3 border border-gray-200 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Input</label>
                  <div className="p-2 bg-gray-50 rounded text-sm font-mono">{testCase.input}</div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Expected Output</label>
                  <div className="p-2 bg-gray-50 rounded text-sm font-mono">{testCase.expectedOutput}</div>
                </div>
              </div>
              <button
                onClick={() => removeTestCase(index)}
                className="text-red-600 hover:bg-red-50 px-2 py-1 rounded text-sm"
              >
                <Trash2 size={14} className="inline mr-1" />
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <input
            type="text"
            value={newTestCase.input}
            onChange={(e) => setNewTestCase({...newTestCase, input: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            placeholder="Test input"
          />
          <input
            type="text"
            value={newTestCase.expectedOutput}
            onChange={(e) => setNewTestCase({...newTestCase, expectedOutput: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            placeholder="Expected output"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Hints
          </label>
          <button
            onClick={addHint}
            disabled={!newHint.trim()}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Plus size={14} />
            <span>Add Hint</span>
          </button>
        </div>
        
        <div className="space-y-2 mb-3">
          {hints.map((hint, index) => (
            <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
              <span className="text-xs font-medium text-gray-500 w-8">{index + 1}.</span>
              <span className="flex-1 text-sm">{hint}</span>
              <button
                onClick={() => removeHint(index)}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        
        <input
          type="text"
          value={newHint}
          onChange={(e) => setNewHint(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHint())}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Add a hint to help students"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Solution (Optional - for instructors)
        </label>
        <textarea
          value={content.solution || ''}
          onChange={(e) => onChange({...content, solution: e.target.value})}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          placeholder="Provide the solution code..."
        />
      </div>
    </div>
  );
};

export default SectionEditor;