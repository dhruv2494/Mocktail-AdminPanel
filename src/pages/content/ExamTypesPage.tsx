import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Award, Users } from 'lucide-react';
import { CardSkeleton } from '../../components/common/LoadingSpinner';
import { ApiError, ErrorBoundary } from '../../components/common/ErrorBoundary';
import { ConfirmModal } from '../../components/modals/ConfirmModal';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface ExamType {
  id: number;
  name: string;
  code: string;
  description: string;
  is_active: boolean;
  created_at: string;
  testSeriesCount?: number;
  pyqCount?: number;
}

interface ExamTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  examType?: ExamType;
  mode: 'create' | 'edit';
}

const ExamTypeModal: React.FC<ExamTypeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  examType,
  mode
}) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && examType) {
      setFormData({
        name: examType.name || '',
        code: examType.code || '',
        description: examType.description || '',
        is_active: examType.is_active !== undefined ? examType.is_active : true
      });
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        is_active: true
      });
    }
    setErrors({});
  }, [mode, examType, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Exam name is required';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Exam code is required';
    } else if (formData.code.length > 10) {
      newErrors.code = 'Code should be 10 characters or less';
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
        await api.post('/admin/exam-types', formData);
        toast.success('Exam type created successfully');
      } else {
        await api.put(`/admin/exam-types/${examType?.id}`, formData);
        toast.success('Exam type updated successfully');
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Exam type operation error:', error);
      const errorMessage = error.response?.data?.message || `Failed to ${mode} exam type`;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Add New Exam Type' : 'Edit Exam Type'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exam Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`input-field ${errors.name ? 'border-red-500' : ''}`}
              placeholder="e.g., Deputy Section Officer, PSI, GPSC"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exam Code *
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className={`input-field ${errors.code ? 'border-red-500' : ''}`}
              placeholder="e.g., DSO, PSI, GPSC"
              maxLength={10}
            />
            {errors.code && (
              <p className="text-red-500 text-sm mt-1">{errors.code}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">Short code for identification</p>
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
              className="input-field"
              placeholder="Brief description of the exam..."
            />
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
              {loading ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ExamTypesPage: React.FC = () => {
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [examTypeModal, setExamTypeModal] = useState({ isOpen: false, mode: 'create' as 'create' | 'edit', examType: null as ExamType | null });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, examType: null as ExamType | null, loading: false });

  const fetchExamTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/admin/exam-types', {
        params: { search: searchTerm }
      });
      
      if (response.data && response.data.success) {
        setExamTypes(response.data.data || []);
      } else {
        setError('Invalid response format');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch exam types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamTypes();
  }, [searchTerm]);

  // CRUD handlers
  const handleAddExamType = () => {
    setExamTypeModal({ isOpen: true, mode: 'create', examType: null });
  };

  const handleEditExamType = (examType: ExamType) => {
    setExamTypeModal({ isOpen: true, mode: 'edit', examType });
  };

  const handleDeleteExamType = (examType: ExamType) => {
    setConfirmModal({ isOpen: true, examType, loading: false });
  };

  const handleConfirmDelete = async () => {
    try {
      setConfirmModal(prev => ({ ...prev, loading: true }));
      await api.delete(`/admin/exam-types/${confirmModal.examType?.id}`);
      toast.success('Exam type deleted successfully');
      fetchExamTypes();
      setConfirmModal({ isOpen: false, examType: null, loading: false });
    } catch (error: any) {
      console.error('Delete exam type error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete exam type');
      setConfirmModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleModalSuccess = () => {
    fetchExamTypes();
  };

  const filteredExamTypes = examTypes.filter(examType =>
    examType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    examType.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return <ApiError error={error} onRetry={fetchExamTypes} />;
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Exam Types</h1>
            <p className="text-gray-600">Manage exam categories for test series and PYQs</p>
          </div>
          <button 
            onClick={handleAddExamType}
            className="btn-primary inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Exam Type
          </button>
        </div>

        {/* Search */}
        <div className="card p-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search exam types..."
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Exam Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <CardSkeleton key={index} />
            ))
          ) : filteredExamTypes.length === 0 ? (
            <div className="col-span-full">
              <div className="card p-12 text-center">
                <Award className="mx-auto h-24 w-24 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No exam types found</h3>
                <p className="text-gray-600 mb-6">Get started by creating your first exam type.</p>
                <button onClick={handleAddExamType} className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Exam Type
                </button>
              </div>
            </div>
          ) : (
            filteredExamTypes.map((examType) => (
              <div key={examType.id} className="card hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="p-3 rounded-lg bg-primary-100">
                        <Award className="h-8 w-8 text-primary-600" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {examType.name}
                        </h3>
                        <p className="text-sm font-medium text-primary-600">
                          {examType.code}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      examType.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {examType.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {examType.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {examType.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{examType.testSeriesCount || 0} Series</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{examType.pyqCount || 0} PYQs</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>Created: {new Date(examType.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEditExamType(examType)}
                      className="flex-1 btn-secondary text-sm"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteExamType(examType)}
                      className="text-red-600 hover:text-red-900 p-2"
                      title="Delete Exam Type"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modals */}
        <ExamTypeModal
          isOpen={examTypeModal.isOpen}
          onClose={() => setExamTypeModal({ isOpen: false, mode: 'create', examType: null })}
          onSuccess={handleModalSuccess}
          examType={examTypeModal.examType}
          mode={examTypeModal.mode}
        />

        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, examType: null, loading: false })}
          onConfirm={handleConfirmDelete}
          title="Delete Exam Type"
          message={`Are you sure you want to delete "${confirmModal.examType?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          type="danger"
          loading={confirmModal.loading}
        />
      </div>
    </ErrorBoundary>
  );
};