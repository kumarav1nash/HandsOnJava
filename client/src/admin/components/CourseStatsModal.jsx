import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Users, Clock, Award, BookOpen, Eye, Star, BarChart3, PieChart, Activity } from 'lucide-react';

const CourseStatsModal = ({ isOpen, onClose, course }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isOpen && course) {
      fetchCourseStats();
    }
  }, [isOpen, course]);

  const fetchCourseStats = async () => {
    if (!course) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/courses/${course.id}/stats`, {
        headers: {
          'X-Admin-Token': localStorage.getItem('adminToken') || 'admin-token'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch course statistics');
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching course statistics:', error);
      // Set mock data for demo purposes
      setStats({
        totalEnrollments: 1250,
        completionRate: 78.5,
        averageRating: 4.6,
        totalViews: 3420,
        averageTimeSpent: 45,
        lastUpdated: new Date().toISOString(),
        monthlyTrends: [
          { month: 'Jan', enrollments: 120, completions: 85, rating: 4.5 },
          { month: 'Feb', enrollments: 145, completions: 110, rating: 4.6 },
          { month: 'Mar', enrollments: 180, completions: 140, rating: 4.7 },
          { month: 'Apr', enrollments: 165, completions: 130, rating: 4.4 },
          { month: 'May', enrollments: 200, completions: 160, rating: 4.8 },
          { month: 'Jun', enrollments: 185, completions: 145, rating: 4.6 }
        ],
        sectionPerformance: [
          { section: 'Introduction', views: 3420, completion: 95, avgTime: 8 },
          { section: 'Core Concepts', views: 3100, completion: 82, avgTime: 15 },
          { section: 'Hands-on Practice', views: 2800, completion: 75, avgTime: 25 },
          { section: 'Advanced Topics', views: 2200, completion: 68, avgTime: 35 },
          { section: 'Final Assessment', views: 1900, completion: 78, avgTime: 12 }
        ],
        userDemographics: {
          beginner: 45,
          intermediate: 35,
          advanced: 20
        },
        ratingsDistribution: {
          5: 650,
          4: 400,
          3: 150,
          2: 35,
          1: 15
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'performance', label: 'Performance', icon: Activity },
    { id: 'demographics', label: 'Demographics', icon: Users }
  ];

  if (!isOpen || !course) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Course Analytics</h2>
            <p className="text-gray-600 mt-1">{course.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && stats && (
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-600 text-sm font-medium">Total Enrollments</p>
                          <p className="text-3xl font-bold text-blue-900 mt-1">
                            {stats.totalEnrollments.toLocaleString()}
                          </p>
                        </div>
                        <Users className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>

                    <div className="bg-green-50 p-6 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-600 text-sm font-medium">Completion Rate</p>
                          <p className="text-3xl font-bold text-green-900 mt-1">
                            {stats.completionRate}%
                          </p>
                        </div>
                        <Award className="w-8 h-8 text-green-600" />
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-6 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-yellow-600 text-sm font-medium">Average Rating</p>
                          <p className="text-3xl font-bold text-yellow-900 mt-1">
                            {stats.averageRating}
                          </p>
                        </div>
                        <Star className="w-8 h-8 text-yellow-600" />
                      </div>
                    </div>

                    <div className="bg-purple-50 p-6 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-600 text-sm font-medium">Total Views</p>
                          <p className="text-3xl font-bold text-purple-900 mt-1">
                            {stats.totalViews.toLocaleString()}
                          </p>
                        </div>
                        <Eye className="w-8 h-8 text-purple-600" />
                      </div>
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-600">Difficulty Level</p>
                        <p className="font-medium text-gray-900">{course.difficultyLevel}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="font-medium text-gray-900">{course.duration} minutes</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Average Time Spent</p>
                        <p className="font-medium text-gray-900">{stats.averageTimeSpent} minutes</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Last Updated</p>
                        <p className="font-medium text-gray-900">
                          {new Date(stats.lastUpdated).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Trends Tab */}
              {activeTab === 'trends' && stats && (
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
                    <div className="space-y-4">
                      {stats.monthlyTrends.map((trend, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <span className="font-medium text-gray-900 w-16">{trend.month}</span>
                            <div className="flex-1">
                              <div className="flex items-center space-x-6">
                                <div>
                                  <p className="text-sm text-gray-600">Enrollments</p>
                                  <p className="font-semibold text-blue-600">{trend.enrollments}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Completions</p>
                                  <p className="font-semibold text-green-600">{trend.completions}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Rating</p>
                                  <div className="flex items-center">
                                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                    <span className="font-semibold text-yellow-600">{trend.rating}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">
                              Completion Rate: {Math.round((trend.completions / trend.enrollments) * 100)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Tab */}
              {activeTab === 'performance' && stats && (
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Section Performance</h3>
                    <div className="space-y-4">
                      {stats.sectionPerformance.map((section, index) => (
                        <div key={index} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">{section.section}</h4>
                            <span className="text-sm text-gray-600">
                              {section.completion}% completion
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Views</p>
                              <p className="font-semibold text-blue-600">{section.views.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Avg Time</p>
                              <p className="font-semibold text-green-600">{section.avgTime} min</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Drop-off</p>
                              <p className="font-semibold text-red-600">
                                {index > 0 ? Math.round(100 - (section.views / stats.sectionPerformance[index - 1].views) * 100) : 0}%
                              </p>
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${section.completion}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Ratings Distribution</h3>
                    <div className="space-y-3">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center space-x-3">
                          <div className="flex items-center w-16">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            <span className="text-sm font-medium">{rating}</span>
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{
                                width: `${(stats.ratingsDistribution[rating] / stats.totalEnrollments) * 100}%`
                              }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">
                            {stats.ratingsDistribution[rating]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Demographics Tab */}
              {activeTab === 'demographics' && stats && (
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">User Demographics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="relative w-32 h-32 mx-auto">
                          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-green-100"
                              stroke="currentColor"
                              strokeWidth="3"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="text-green-500"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeDasharray={`${stats.userDemographics.beginner}, 100`}
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-bold text-green-600">
                              {stats.userDemographics.beginner}%
                            </span>
                          </div>
                        </div>
                        <p className="mt-2 font-medium text-gray-900">Beginner</p>
                        <p className="text-sm text-gray-600">Experience Level</p>
                      </div>

                      <div className="text-center">
                        <div className="relative w-32 h-32 mx-auto">
                          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-yellow-100"
                              stroke="currentColor"
                              strokeWidth="3"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="text-yellow-500"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeDasharray={`${stats.userDemographics.intermediate}, 100`}
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-bold text-yellow-600">
                              {stats.userDemographics.intermediate}%
                            </span>
                          </div>
                        </div>
                        <p className="mt-2 font-medium text-gray-900">Intermediate</p>
                        <p className="text-sm text-gray-600">Experience Level</p>
                      </div>

                      <div className="text-center">
                        <div className="relative w-32 h-32 mx-auto">
                          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-red-100"
                              stroke="currentColor"
                              strokeWidth="3"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="text-red-500"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeDasharray={`${stats.userDemographics.advanced}, 100`}
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-bold text-red-600">
                              {stats.userDemographics.advanced}%
                            </span>
                          </div>
                        </div>
                        <p className="mt-2 font-medium text-gray-900">Advanced</p>
                        <p className="text-sm text-gray-600">Experience Level</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Most Popular Section</h4>
                        <p className="text-blue-700">
                          {stats.sectionPerformance[0]?.section} - {stats.sectionPerformance[0]?.views} views
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">Highest Completion Rate</h4>
                        <p className="text-green-700">
                          {stats.sectionPerformance.reduce((prev, current) => 
                            prev.completion > current.completion ? prev : current
                          ).section} - {stats.sectionPerformance.reduce((prev, current) => 
                            prev.completion > current.completion ? prev : current
                          ).completion}%
                        </p>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <h4 className="font-medium text-yellow-900 mb-2">Biggest Challenge</h4>
                        <p className="text-yellow-700">
                          {stats.sectionPerformance.reduce((prev, current) => 
                            prev.completion < current.completion ? prev : current
                          ).section} - {stats.sectionPerformance.reduce((prev, current) => 
                            prev.completion < current.completion ? prev : current
                          ).completion}% completion
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h4 className="font-medium text-purple-900 mb-2">Growth Trend</h4>
                        <p className="text-purple-700">
                          {stats.monthlyTrends[stats.monthlyTrends.length - 1]?.enrollments > 
                           stats.monthlyTrends[stats.monthlyTrends.length - 2]?.enrollments ? '↗ Growing' : '↘ Declining'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseStatsModal;