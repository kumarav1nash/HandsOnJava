import React from 'react';
import { Edit, Trash2, Eye, BarChart3, Play, Pause, Clock, Tag, BookOpen } from 'lucide-react';
import styles from '../styles/CourseCard.module.css';

const CourseCard = ({ 
  course, 
  isSelected, 
  onSelect, 
  onEdit, 
  onDelete, 
  onPublish, 
  onUnpublish, 
  onPreview, 
  onEditContent, 
  onViewStats,
  getStatusColor,
  getDifficultyColor 
}) => {
  const statusColors = {
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    secondary: 'bg-gray-100 text-gray-800 border-gray-200',
    default: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const difficultyColors = {
    green: 'bg-green-100 text-green-800',
    orange: 'bg-orange-100 text-orange-800',
    red: 'bg-red-100 text-red-800',
    gray: 'bg-gray-100 text-gray-800'
  };

  const canEdit = course.status === 'DRAFT' || course.status === 'IN_REVIEW';
  const canPublish = course.status === 'DRAFT' || course.status === 'IN_REVIEW';
  const canUnpublish = course.status === 'PUBLISHED';

  return (
    <div className={`${styles.card} ${isSelected ? styles.selected : ''}`}>
      {/* Selection Checkbox */}
      <div className={styles.cardHeader}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(course.id, e.target.checked)}
          className={styles.checkbox}
        />
        <div className={styles.cardTitleSection}>
          <h3 className={styles.cardTitle}>{course.title}</h3>
          <div className={styles.cardMeta}>
            <span className={`${styles.statusBadge} ${statusColors[getStatusColor(course.status)]}`}>
              {course.status}
            </span>
            <span className={`${styles.difficultyBadge} ${difficultyColors[getDifficultyColor(course.difficultyLevel)]}`}>
              {course.difficultyLevel}
            </span>
          </div>
        </div>
      </div>

      {/* Course Thumbnail */}
      {course.thumbnail && (
        <div className={styles.cardImageWrapper}>
          <img
            src={course.thumbnail}
            alt={course.title}
            className={styles.cardImage}
          />
        </div>
      )}

      {/* Course Description */}
      <div className={styles.cardContent}>
        <p className={styles.cardDescription}>
          {course.description?.length > 150 
            ? `${course.description.substring(0, 150)}...` 
            : course.description || 'No description available'}
        </p>

        {/* Course Metadata */}
        <div className={styles.cardMetadata}>
          {course.duration && (
            <div className={styles.metadataItem}>
              <Clock size={14} />
              <span>{course.duration} min</span>
            </div>
          )}
          
          {course.tags && course.tags.length > 0 && (
            <div className={styles.metadataItem}>
              <Tag size={14} />
              <span>{course.tags.length} tags</span>
            </div>
          )}

          {course.metadata?.learningObjectives && course.metadata.learningObjectives.length > 0 && (
            <div className={styles.metadataItem}>
              <BookOpen size={14} />
              <span>{course.metadata.learningObjectives.length} objectives</span>
            </div>
          )}
        </div>

        {/* Course Stats */}
        <div className={styles.cardStats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Version</span>
            <span className={styles.statValue}>v{course.version || 1}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Updated</span>
            <span className={styles.statValue}>
              {new Date(course.updatedAt || course.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles.cardActions}>
        <div className={styles.actionGroup}>
          <button
            onClick={onViewStats}
            className={`${styles.actionButton} ${styles.statsButton}`}
            title="View Statistics"
          >
            <BarChart3 size={16} />
          </button>
          
          <button
            onClick={onPreview}
            className={`${styles.actionButton} ${styles.previewButton}`}
            title="Preview Course"
          >
            <Eye size={16} />
          </button>
        </div>

        <div className={styles.actionGroup}>
          {canPublish && (
            <button
              onClick={onPublish}
              className={`${styles.actionButton} ${styles.publishButton}`}
              title="Publish Course"
            >
              <Play size={16} />
            </button>
          )}
          
          {canUnpublish && (
            <button
              onClick={onUnpublish}
              className={`${styles.actionButton} ${styles.unpublishButton}`}
              title="Unpublish Course"
            >
              <Pause size={16} />
            </button>
          )}
          
          {canEdit && (
            <button
              onClick={onEdit}
              className={`${styles.actionButton} ${styles.editButton}`}
              title="Edit Course"
            >
              <Edit size={16} />
            </button>
          )}
          
          <button
            onClick={onEditContent}
            className={`${styles.actionButton} ${styles.contentButton}`}
            title="Edit Content"
          >
            <BookOpen size={16} />
          </button>
          
          <button
            onClick={onDelete}
            className={`${styles.actionButton} ${styles.deleteButton}`}
            title="Delete Course"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;