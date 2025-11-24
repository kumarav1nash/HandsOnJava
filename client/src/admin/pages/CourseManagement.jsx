import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Edit, Trash2, Upload, Download, BarChart3, Settings, AlertCircle } from 'lucide-react';
import { coursesAdminApi } from '../../services/coursesAdminApi';
import CourseCreateModal from '../components/CourseCreateModal';
import CourseEditModal from '../components/CourseEditModal';
import CourseStatsModal from '../components/CourseStatsModal';
import CourseBulkActions from '../components/CourseBulkActions';
import CourseFilters from '../components/CourseFilters';
import CourseCard from '../components/CourseCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'sonner';
// import styles from '../styles/CourseManagement.module.css'; // File doesn't exist, using inline styles for now

const CourseManagement = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    difficulty: '',
    tags: []
  });
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [viewingStats, setViewingStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchCourses();
  }, [searchTerm, filters, currentPage, pageSize, sortBy, sortOrder]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {
        query: searchTerm,
        status: filters.status,
        difficultyLevel: filters.difficulty,
        tags: filters.tags.join(','),
        page: currentPage - 1,
        size: pageSize,
        sort: `${sortBy},${sortOrder}`
      };

      const response = await coursesAdminApi.searchCourses(params);
      setCourses(response.data);
      setTotalPages(Math.ceil(response.total / pageSize));
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (courseData) => {
    try {
      const response = await coursesAdminApi.createCourse(courseData);
      setCourses([response.data, ...(courses || [])]);
      toast.success('Course created successfully');
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('Failed to create course');
      throw error;
    }
  };

  const handleEditCourse = async (courseData) => {
    try {
      const response = await coursesAdminApi.updateCourse(editingCourse.id, courseData);
      setCourses((courses || []).map(course => 
        course.id === editingCourse.id ? response.data : course
      ));
      toast.success('Course updated successfully');
      setShowEditModal(false);
      setEditingCourse(null);
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error('Failed to update course');
      throw error;
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      await coursesAdminApi.deleteCourse(courseId);
      setCourses((courses || []).filter(course => course.id !== courseId));
      toast.success('Course deleted successfully');
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    }
  };

  const handlePublishCourse = async (courseId) => {
    try {
      const response = await coursesAdminApi.publishCourse(courseId);
      setCourses((courses || []).map(course => 
        course.id === courseId ? response.data : course
      ));
      toast.success('Course published successfully');
    } catch (error) {
      console.error('Error publishing course:', error);
      toast.error('Failed to publish course');
    }
  };

  const handleUnpublishCourse = async (courseId) => {
    try {
      const response = await coursesAdminApi.unpublishCourse(courseId);
      setCourses((courses || []).map(course => 
        course.id === courseId ? response.data : course
      ));
      toast.success('Course unpublished successfully');
    } catch (error) {
      console.error('Error unpublishing course:', error);
      toast.error('Failed to unpublish course');
    }
  };

  const handlePreviewCourse = (courseId) => {
    navigate(`/admin/courses/${courseId}/preview`);
  };

  const handleEditCourseContent = (courseId) => {
    navigate(`/admin/courses/${courseId}/builder`);
  };

  const handleViewStats = (course) => {
    setViewingStats(course);
    setShowStatsModal(true);
  };

  const handleBulkAction = async (action, courseIds) => {
    try {
      let response;
      switch (action) {
        case 'delete':
          response = await coursesAdminApi.bulkDeleteCourses(courseIds);
          setCourses((courses || []).filter(course => !courseIds.includes(course.id)));
          break;
        case 'publish':
          response = await coursesAdminApi.bulkPublishCourses(courseIds);
          setCourses((courses || []).map(course => 
            courseIds.includes(course.id) ? { ...course, status: 'PUBLISHED' } : course
          ));
          break;
        default:
          throw new Error('Unknown bulk action');
      }
      
      toast.success(`${response.data.successful} courses ${action}d successfully`);
      setSelectedCourses([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error('Failed to perform bulk action');
    }
  };

  const handleCourseSelect = (courseId, selected) => {
    if (selected) {
      setSelectedCourses([...selectedCourses, courseId]);
    } else {
      setSelectedCourses(selectedCourses.filter(id => id !== courseId));
    }
  };

  const handleSelectAll = (selected) => {
    if (selected) {
      setSelectedCourses((courses || []).map(course => course.id));
    } else {
      setSelectedCourses([]);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PUBLISHED': return 'success';
      case 'DRAFT': return 'warning';
      case 'IN_REVIEW': return 'info';
      case 'ARCHIVED': return 'secondary';
      default: return 'default';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'BEGINNER': return 'green';
      case 'INTERMEDIATE': return 'orange';
      case 'ADVANCED': return 'red';
      default: return 'gray';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
              <p className="text-gray-600 mt-1">Create, edit, and manage your courses</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
              Filters
            </button>
            {selectedCourses.length > 0 && (
              <button 
                className="px-4 py-2 border border-orange-300 rounded-md text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                onClick={() => setShowBulkActions(true)}
              >
                Bulk Actions ({selectedCourses.length})
              </button>
            )}
            <button 
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-2"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={16} />
              Create Course
            </button>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses by title, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {showFilters && (
        <CourseFilters
          filters={filters}
          onFiltersChange={setFilters}
          availableTags={[...new Set((courses || []).flatMap(course => course.tags || []))]}
        />
      )}

      <div className="mt-6 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Total Courses:</span>
          <span className="font-semibold text-gray-900">{(courses || []).length}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Published:</span>
          <span className="font-semibold text-green-600">
            {(courses || []).filter(c => c.status === 'PUBLISHED').length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Drafts:</span>
          <span className="font-semibold text-gray-600">
            {(courses || []).filter(c => c.status === 'DRAFT').length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">In Review:</span>
          <span className="font-semibold text-orange-600">
            {(courses || []).filter(c => c.status === 'IN_REVIEW').length}
          </span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {(courses || []).map(course => (
          <CourseCard
            key={course.id}
            course={course}
            isSelected={selectedCourses.includes(course.id)}
            onSelect={handleCourseSelect}
            onEdit={() => {
              setEditingCourse(course);
              setShowEditModal(true);
            }}
            onDelete={() => handleDeleteCourse(course.id)}
            onPublish={() => handlePublishCourse(course.id)}
            onUnpublish={() => handleUnpublishCourse(course.id)}
            onPreview={() => handlePreviewCourse(course.id)}
            onEditContent={() => handleEditCourseContent(course.id)}
            onViewStats={() => handleViewStats(course)}
            getStatusColor={getStatusColor}
            getDifficultyColor={getDifficultyColor}
          />
        ))}
      </div>

      {(courses || []).length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <AlertCircle size={48} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filters.status || filters.difficulty || filters.tags.length > 0
              ? "Try adjusting your search criteria or filters"
              : "Get started by creating your first course"
            }
          </p>
          {!searchTerm && filters.status === '' && filters.difficulty === '' && filters.tags.length === 0 && (
            <button 
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-2 mx-auto"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={16} />
              Create Your First Course
            </button>
          )}
        </div>
      )}

      {showCreateModal && (
        <CourseCreateModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCourseCreated={handleCreateCourse}
        />
      )}

      {showEditModal && editingCourse && (
        <CourseEditModal
          isOpen={showEditModal}
          course={editingCourse}
          onClose={() => {
            setShowEditModal(false);
            setEditingCourse(null);
          }}
          onCourseUpdated={handleEditCourse}
        />
      )}

      {showStatsModal && viewingStats && (
        <CourseStatsModal
          isOpen={showStatsModal}
          course={viewingStats}
          onClose={() => {
            setShowStatsModal(false);
            setViewingStats(null);
          }}
        />
      )}

      {showBulkActions && selectedCourses.length > 0 && (
        <CourseBulkActions
          courseIds={selectedCourses}
          onClose={() => setShowBulkActions(false)}
          onAction={handleBulkAction}
        />
      )}
    </div>
  );
};

export default CourseManagement;