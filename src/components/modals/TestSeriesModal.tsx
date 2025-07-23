import React, { useState, useEffect } from 'react';
import { X, BookOpen, FileText, DollarSign, Calendar, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

interface TestSeriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  testSeries?: any; // For edit mode
  mode: 'create' | 'edit';
}

export const TestSeriesModal: React.FC<TestSeriesModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  testSeries,
  mode
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    original_price: 0,
    category: '',
    exam_type: '',
    total_tests: 0,
    free_tests: 0,
    duration_months: 6,
    negative_marking: false,
    negative_marks: 0.25,
    pass_percentage: 40,
    instructions: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && testSeries) {
      setFormData({
        title: testSeries.title || '',
        description: testSeries.description || '',
        price: testSeries.price || 0,
        original_price: testSeries.original_price || 0,
        category: testSeries.category || '',
        exam_type: testSeries.exam_type || '',
        total_tests: testSeries.total_tests || 0,
        free_tests: testSeries.free_tests || 0,
        duration_months: testSeries.duration_months || 6,
        negative_marking: testSeries.negative_marking || false,
        negative_marks: testSeries.negative_marks || 0.25,
        pass_percentage: testSeries.pass_percentage || 40,
        instructions: testSeries.instructions || '',
        is_active: testSeries.is_active !== undefined ? testSeries.is_active : true
      });
    } else {
      setFormData({
        title: '',
        description: '',
        price: 0,
        original_price: 0,
        category: '',
        exam_type: '',
        total_tests: 0,
        free_tests: 0,
        duration_months: 6,
        negative_marking: false,
        negative_marks: 0.25,
        pass_percentage: 40,
        instructions: '',
        is_active: true
      });
    }
    setErrors({});
  }, [mode, testSeries, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!formData.exam_type.trim()) {
      newErrors.exam_type = 'Exam type is required';
    }

    if (formData.price < 0) {
      newErrors.price = 'Price cannot be negative';
    }

    if (formData.original_price < formData.price) {
      newErrors.original_price = 'Original price should be greater than or equal to price';
    }

    if (formData.total_tests < 0) {
      newErrors.total_tests = 'Total tests cannot be negative';
    }

    if (formData.free_tests > formData.total_tests) {
      newErrors.free_tests = 'Free tests cannot be more than total tests';
    }

    if (formData.pass_percentage < 0 || formData.pass_percentage > 100) {
      newErrors.pass_percentage = 'Pass percentage must be between 0 and 100';
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
      if (mode === 'create') {
        await api.post('/admin/test-series', formData);
        toast.success('Test series created successfully');
      } else {
        await api.put(`/admin/test-series/${testSeries.id}`, formData);
        toast.success('Test series updated successfully');
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Test series operation error:', error);
      const errorMessage = error.response?.data?.message || `Failed to ${mode} test series`;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Create New Test Series' : 'Edit Test Series'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`input-field pl-10 ${errors.title ? 'border-red-500' : ''}`}
                  placeholder="Enter test series title"
                />
              </div>
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className={`input-field pl-10 ${errors.description ? 'border-red-500' : ''}`}
                  placeholder="Enter test series description"
                />
              </div>
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`input-field ${errors.category ? 'border-red-500' : ''}`}
              >
                <option value="">Select Category</option>
                <option value="GPSC">GPSC</option>
                <option value="PSI">PSI</option>
                <option value="NCERT">NCERT</option>
                <option value="JEE">JEE</option>
                <option value="NEET">NEET</option>
                <option value="Other">Other</option>
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam Type *
              </label>
              <input
                type="text"
                name="exam_type"
                value={formData.exam_type}
                onChange={handleChange}
                className={`input-field ${errors.exam_type ? 'border-red-500' : ''}`}
                placeholder="e.g., Preliminary, Main"
              />
              {errors.exam_type && (
                <p className="text-red-500 text-sm mt-1">{errors.exam_type}</p>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₹)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={`input-field pl-10 ${errors.price ? 'border-red-500' : ''}`}
                  placeholder="0.00"
                />
              </div>
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Original Price (₹)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  name="original_price"
                  value={formData.original_price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={`input-field pl-10 ${errors.original_price ? 'border-red-500' : ''}`}
                  placeholder="0.00"
                />
              </div>
              {errors.original_price && (
                <p className="text-red-500 text-sm mt-1">{errors.original_price}</p>
              )}
            </div>
          </div>

          {/* Test Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Tests
              </label>
              <input
                type="number"
                name="total_tests"
                value={formData.total_tests}
                onChange={handleChange}
                min="0"
                className={`input-field ${errors.total_tests ? 'border-red-500' : ''}`}
              />
              {errors.total_tests && (
                <p className="text-red-500 text-sm mt-1">{errors.total_tests}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Free Tests
              </label>
              <input
                type="number"
                name="free_tests"
                value={formData.free_tests}
                onChange={handleChange}
                min="0"
                className={`input-field ${errors.free_tests ? 'border-red-500' : ''}`}
              />
              {errors.free_tests && (
                <p className="text-red-500 text-sm mt-1">{errors.free_tests}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (Months)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  name="duration_months"
                  value={formData.duration_months}
                  onChange={handleChange}
                  min="1"
                  className="input-field pl-10"
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pass Percentage (%)
              </label>
              <input
                type="number"
                name="pass_percentage"
                value={formData.pass_percentage}
                onChange={handleChange}
                min="0"
                max="100"
                className={`input-field ${errors.pass_percentage ? 'border-red-500' : ''}`}
              />
              {errors.pass_percentage && (
                <p className="text-red-500 text-sm mt-1">{errors.pass_percentage}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Negative Marks
              </label>
              <input
                type="number"
                name="negative_marks"
                value={formData.negative_marks}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="input-field"
                disabled={!formData.negative_marking}
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="negative_marking"
                id="negative_marking"
                checked={formData.negative_marking}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="negative_marking" className="ml-2 block text-sm text-gray-700">
                Enable Negative Marking
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                id="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                Active
              </label>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instructions
            </label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              rows={4}
              className="input-field"
              placeholder="Enter test series instructions..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : mode === 'create' ? 'Create Test Series' : 'Update Test Series'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};