import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Tag, Clock, BarChart3, BookOpen, Eye, Save, Send, RefreshCw } from 'lucide-react';

const CourseEditModal = ({ isOpen, onClose, course, onCourseUpdated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    duration: '',
    difficultyLevel: 'BEGINNER',
    tags: [],
    prerequisites: [],
    metadata: {
      learningObjectives: [],
      targetAudience: '',
      estimatedCompletionTime: ''
    }
  });
  
  const [currentTag, setCurrentTag] = useState('');
  const [currentPrerequisite, setCurrentPrerequisite] = useState('');
  const [currentObjective, setCurrentObjective] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  const difficultyLevels = [
    { value: 'BEGINNER', label: 'Beginner', color: 'bg-green-100 text-green-800' },
    { value: 'INTERMEDIATE', label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'ADVANCED', label: 'Advanced', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    if (isOpen && course) {
      setFormData({
        title: course.title || '',
        description: course.description || '',
        thumbnail: course.thumbnail || '',
        duration: course.duration || '',
        difficultyLevel: course.difficultyLevel || 'BEGINNER',
        tags: course.tags || [],
        prerequisites: course.prerequisites || [],
        metadata: {
          learningObjectives: course.metadata?.learningObjectives || [],
          targetAudience: course.metadata?.targetAudience || '',
          estimatedCompletionTime: course.metadata?.estimatedCompletionTime || ''
        }
      });
      setErrors({});
      setHasChanges(false);
    }
  }, [isOpen, course]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Course title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Course description is required';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }
    
    if (formData.duration && (isNaN(formData.duration) || formData.duration <= 0)) {
      newErrors.duration = 'Duration must be a positive number';
    }
    
    if (formData.metadata.estimatedCompletionTime && isNaN(formData.metadata.estimatedCompletionTime)) {
      newErrors.estimatedCompletionTime = 'Estimated completion time must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleMetadataChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
      setHasChanges(true);
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
    setHasChanges(true);
  };

  const addPrerequisite = () => {
    if (currentPrerequisite.trim() && !formData.prerequisites.includes(currentPrerequisite.trim())) {
      setFormData(prev => ({
        ...prev,
        prerequisites: [...prev.prerequisites, currentPrerequisite.trim()]
      }));
      setCurrentPrerequisite('');
      setHasChanges(true);
    }
  };

  const removePrerequisite = (prerequisiteToRemove) => {
    setFormData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.filter(prereq => prereq !== prerequisiteToRemove)
    }));
    setHasChanges(true);
  };

  const addObjective = () => {
    if (currentObjective.trim() && !formData.metadata.learningObjectives.includes(currentObjective.trim())) {
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          learningObjectives: [...prev.metadata.learningObjectives, currentObjective.trim()]
        }
      }));
      setCurrentObjective('');
      setHasChanges(true);
    }
  };

  const removeObjective = (objectiveToRemove) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        learningObjectives: prev.metadata.learningObjectives.filter(obj => obj !== objectiveToRemove)
      }
    }));
    setHasChanges(true);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({
          ...prev,
          thumbnail: 'Image size must be less than 5MB'
        }));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          thumbnail: e.target.result
        }));
        setErrors(prev => ({
          ...prev,
          thumbnail: ''
        }));
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/admin/courses/${course.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': localStorage.getItem('adminToken') || 'admin-token'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to update course');
      }

      const updatedCourse = await response.json();
      onCourseUpdated(updatedCourse);
      setHasChanges(false);
    } catch (error) {
      console.error('Error updating course:', error);
      setErrors({
        submit: 'Failed to update course. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAsDraft = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setErrors({ title: 'Course title is required even for draft' });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/admin/courses/${course.id}/draft`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': localStorage.getItem('adminToken') || 'admin-token'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to save draft');
      }

      const updatedCourse = await response.json();
      onCourseUpdated(updatedCourse);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving draft:', error);
      setErrors({
        submit: 'Failed to save draft. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetToOriginal = () => {
    if (course) {
      setFormData({
        title: course.title || '',
        description: course.description || '',
        thumbnail: course.thumbnail || '',
        duration: course.duration || '',
        difficultyLevel: course.difficultyLevel || 'BEGINNER',
        tags: course.tags || [],
        prerequisites: course.prerequisites || [],
        metadata: {
          learningObjectives: course.metadata?.learningObjectives || [],
          targetAudience: course.metadata?.targetAudience || '',
          estimatedCompletionTime: course.metadata?.estimatedCompletionTime || ''
        }
      });
      setErrors({});
      setHasChanges(false);
    }
  };

  if (!isOpen || !course) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <h2 className="text-2xl font-bold text-gray-900 mr-4">Edit Course</h2>
            {hasChanges && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                Unsaved changes
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <button
                onClick={handleResetToOriginal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center"
                title="Reset to original"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Course Status Info */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Status: <span className={`px-2 py-1 rounded-full text-xs ${
                  course.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                  course.status === 'IN_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                  course.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {course.status}
                </span>
              </span>
              <span className="text-sm text-gray-600">
                Version: {course.version || 1}
              </span>
              <span className="text-sm text-gray-600">
                Created: {new Date(course.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-lg hover:bg-blue-200 transition-colors flex items-center"
              >
                <Eye className="w-3 h-3 mr-1" />
                Preview
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{errors.submit}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter course title"
                />
                {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Describe your course in detail (minimum 50 characters)"
                />
                {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
                <p className="text-gray-500 text-sm mt-1">{formData.description.length}/50 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.duration ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Estimated duration"
                  min="1"
                />
                {errors.duration && <p className="text-red-600 text-sm mt-1">{errors.duration}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={formData.difficultyLevel}
                  onChange={(e) => handleInputChange('difficultyLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {difficultyLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Thumbnail Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              Course Thumbnail
            </h3>
            
            <div className="flex flex-col items-center justify-center w-full">
              {formData.thumbnail ? (
                <div className="relative">
                  <img
                    src={formData.thumbnail}
                    alt="Course thumbnail"
                    className="w-48 h-32 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => handleInputChange('thumbnail', '')}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
              {errors.thumbnail && <p className="text-red-600 text-sm mt-2">{errors.thumbnail}</p>}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Tag className="w-5 h-5 mr-2" />
              Tags
            </h3>
            
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Prerequisites */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Prerequisites</h3>
            
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={currentPrerequisite}
                onChange={(e) => setCurrentPrerequisite(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrerequisite())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add a prerequisite"
              />
              <button
                type="button"
                onClick={addPrerequisite}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              {formData.prerequisites.map((prerequisite, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">{prerequisite}</span>
                  <button
                    type="button"
                    onClick={() => removePrerequisite(prerequisite)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Objectives */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Learning Objectives
            </h3>
            
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={currentObjective}
                onChange={(e) => setCurrentObjective(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add a learning objective"
              />
              <button
                type="button"
                onClick={addObjective}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              {formData.metadata.learningObjectives.map((objective, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">{objective}</span>
                  <button
                    type="button"
                    onClick={() => removeObjective(objective)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Metadata */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Additional Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={formData.metadata.targetAudience}
                  onChange={(e) => handleMetadataChange('targetAudience', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Beginner developers, Data scientists"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Completion Time (hours)
                </label>
                <input
                  type="number"
                  value={formData.metadata.estimatedCompletionTime}
                  onChange={(e) => handleMetadataChange('estimatedCompletionTime', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.estimatedCompletionTime ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 8"
                  min="1"
                />
                {errors.estimatedCompletionTime && (
                  <p className="text-red-600 text-sm mt-1">{errors.estimatedCompletionTime}</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSaveAsDraft}
                disabled={isSubmitting || !hasChanges}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Save as Draft
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting || !hasChanges}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Updating...' : 'Update Course'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseEditModal;