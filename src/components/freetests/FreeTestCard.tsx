import React from 'react';
import { 
  Clock, Users, FileText, Edit, Trash2, Copy, Star, 
  Play, BarChart3, Calendar, BookOpen, Timer, CheckCircle,
  AlertTriangle, Globe, MoreVertical
} from 'lucide-react';
import { FreeTest } from '../../services/freeTestService';

interface FreeTestCardProps {
  test: FreeTest;
  onEdit: (test: FreeTest) => void;
  onDelete: (test: FreeTest) => void;
  onDuplicate: (test: FreeTest) => void;
  onToggleStatus: (test: FreeTest) => void;
  onToggleFeatured: (test: FreeTest) => void;
  onViewQuestions: (test: FreeTest) => void;
  onViewAnalytics: (test: FreeTest) => void;
  onPreview: (test: FreeTest) => void;
}

const testTypeConfig = {
  practice: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '📚', label: 'Practice' },
  mock: { color: 'bg-red-100 text-red-800 border-red-200', icon: '🎯', label: 'Mock' },
  sample: { color: 'bg-green-100 text-green-800 border-green-200', icon: '📋', label: 'Sample' },
  general: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: '🧠', label: 'General' }
};

export const FreeTestCard: React.FC<FreeTestCardProps> = ({
  test,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleStatus,
  onToggleFeatured,
  onViewQuestions,
  onViewAnalytics,
  onPreview
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const typeConfig = testTypeConfig[test.test_type];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center flex-1 min-w-0">
            <div className="flex-shrink-0 p-3 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50">
              <span className="text-xl">{typeConfig.icon}</span>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <div className="flex items-center mb-1">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                  {test.title}
                </h3>
                {test.is_featured && (
                  <Star className="h-4 w-4 text-yellow-500 ml-2 flex-shrink-0" fill="currentColor" />
                )}
                {test.supports_multilanguage && (
                  <Globe className="h-4 w-4 text-blue-500 ml-1 flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${typeConfig.color}`}>
                  {typeConfig.label}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  test.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {test.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="relative group/menu flex-shrink-0">
            <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
              <MoreVertical className="h-4 w-4" />
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-200 z-10">
              <div className="py-1">
                <button
                  onClick={() => onPreview(test)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Preview Test
                </button>
                <button
                  onClick={() => onEdit(test)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Details
                </button>
                <button
                  onClick={() => onDuplicate(test)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </button>
                <button
                  onClick={() => onViewQuestions(test)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Manage Questions
                </button>
                <button
                  onClick={() => onViewAnalytics(test)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </button>
                <div className="border-t border-gray-100"></div>
                <button
                  onClick={() => onToggleStatus(test)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {test.is_active ? (
                    <>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Activate
                    </>
                  )}
                </button>
                <button
                  onClick={() => onToggleFeatured(test)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Star className="h-4 w-4 mr-2" />
                  {test.is_featured ? 'Remove from Featured' : 'Mark as Featured'}
                </button>
                <div className="border-t border-gray-100"></div>
                <button
                  onClick={() => onDelete(test)}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {test.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
            {test.description}
          </p>
        )}

        {/* Subject and Hierarchy Info */}
        {(test.subject || test.subjectHierarchy) && (
          <div className="flex items-center space-x-2 mb-4">
            {test.subject && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-md">
                <BookOpen className="h-3 w-3 mr-1" />
                {test.subject.name}
              </span>
            )}
            {test.subjectHierarchy && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-md">
                {test.subjectHierarchy.level_name}
              </span>
            )}
          </div>
        )}

        {/* Test Statistics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-blue-900">Questions</p>
                <p className="text-lg font-bold text-blue-600">
                  {test.total_questions}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-900">Duration</p>
                <p className="text-lg font-bold text-green-600">
                  {formatDuration(test.duration_minutes)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Test Settings */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            {test.allows_pause_resume && (
              <div className="flex items-center">
                <Timer className="h-4 w-4 mr-1 text-orange-500" />
                <span>Pause/Resume</span>
              </div>
            )}
            {test.negative_marking && (
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1 text-red-500" />
                <span>-{test.negative_marks}</span>
              </div>
            )}
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{test.attemptCount || 0} attempts</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{formatDate(test.created_at)}</span>
          </div>
          {test.creator && (
            <span>by {test.creator.name}</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => onPreview(test)}
            className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium py-2 px-3 rounded-lg transition-colors duration-200 inline-flex items-center justify-center"
          >
            <Play className="h-4 w-4 mr-2" />
            Preview
          </button>
          <button
            onClick={() => onViewQuestions(test)}
            className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-3 rounded-lg transition-colors duration-200 inline-flex items-center justify-center"
          >
            <FileText className="h-4 w-4 mr-2" />
            Questions
          </button>
          <button
            onClick={() => onViewAnalytics(test)}
            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
          >
            <BarChart3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(test)}
            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};