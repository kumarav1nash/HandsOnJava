import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, Save, Eye, ArrowLeft, Settings, Trash2, Edit3, Move, 
  Code, BookOpen, HelpCircle, Play, CheckCircle, Clock, AlertCircle 
} from 'lucide-react';
import { coursesAdminApi } from '../../services/coursesAdminApi';
import SectionEditor from './SectionEditor';
import CoursePreview from './CoursePreview';
import { toast } from 'sonner';

const CourseBuilder = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  const sectionTypes = [
    {
      type: 'CONCEPT',
      label: 'Concept',
      description: 'Explain a key concept or theory',
      icon: BookOpen,
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      type: 'CODE',
      label: 'Code Example',
      description: 'Provide code examples and explanations',
      icon: Code,
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      type: 'MCQ',
      label: 'Multiple Choice',
      description: 'Create quiz questions to test understanding',
      icon: HelpCircle,
      color: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    {
      type: 'PRACTICE',
      label: 'Practice Exercise',
      description: 'Hands-on coding exercises',
      icon: Play,
      color: 'bg-orange-100 text-orange-800 border-orange-200'
    }
  ];

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const [courseResponse, sectionsResponse] = await Promise.all([
        coursesAdminApi.getCourse(courseId),
        coursesAdminApi.getCourseSections(courseId)
      ]);
      
      setCourse(courseResponse.data);
      setSections(sectionsResponse.data || []);
    } catch (error) {
      console.error('Error fetching course data:', error);
      toast.error('Failed to load course data');
      navigate('/admin/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = (type) => {
    const newSection = {
      id: `temp-${Date.now()}`,
      type,
      title: `New ${sectionTypes.find(st => st.type === type)?.label} Section`,
      content: getDefaultContent(type),
      orderIndex: sections.length,
      isNew: true
    };
    
    setSections([...sections, newSection]);
    setEditingSection(newSection);
    setHasChanges(true);
  };

  const getDefaultContent = (type) => {
    switch (type) {
      case 'CONCEPT':
        return {
          text: '',
          keyPoints: [],
          examples: []
        };
      case 'CODE':
        return {
          title: '',
          description: '',
          language: 'java',
          code: '',
          output: '',
          explanation: ''
        };
      case 'MCQ':
        return {
          question: '',
          options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
          ],
          explanation: '',
          difficulty: 'MEDIUM'
        };
      case 'PRACTICE':
        return {
          title: '',
          description: '',
          starterCode: '',
          testCases: [],
          hints: [],
          solution: ''
        };
      default:
        return {};
    }
  };

  const handleEditSection = (section) => {
    setEditingSection(section);
  };

  const handleSaveSection = (updatedSection) => {
    setSections(sections.map(section => 
      section.id === updatedSection.id ? updatedSection : section
    ));
    setEditingSection(null);
    setHasChanges(true);
    toast.success('Section saved successfully');
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Are you sure you want to delete this section? This action cannot be undone.')) {
      return;
    }

    try {
      if (!sectionId.startsWith('temp-')) {
        await coursesAdminApi.deleteCourseSection(courseId, sectionId);
      }
      
      setSections(sections.filter(section => section.id !== sectionId));
      setHasChanges(true);
      toast.success('Section deleted successfully');
    } catch (error) {
      console.error('Error deleting section:', error);
      toast.error('Failed to delete section');
    }
  };

  const handleReorderSections = (newOrder) => {
    setSections(newOrder);
    setHasChanges(true);
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      
      // Save new sections first to get their real IDs
      const newSections = sections.filter(s => s.isNew);
      const existingSections = sections.filter(s => !s.isNew);
      
      // Add new sections
      for (const section of newSections) {
        const response = await coursesAdminApi.addCourseSection(courseId, {
          type: section.type,
          title: section.title,
          content: section.content,
          orderIndex: section.orderIndex
        });
        
        // Replace temp ID with real ID
        const updatedSection = { ...section, id: response.data.id, isNew: false };
        setSections(prev => prev.map(s => s.id === section.id ? updatedSection : s));
      }
      
      // Update existing sections
      for (const section of existingSections) {
        await coursesAdminApi.updateCourseSection(courseId, section.id, {
          title: section.title,
          content: section.content,
          orderIndex: section.orderIndex
        });
      }
      
      // Reorder sections if needed
      const sectionIds = sections.map(s => s.id.startsWith('temp-') ? 
        sections.find(ns => ns.tempId === s.id)?.id || s.id : s.id
      );
      await coursesAdminApi.reorderCourseSections(courseId, sectionIds);
      
      setHasChanges(false);
      toast.success('All changes saved successfully');
    } catch (error) {
      console.error('Error saving sections:', error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleBackToManagement = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/admin/courses');
      }
    } else {
      navigate('/admin/courses');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (showPreview) {
    return (
      <CoursePreview
        course={course}
        sections={sections}
        onClose={() => setShowPreview(false)}
        onSave={handleSaveAll}
        hasChanges={hasChanges}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToManagement}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Course Builder</h1>
                <p className="text-sm text-gray-600">{course?.title}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {hasChanges && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                  Unsaved changes
                </span>
              )}
              
              <button
                onClick={handlePreview}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </button>
              
              <button
                onClick={handleSaveAll}
                disabled={saving || !hasChanges}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save All'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Section Types */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Section</h2>
              <div className="space-y-3">
                {sectionTypes.map((sectionType) => {
                  const Icon = sectionType.icon;
                  return (
                    <button
                      key={sectionType.type}
                      onClick={() => handleAddSection(sectionType.type)}
                      className={`w-full p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${sectionType.color}`}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className="w-5 h-5 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{sectionType.label}</h3>
                          <p className="text-xs opacity-90 mt-1">
                            {sectionType.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {/* Course Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Course Info</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Total Sections:</span>
                    <span className="font-medium">{sections.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`font-medium ${
                      course?.status === 'PUBLISHED' ? 'text-green-600' :
                      course?.status === 'IN_REVIEW' ? 'text-yellow-600' :
                      'text-gray-600'
                    }`}>
                      {course?.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Difficulty:</span>
                    <span className="font-medium">{course?.difficultyLevel}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Sections */}
          <div className="lg:col-span-3">
            {sections.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <BookOpen className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No sections yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start building your course by adding sections from the sidebar
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {sectionTypes.slice(0, 2).map((sectionType) => {
                    const Icon = sectionType.icon;
                    return (
                      <button
                        key={sectionType.type}
                        onClick={() => handleAddSection(sectionType.type)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${sectionType.color}`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{sectionType.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {sections.map((section, index) => {
                  const sectionType = sectionTypes.find(st => st.type === section.type);
                  const Icon = sectionType.icon;
                  
                  return (
                    <div
                      key={section.id}
                      className={`bg-white rounded-lg shadow-sm border-2 transition-all ${
                        editingSection?.id === section.id ? 'border-blue-500 shadow-md' : 'border-gray-200'
                      }`}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${sectionType.color}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-sm font-medium text-gray-500">
                                  Section {index + 1}
                                </span>
                                <span className={`px-2 py-1 text-xs rounded-full ${sectionType.color}`}>
                                  {sectionType.label}
                                </span>
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {section.title}
                              </h3>
                              {section.description && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {section.description}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditSection(section)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit section"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => handleDeleteSection(section.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete section"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Section Preview */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-sm text-gray-600">
                            {getSectionPreview(section)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section Editor Modal */}
      {editingSection && (
        <SectionEditor
          section={editingSection}
          onSave={handleSaveSection}
          onClose={() => setEditingSection(null)}
        />
      )}
    </div>
  );
};

const getSectionPreview = (section) => {
  switch (section.type) {
    case 'CONCEPT':
      return section.content.text ? 
        `${section.content.text.substring(0, 100)}...` : 
        'Concept content will appear here';
    
    case 'CODE':
      return section.content.code ? 
        `Code example in ${section.content.language}` : 
        'Code example will appear here';
    
    case 'MCQ':
      return section.content.question ? 
        `Question: ${section.content.question.substring(0, 80)}...` : 
        'Multiple choice question will appear here';
    
    case 'PRACTICE':
      return section.content.description ? 
        section.content.description.substring(0, 100) + '...' : 
        'Practice exercise will appear here';
    
    default:
      return 'Section content will appear here';
  }
};

export default CourseBuilder;