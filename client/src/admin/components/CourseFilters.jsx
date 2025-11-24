import React, { useState } from 'react';
import { X, Filter, Tag, BarChart3, Clock } from 'lucide-react';

const CourseFilters = ({ filters, onFiltersChange, availableTags }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'IN_REVIEW', label: 'In Review' },
    { value: 'PUBLISHED', label: 'Published' },
    { value: 'ARCHIVED', label: 'Archived' }
  ];

  const difficultyOptions = [
    { value: '', label: 'All Levels' },
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' }
  ];

  const handleStatusChange = (status) => {
    const newFilters = { ...localFilters, status };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDifficultyChange = (difficulty) => {
    const newFilters = { ...localFilters, difficulty };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleTagToggle = (tag) => {
    const newTags = localFilters.tags.includes(tag)
      ? localFilters.tags.filter(t => t !== tag)
      : [...localFilters.tags, tag];
    
    const newFilters = { ...localFilters, tags: newTags };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearTag = (tag) => {
    const newTags = localFilters.tags.filter(t => t !== tag);
    const newFilters = { ...localFilters, tags: newTags };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearAll = () => {
    const clearedFilters = { status: '', difficulty: '', tags: [] };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = localFilters.status || localFilters.difficulty || localFilters.tags.length > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Status Filter */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-3">
            <Clock size={16} />
            <span>Status</span>
          </label>
          <select
            value={localFilters.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Filter */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-3">
            <BarChart3 size={16} />
            <span>Difficulty Level</span>
          </label>
          <select
            value={localFilters.difficulty}
            onChange={(e) => handleDifficultyChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {difficultyOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tags Filter */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-3">
            <Tag size={16} />
            <span>Tags</span>
          </label>
          <div className="relative">
            <button
              onClick={() => setShowTagDropdown(!showTagDropdown)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left flex items-center justify-between"
            >
              <span className="text-sm">
                {localFilters.tags.length > 0 
                  ? `${localFilters.tags.length} tags selected` 
                  : 'Select tags'}
              </span>
              <svg className={`w-4 h-4 transition-transform ${showTagDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showTagDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {availableTags.length > 0 ? (
                  <div className="p-2">
                    {availableTags.map(tag => (
                      <label key={tag} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localFilters.tags.includes(tag)}
                          onChange={() => handleTagToggle(tag)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{tag}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No tags available
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Active Filters:</h4>
          <div className="flex flex-wrap gap-2">
            {localFilters.status && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                Status: {statusOptions.find(opt => opt.value === localFilters.status)?.label}
                <button
                  onClick={() => handleStatusChange('')}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <X size={14} />
                </button>
              </span>
            )}
            
            {localFilters.difficulty && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                Level: {difficultyOptions.find(opt => opt.value === localFilters.difficulty)?.label}
                <button
                  onClick={() => handleDifficultyChange('')}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  <X size={14} />
                </button>
              </span>
            )}
            
            {localFilters.tags.map(tag => (
              <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                Tag: {tag}
                <button
                  onClick={() => handleClearTag(tag)}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseFilters;