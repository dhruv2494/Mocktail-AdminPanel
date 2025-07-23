import React, { useState, useEffect } from 'react';
import { X, Save, Loader, Play, Globe, Timer, AlertTriangle, Star } from 'lucide-react';
import { FreeTest } from '../../services/freeTestService';
import freeTestService from '../../services/freeTestService';
import subjectService, { Subject, SubjectHierarchy } from '../../services/subjectService';
import toast from 'react-hot-toast';

interface FreeTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  test?: FreeTest | null;
  onUpdate: () => void;
}

export const FreeTestModal: React.FC<FreeTestModalProps> = ({
  isOpen,
  onClose,
  test,
  onUpdate
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    test_type: 'practice' as 'practice' | 'mock' | 'sample' | 'general',
    subject_id: '',
    subject_hierarchy_id: '',
    total_questions: 10,
    duration_minutes: 60,
    allows_pause_resume: true,
    negative_marking: false,
    negative_marks: 0.25,
    supports_multilanguage: false,
    instructions: '',
    is_active: true,
    is_featured: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [hierarchies, setHierarchies] = useState<SubjectHierarchy[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const isEditing = !!test;

  useEffect(() => {
    if (isOpen) {
      loadSubjects();
    }
  }, [isOpen]);

  useEffect(() => {
    if (test && isOpen) {
      setFormData({
        title: test.title || '',
        description: test.description || '',
        test_type: test.test_type || 'practice',
        subject_id: test.subject_id?.toString() || '',
        subject_hierarchy_id: test.subject_hierarchy_id?.toString() || '',
        total_questions: test.total_questions || 10,
        duration_minutes: test.duration_minutes || 60,
        allows_pause_resume: test.allows_pause_resume ?? true,
        negative_marking: test.negative_marking ?? false,
        negative_marks: test.negative_marks || 0.25,
        supports_multilanguage: test.supports_multilanguage ?? false,
        instructions: test.instructions || '',
        is_active: test.is_active ?? true,
        is_featured: test.is_featured ?? false
      });
      if (test.subject_id) {
        loadHierarchies(test.subject_id);
      }
    } else if (isOpen) {
      setFormData({
        title: '',
        description: '',
        test_type: 'practice',
        subject_id: '',
        subject_hierarchy_id: '',
        total_questions: 10,
        duration_minutes: 60,
        allows_pause_resume: true,
        negative_marking: false,
        negative_marks: 0.25,
        supports_multilanguage: false,
        instructions: '',
        is_active: true,
        is_featured: false
      });
    }
    setErrors({});
  }, [test, isOpen]);

  const loadSubjects = async () => {
    setLoadingSubjects(true);
    try {
      const response = await subjectService.getSubjects({ limit: 100 });
      if (response.success) {
        setSubjects(response.data);
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const loadHierarchies = async (subjectId: number) => {
    try {
      const response = await subjectService.getHierarchyTree(subjectId);
      if (response.success) {
        setHierarchies(response.data);
      }
    } catch (error) {
      console.error('Error loading hierarchies:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Test title is required';
    }

    if (formData.total_questions < 1) {
      newErrors.total_questions = 'At least 1 question is required';
    }

    if (formData.duration_minutes < 1) {
      newErrors.duration_minutes = 'Duration must be at least 1 minute';
    }

    if (formData.negative_marking && (formData.negative_marks < 0 || formData.negative_marks > 5)) {
      newErrors.negative_marks = 'Negative marks must be between 0 and 5';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        subject_id: formData.subject_id ? parseInt(formData.subject_id) : undefined,
        subject_hierarchy_id: formData.subject_hierarchy_id ? parseInt(formData.subject_hierarchy_id) : undefined,
        instructions: formData.instructions.trim() || undefined
      };

      if (isEditing && test) {
        await freeTestService.updateFreeTest(test.id, submitData);
        toast.success('Free test updated successfully');
      } else {
        await freeTestService.createFreeTest(submitData);
        toast.success('Free test created successfully');
      }
      
      onUpdate();
      onClose();
    } catch (error: any) {
      console.error('Free test save error:', error);
      const message = error.response?.data?.message || 
                     `Failed to ${isEditing ? 'update' : 'create'} free test`;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               name === 'total_questions' || name === 'duration_minutes' ? parseInt(value) || 0 :
               name === 'negative_marks' ? parseFloat(value) || 0 : value
    }));
    
    // Load hierarchies when subject changes
    if (name === 'subject_id' && value) {
      loadHierarchies(parseInt(value));
      setFormData(prev => ({ ...prev, subject_hierarchy_id: '' }));
    } else if (name === 'subject_id' && !value) {
      setHierarchies([]);
      setFormData(prev => ({ ...prev, subject_hierarchy_id: '' }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const renderHierarchyOptions = (hierarchies: SubjectHierarchy[], prefix = '') => {
    const options: JSX.Element[] = [];
    
    hierarchies.forEach(h => {
      options.push(
        <option key={h.id} value={h.id}>
          {prefix}{h.level_name} ({h.level_type})
        </option>
      );
      
      if (h.children && h.children.length > 0) {
        options.push(...renderHierarchyOptions(h.children, prefix + '  '));
      }
    });
    
    return options;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg mr-3">
              <Play className="h-5 w-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Free Test' : 'Create New Free Test'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Basic Mathematics Practice Test"
                  disabled={loading}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Type *
                </label>
                <select
                  name="test_type"
                  value={formData.test_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="practice">Practice Test</option>
                  <option value="mock">Mock Test</option>
                  <option value="sample">Sample Test</option>
                  <option value="general">General Test</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Brief description of the test"
                disabled={loading}
              />
            </div>
          </div>

          {/* Subject and Topic */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Subject & Topic
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  name="subject_id"
                  value={formData.subject_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={loading || loadingSubjects}
                >
                  <option value="">Select Subject (Optional)</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topic/Level
                </label>
                <select
                  name="subject_hierarchy_id"
                  value={formData.subject_hierarchy_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={loading || !formData.subject_id}
                >
                  <option value="">Select Topic (Optional)</option>
                  {renderHierarchyOptions(hierarchies)}
                </select>
                {!formData.subject_id && (
                  <p className="mt-1 text-xs text-gray-500">
                    Select a subject first to choose topics
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Test Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Test Configuration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Questions *
                </label>
                <input
                  type="number"
                  name="total_questions"
                  value={formData.total_questions}
                  onChange={handleChange}
                  min="1"
                  max="200"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.total_questions ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.total_questions && (
                  <p className="mt-1 text-sm text-red-600">{errors.total_questions}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  name="duration_minutes"
                  value={formData.duration_minutes}
                  onChange={handleChange}
                  min="1"
                  max="480"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.duration_minutes ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.duration_minutes && (
                  <p className="mt-1 text-sm text-red-600">{errors.duration_minutes}</p>
                )}
              </div>
            </div>
          </div>

          {/* Test Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Test Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allows_pause_resume"
                    name="allows_pause_resume"
                    checked={formData.allows_pause_resume}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    disabled={loading}
                  />
                  <label htmlFor="allows_pause_resume" className="ml-2 flex items-center text-sm text-gray-700">
                    <Timer className="h-4 w-4 mr-1 text-orange-500" />
                    Allow Pause & Resume
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="supports_multilanguage"
                    name="supports_multilanguage"
                    checked={formData.supports_multilanguage}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    disabled={loading}
                  />
                  <label htmlFor="supports_multilanguage" className="ml-2 flex items-center text-sm text-gray-700">
                    <Globe className="h-4 w-4 mr-1 text-blue-500" />
                    Multi-language Support
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="negative_marking"
                    name="negative_marking"
                    checked={formData.negative_marking}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    disabled={loading}
                  />
                  <label htmlFor="negative_marking" className="ml-2 flex items-center text-sm text-gray-700">
                    <AlertTriangle className="h-4 w-4 mr-1 text-red-500" />
                    Negative Marking
                  </label>
                </div>

                {formData.negative_marking && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Negative Marks per Wrong Answer
                    </label>
                    <input
                      type="number"
                      name="negative_marks"
                      value={formData.negative_marks}
                      onChange={handleChange}
                      min="0"
                      max="5"
                      step="0.25"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        errors.negative_marks ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={loading}
                    />
                    {errors.negative_marks && (
                      <p className="mt-1 text-sm text-red-600">{errors.negative_marks}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Instructions
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Instructions
              </label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter instructions for test takers (optional)"
                disabled={loading}
              />
            </div>
          </div>

          {/* Status Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Status & Visibility
            </h3>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  disabled={loading}
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                  Active (test is available to users)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_featured"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  disabled={loading}
                />
                <label htmlFor="is_featured" className="ml-2 flex items-center text-sm text-gray-700">
                  <Star className="h-4 w-4 mr-1 text-yellow-500" />
                  Featured (highlight on home page)
                </label>
              </div>
            </div>
          </div>

          {isEditing && test && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Current Statistics</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Questions Added:</span>
                  <span className="ml-2 font-medium">{test.questionCount || 0}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total Attempts:</span>
                  <span className="ml-2 font-medium">{test.attemptCount || 0}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors inline-flex items-center"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin h-4 w-4 mr-2" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Update Test' : 'Create Test'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};