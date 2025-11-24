import React, { useState } from 'react';
import { X, Eye, Play, CheckCircle, Clock, ArrowLeft, Save, Send, BookOpen, Code, HelpCircle } from 'lucide-react';

const CoursePreview = ({ course, sections, onClose, onSave, hasChanges }) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);

  const currentSection = sections[currentSectionIndex];
  const progress = sections.length > 0 ? ((currentSectionIndex + 1) / sections.length) * 100 : 0;

  const sectionIcons = {
    CONCEPT: BookOpen,
    CODE: Code,
    MCQ: HelpCircle,
    PRACTICE: Play
  };

  const getSectionIcon = (type) => {
    const Icon = sectionIcons[type] || BookOpen;
    return <Icon className="w-5 h-5" />;
  };

  const handleNextSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    }
  };

  const handlePreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  const handlePublish = () => {
    setShowPublishConfirm(true);
  };

  const confirmPublish = async () => {
    try {
      await onSave();
      setShowPublishConfirm(false);
      onClose();
    } catch (error) {
      console.error('Failed to publish course:', error);
    }
  };

  const renderSectionContent = (section) => {
    switch (section.type) {
      case 'CONCEPT':
        return <ConceptSection content={section.content} />;
      case 'CODE':
        return <CodeSection content={section.content} />;
      case 'MCQ':
        return <MCQSection content={section.content} />;
      case 'PRACTICE':
        return <PracticeSection content={section.content} />;
      default:
        return <div>Unknown section type</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full h-full max-w-6xl mx-4 my-4 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{course?.title}</h1>
                <p className="text-sm text-gray-600">Course Preview</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {hasChanges && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                Unsaved changes
              </span>
            )}
            
            <button
              onClick={onSave}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
            
            <button
              onClick={handlePublish}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Publish Course</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-100 px-6 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Section {currentSectionIndex + 1} of {sections.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Sidebar - Course Outline */}
          <div className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Outline</h2>
              
              <div className="space-y-2">
                {sections.map((section, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSectionIndex(index)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      currentSectionIndex === index
                        ? 'bg-blue-100 border-2 border-blue-300'
                        : 'bg-white border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-1 rounded ${
                        currentSectionIndex === index ? 'bg-blue-200' : 'bg-gray-100'
                      }`}>
                        {getSectionIcon(section.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {section.title}
                        </h3>
                        <p className="text-xs text-gray-500 capitalize">
                          {section.type.toLowerCase()}
                        </p>
                      </div>
                      
                      {currentSectionIndex === index && (
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto p-8">
              {currentSection && (
                <div className="space-y-6">
                  {/* Section Header */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        {getSectionIcon(currentSection.type)}
                      </div>
                      
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                          {currentSection.title}
                        </h1>
                        {currentSection.description && (
                          <p className="text-gray-600 mt-1">
                            {currentSection.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Estimated: 5-10 min</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4" />
                        <span>Interactive</span>
                      </div>
                    </div>
                  </div>

                  {/* Section Content */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    {renderSectionContent(currentSection)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between rounded-b-lg">
          <button
            onClick={handlePreviousSection}
            disabled={currentSectionIndex === 0}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onSave}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              Save Progress
            </button>
            
            {currentSectionIndex === sections.length - 1 ? (
              <button
                onClick={handlePublish}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Complete & Publish</span>
              </button>
            ) : (
              <button
                onClick={handleNextSection}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>Next Section</span>
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Publish Confirmation Modal */}
      {showPublishConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ready to Publish?
              </h3>
              
              <p className="text-sm text-gray-600 mb-6">
                Your course "{course?.title}" will be made available to learners. 
                This action will make the course live and accessible.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPublishConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  onClick={confirmPublish}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Publish Course
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Concept Section Component
const ConceptSection = ({ content }) => {
  return (
    <div className="space-y-6">
      <div className="prose max-w-none">
        <div dangerouslySetInnerHTML={{ __html: content.text.replace(/\n/g, '<br />') }} />
      </div>
      
      {content.keyPoints && content.keyPoints.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Key Points to Remember</h3>
          <ul className="space-y-2">
            {content.keyPoints.map((point, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-blue-800">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {content.examples && content.examples.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">Examples</h3>
          <div className="space-y-3">
            {content.examples.map((example, index) => (
              <div key={index} className="bg-white border border-green-200 rounded-lg p-4">
                <p className="text-green-800">{example}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Code Section Component
const CodeSection = ({ content }) => {
  return (
    <div className="space-y-6">
      {content.title && (
        <h2 className="text-xl font-semibold text-gray-900">{content.title}</h2>
      )}
      
      {content.description && (
        <p className="text-gray-600">{content.description}</p>
      )}
      
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
          <span className="text-sm text-gray-300 font-mono">
            {content.language || 'java'}
          </span>
          <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
            Copy Code
          </button>
        </div>
        <pre className="p-4 text-sm text-gray-300 font-mono overflow-x-auto">
          <code>{content.code}</code>
        </pre>
      </div>
      
      {content.output && (
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Expected Output:</h4>
          <pre className="text-sm text-gray-800 font-mono">{content.output}</pre>
        </div>
      )}
      
      {content.explanation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Code Explanation</h3>
          <p className="text-blue-800">{content.explanation}</p>
        </div>
      )}
    </div>
  );
};

// MCQ Section Component
const MCQSection = ({ content }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  
  const handleAnswerSelect = (index) => {
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    setShowExplanation(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{content.question}</h2>
        
        {content.difficulty && (
          <div className="mb-4">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              content.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
              content.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {content.difficulty}
            </span>
          </div>
        )}
        
        <div className="space-y-3">
          {content.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
                selectedAnswer === index
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedAnswer === index ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                }`}>
                  {selectedAnswer === index && (
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  )}
                </div>
                <span className="font-medium">{String.fromCharCode(65 + index)}. {option.text}</span>
              </div>
            </button>
          ))}
        </div>
        
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {content.timeLimit && content.timeLimit > 0 && (
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Time limit: {content.timeLimit}s</span>
              </div>
            )}
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Answer
          </button>
        </div>
      </div>
      
      {showExplanation && content.explanation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Explanation</h3>
          <p className="text-blue-800">{content.explanation}</p>
          
          {content.options[selectedAnswer]?.isCorrect ? (
            <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">Correct!</span>
              </div>
            </div>
          ) : (
            <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <X className="w-5 h-5 text-red-600" />
                <span className="text-red-800 font-medium">Incorrect. Try again!</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Practice Section Component
const PracticeSection = ({ content }) => {
  const [userCode, setUserCode] = useState(content.starterCode || '');
  const [showHint, setShowHint] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);

  const handleRunCode = () => {
    // This would typically send the code to a backend for execution
    alert('Code execution would be handled by the backend in a real implementation');
  };

  const handleShowHint = () => {
    setShowHint(true);
  };

  const handleNextHint = () => {
    if (currentHintIndex < (content.hints?.length || 0) - 1) {
      setCurrentHintIndex(currentHintIndex + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{content.title || 'Practice Exercise'}</h2>
        <p className="text-gray-600 mb-6">{content.description}</p>
        
        {content.testCases && content.testCases.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Test Cases</h3>
            <div className="space-y-2">
              {content.testCases.map((testCase, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Input:</span>
                      <pre className="mt-1 text-gray-800 font-mono">{testCase.input}</pre>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Expected Output:</span>
                      <pre className="mt-1 text-gray-800 font-mono">{testCase.expectedOutput}</pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Code Editor</h3>
          <div className="flex items-center space-x-3">
            {content.hints && content.hints.length > 0 && (
              <button
                onClick={handleShowHint}
                className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-lg hover:bg-yellow-200 transition-colors"
              >
                Show Hint
              </button>
            )}
            
            <button
              onClick={handleRunCode}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>Run Code</span>
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <textarea
            value={userCode}
            onChange={(e) => setUserCode(e.target.value)}
            className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Write your solution here..."
          />
        </div>
      </div>

      {showHint && content.hints && content.hints.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-yellow-900">Hint {currentHintIndex + 1}</h3>
            
            {currentHintIndex < content.hints.length - 1 && (
              <button
                onClick={handleNextHint}
                className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Next Hint
              </button>
            )}
          </div>
          
          <p className="text-yellow-800">{content.hints[currentHintIndex]}</p>
        </div>
      )}
    </div>
  );
};

export default CoursePreview;