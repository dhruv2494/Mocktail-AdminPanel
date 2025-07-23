import React, { useState, useEffect, useCallback } from 'react';
import { Upload, Plus, Grid, List, RefreshCw, Settings } from 'lucide-react';
import { PDFCard } from '../components/pdf/PDFCard';
import { PDFFilters } from '../components/pdf/PDFFilters';
import { PDFStats } from '../components/pdf/PDFStats';
import { PDFEditModal } from '../components/modals/PDFEditModal';
import { PDFPreviewModal } from '../components/modals/PDFPreviewModal';
import { PDFUploadDropzone } from '../components/pdf/PDFUploadDropzone';
import { ConfirmModal } from '../components/modals/ConfirmModal';
import { CategoryManager } from '../components/pdf/CategoryManager';
import { PDFListSkeleton, PDFHeaderSkeleton, PDFFilterSkeleton } from '../components/common/PDFSkeletonLoader';
import pdfService, { PDF, PDFFilters as PDFFiltersType, PDFCategory, PDFStats as PDFStatsType } from '../services/pdfService';
import toast from 'react-hot-toast';

export const PDFManagement: React.FC = () => {
  // State management
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [stats, setStats] = useState<PDFStatsType | null>(null);
  const [categories, setCategories] = useState<PDFCategory[]>([]);
  const [examTypes, setExamTypes] = useState<Array<{ id: number; name: string }>>([]);
  const [testSeries, setTestSeries] = useState<Array<{ id: string; title: string }>>([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [filtersLoading, setFiltersLoading] = useState(true);
  
  // UI states
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  
  // Modal states
  const [editModal, setEditModal] = useState({ isOpen: false, pdf: null as PDF | null });
  const [previewModal, setPreviewModal] = useState({ isOpen: false, pdf: null as PDF | null });
  const [confirmModal, setConfirmModal] = useState({ 
    isOpen: false, 
    pdf: null as PDF | null, 
    loading: false 
  });

  // Filter state
  const [filters, setFilters] = useState<PDFFiltersType>({
    search: '',
    category_id: '',
    access_level: '',
    exam_type_id: '',
    test_series_id: '',
    page: 1,
    limit: 12,
    sort_by: 'created_at',
    sort_order: 'DESC'
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0
  });

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load PDFs when filters change
  useEffect(() => {
    loadPDFs();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadStats(),
        loadCategories(),
        loadExamTypes(),
        loadTestSeries()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load initial data');
    } finally {
      setFiltersLoading(false);
    }
  };

  const loadPDFs = async () => {
    setLoading(true);
    try {
      const response = await pdfService.getPDFs(filters);
      
      // Handle different response structures
      if (response.success && Array.isArray(response.data)) {
        setPdfs(response.data);
        setPagination(response.pagination);
      } else if (Array.isArray(response)) {
        // Direct array response
        setPdfs(response);
        setPagination({ 
          total: response.length, 
          page: 1, 
          limit: 12, 
          totalPages: Math.ceil(response.length / 12) 
        });
      } else {
        setPdfs([]);
        setPagination({ total: 0, page: 1, limit: 12, totalPages: 0 });
      }
    } catch (error: any) {
      console.error('Error loading PDFs:', error);
      toast.error('Failed to load PDFs');
      setPdfs([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const response = await pdfService.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await pdfService.getCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadExamTypes = async () => {
    try {
      const response = await pdfService.getExamTypes();
      if (response.success) {
        setExamTypes(response.data);
      }
    } catch (error) {
      console.error('Error loading exam types:', error);
    }
  };

  const loadTestSeries = async () => {
    try {
      const response = await pdfService.getTestSeries();
      if (response.success) {
        setTestSeries(response.data);
      }
    } catch (error) {
      console.error('Error loading test series:', error);
    }
  };

  // Event handlers
  const handleFiltersChange = useCallback((newFilters: PDFFiltersType) => {
    setFilters(newFilters);
  }, []);

  const handleRefresh = async () => {
    await Promise.all([loadPDFs(), loadStats(), loadCategories()]);
    toast.success('Data refreshed successfully');
  };

  const handlePreview = (pdf: PDF) => {
    setPreviewModal({ isOpen: true, pdf });
  };

  const handleEdit = (pdf: PDF) => {
    setEditModal({ isOpen: true, pdf });
  };

  const handleDownload = async (pdf: PDF) => {
    try {
      const blob = await pdfService.downloadPDF(pdf.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = pdf.original_filename || `${pdf.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download PDF');
    }
  };

  const handleDelete = (pdf: PDF) => {
    setConfirmModal({ isOpen: true, pdf, loading: false });
  };

  const handleConfirmDelete = async () => {
    if (!confirmModal.pdf) return;

    setConfirmModal(prev => ({ ...prev, loading: true }));
    try {
      await pdfService.deletePDF(confirmModal.pdf.id);
      toast.success('PDF deleted successfully');
      loadPDFs();
      loadStats();
      setConfirmModal({ isOpen: false, pdf: null, loading: false });
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete PDF');
      setConfirmModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleUploadSuccess = () => {
    toast.success('PDF uploaded successfully');
    loadPDFs();
    loadStats();
    setShowUploadForm(false);
  };

  const handleUploadError = (error: string) => {
    toast.error(error);
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Render pagination
  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, pagination.page - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm font-medium rounded-md ${
            i === pagination.page
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </p>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {pages}
            <button
              onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.page + 1))}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        {filtersLoading || statsLoading ? (
          <PDFHeaderSkeleton />
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">PDF Management</h1>
                <p className="text-gray-600 mt-2">
                  Manage your educational resources and study materials
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  onClick={() => setShowCategoryManager(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Categories
                </button>
                <div className="flex items-center bg-white border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={() => setShowUploadForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload PDF
                </button>
              </div>
            </div>

            {/* Statistics */}
            <div className="mb-8">
              <PDFStats stats={stats!} loading={statsLoading} />
            </div>
          </>
        )}

        {/* Upload Form */}
        {showUploadForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Upload New PDF</h2>
              <button
                onClick={() => setShowUploadForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Plus className="h-6 w-6 rotate-45" />
              </button>
            </div>
            <PDFUploadDropzone
              categories={categories}
              testSeries={testSeries}
              examTypes={examTypes}
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
          </div>
        )}

        {/* Filters */}
        {filtersLoading ? (
          <PDFFilterSkeleton />
        ) : (
          <div className="mb-8">
            <PDFFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              categories={categories}
              examTypes={examTypes}
              testSeries={testSeries}
              loading={loading}
            />
          </div>
        )}

        {/* PDF Grid */}
        {loading ? (
          <PDFListSkeleton count={filters.limit} />
        ) : pdfs.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
              <Upload className="h-24 w-24 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No PDFs found</h3>
              <p className="text-gray-600 mb-6">
                {filters.search || filters.category_id || filters.access_level
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Upload your first PDF to get started.'}
              </p>
              <button
                onClick={() => setShowUploadForm(true)}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload PDF
              </button>
            </div>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }>
            {pdfs.map((pdf) => (
              <PDFCard
                key={pdf.id}
                pdf={pdf}
                onPreview={handlePreview}
                onEdit={handleEdit}
                onDownload={handleDownload}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && pdfs.length > 0 && (
          <div className="mt-8">
            {renderPagination()}
          </div>
        )}

        {/* Modals */}
        <PDFEditModal
          isOpen={editModal.isOpen}
          onClose={() => setEditModal({ isOpen: false, pdf: null })}
          pdf={editModal.pdf}
          categories={categories}
          testSeries={testSeries}
          examTypes={examTypes}
          onUpdate={() => {
            loadPDFs();
            loadStats();
          }}
        />

        <PDFPreviewModal
          isOpen={previewModal.isOpen}
          onClose={() => setPreviewModal({ isOpen: false, pdf: null })}
          pdf={previewModal.pdf}
        />

        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, pdf: null, loading: false })}
          onConfirm={handleConfirmDelete}
          title="Delete PDF"
          message={`Are you sure you want to delete "${confirmModal.pdf?.title}"? This action cannot be undone.`}
          confirmText="Delete"
          type="danger"
          loading={confirmModal.loading}
        />

        <CategoryManager
          isOpen={showCategoryManager}
          onClose={() => setShowCategoryManager(false)}
          categories={categories}
          onUpdate={() => {
            loadCategories();
            loadPDFs();
            loadStats();
          }}
        />
      </div>
    </div>
  );
};