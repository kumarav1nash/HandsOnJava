import React, { useState } from 'react';
import { X, AlertTriangle, Play, Pause, Trash2, Users, BarChart3 } from 'lucide-react';

const CourseBulkActions = ({ courseIds, onClose, onAction }) => {
  const [selectedAction, setSelectedAction] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const actions = [
    {
      id: 'publish',
      label: 'Publish Courses',
      description: 'Make selected courses available to learners',
      icon: Play,
      color: 'text-green-600 bg-green-50 border-green-200',
      confirmRequired: false,
      confirmText: ''
    },
    {
      id: 'unpublish',
      label: 'Unpublish Courses',
      description: 'Remove selected courses from public access',
      icon: Pause,
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      confirmRequired: false,
      confirmText: ''
    },
    {
      id: 'delete',
      label: 'Delete Courses',
      description: 'Permanently remove selected courses and all associated data',
      icon: Trash2,
      color: 'text-red-600 bg-red-50 border-red-200',
      confirmRequired: true,
      confirmText: 'DELETE'
    }
  ];

  const handleActionSelect = (actionId) => {
    setSelectedAction(actionId);
    setConfirmText('');
  };

  const handleConfirm = async () => {
    if (isProcessing) return;

    const action = actions.find(a => a.id === selectedAction);
    if (action?.confirmRequired && confirmText !== action.confirmText) {
      return;
    }

    setIsProcessing(true);
    
    try {
      await onAction(selectedAction, courseIds);
      onClose();
    } catch (error) {
      console.error('Bulk action failed:', error);
      // Error handling is done in parent component
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedActionData = actions.find(a => a.id === selectedAction);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Bulk Actions</h2>
            <p className="text-gray-600 text-sm mt-1">
              {courseIds.length} course{courseIds.length !== 1 ? 's' : ''} selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {!selectedAction ? (
            <div className="space-y-4">
              <p className="text-gray-700 mb-6">
                Choose an action to perform on the selected courses:
              </p>
              
              {actions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => handleActionSelect(action.id)}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${action.color}`}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className="w-5 h-5 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-base mb-1">
                          {action.label}
                        </h3>
                        <p className="text-sm opacity-90">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Confirmation Screen */}
              <div className={`p-4 rounded-lg border-2 ${selectedActionData.color}`}>
                <div className="flex items-start space-x-3">
                  <selectedActionData.icon className="w-5 h-5 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-base mb-1">
                      {selectedActionData.label}
                    </h3>
                    <p className="text-sm opacity-90">
                      {selectedActionData.description}
                    </p>
                  </div>
                </div>
              </div>

              {selectedActionData.confirmRequired && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-red-800 font-medium mb-2">
                        This action cannot be undone
                      </h4>
                      <p className="text-red-700 text-sm mb-3">
                        You are about to permanently delete {courseIds.length} course{courseIds.length !== 1 ? 's' : ''}. 
                        All course content, enrollments, and progress data will be lost.
                      </p>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-red-800">
                          Type "DELETE" to confirm:
                        </label>
                        <input
                          type="text"
                          value={confirmText}
                          onChange={(e) => setConfirmText(e.target.value)}
                          className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="DELETE"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Course List */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  Selected Courses ({courseIds.length}):
                </h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {courseIds.map((courseId, index) => (
                    <div key={courseId} className="text-sm text-gray-600 bg-white px-3 py-2 rounded border">
                      Course ID: {courseId}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedAction('')}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                >
                  ← Back
                </button>
                
                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleConfirm}
                    disabled={isProcessing || (selectedActionData.confirmRequired && confirmText !== selectedActionData.confirmText)}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      selectedAction === 'delete'
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : selectedAction === 'publish'
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-yellow-600 text-white hover:bg-yellow-700'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                        Processing...
                      </>
                    ) : (
                      selectedActionData.label
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseBulkActions;