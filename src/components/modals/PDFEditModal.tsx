import React, { useState, useEffect } from 'react';
import { X, Save, Loader } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface PDFEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdf: any;
  categories: any[];
  testSeries: any[];
  examTypes: any[];
  onUpdate: () => void;
}

export const PDFEditModal: React.FC<PDFEditModalProps> = ({
  isOpen,
  onClose,
  pdf,
  categories,
  testSeries,
  examTypes,
  onUpdate
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    access_level: 'free',
    test_series_id: '',
    exam_type_id: '',
    tags: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pdf && isOpen) {
      setFormData({
        title: pdf.title || '',
        description: pdf.description || '',
        category_id: pdf.category_id?.toString() || '',
        access_level: pdf.access_level || 'free',
        test_series_id: pdf.test_series_id?.toString() || '',
        exam_type_id: pdf.exam_type_id?.toString() || '',
        tags: pdf.tags ? (Array.isArray(pdf.tags) ? pdf.tags.join(', ') : pdf.tags) : ''
      });
    }
  }, [pdf, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdf?.id) return;

    setLoading(true);
    try {
      const updateData = {
        ...formData,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        test_series_id: formData.test_series_id || null,
        exam_type_id: formData.exam_type_id ? parseInt(formData.exam_type_id) : null,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : null
      };

      await api.put(`/admin/pdf/${pdf.id}`, updateData);
      toast.success('PDF updated successfully');
      onUpdate();
      onClose();
    } catch (error: any) {
      console.error('Update PDF error:', error);
      toast.error(error.response?.data?.message || 'Failed to update PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Edit PDF</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="Enter PDF title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="input-field"
              placeholder="Enter PDF description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Level
              </label>
              <select
                name="access_level"
                value={formData.access_level}
                onChange={handleChange}
                className="input-field"
              >
                <option value="free">Free</option>
                <option value="premium">Premium</option>
                <option value="restricted">Restricted</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Series
              </label>
              <select
                name="test_series_id"
                value={formData.test_series_id}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select test series</option>
                {testSeries.map((series) => (
                  <option key={series.id} value={series.id}>
                    {series.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam Type
              </label>
              <select
                name="exam_type_id"
                value={formData.exam_type_id}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select exam type</option>
                {examTypes.map((examType) => (
                  <option key={examType.id} value={examType.id}>
                    {examType.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter tags separated by commas"
            />
            <p className="text-sm text-gray-500 mt-1">
              Separate multiple tags with commas (e.g., physics, chemistry, biology)
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary inline-flex items-center"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin h-4 w-4 mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update PDF
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};