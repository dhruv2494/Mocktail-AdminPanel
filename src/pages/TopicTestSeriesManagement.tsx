import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, RefreshCw, BookOpen, Layers, TreePine, Grid, List } from 'lucide-react';
import { SubjectCard } from '../components/subjects/SubjectCard';
import { HierarchyTree } from '../components/subjects/HierarchyTree';
import { SubjectModal } from '../components/modals/SubjectModal';
import { HierarchyModal } from '../components/modals/HierarchyModal';
import { ConfirmModal } from '../components/modals/ConfirmModal';
import { PDFListSkeleton } from '../components/common/PDFSkeletonLoader';
import subjectService, { Subject, SubjectHierarchy, SubjectFilters } from '../services/subjectService';
import toast from 'react-hot-toast';

export const TopicTestSeriesManagement: React.FC = () => {
  // State management
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [hierarchies, setHierarchies] = useState<SubjectHierarchy[]>([]);
  const [loading, setLoading] = useState(true);
  const [hierarchyLoading, setHierarchyLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentView, setCurrentView] = useState<'subjects' | 'hierarchy'>('subjects');

  // Filter and search state
  const [filters, setFilters] = useState<SubjectFilters>({
    search: '',
    has_hierarchy: undefined,
    is_active: undefined,
    page: 1,
    limit: 12,
    sortBy: 'created_at',
    sortOrder: 'DESC'
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0
  });

  // Modal states
  const [subjectModal, setSubjectModal] = useState({ isOpen: false, subject: null as Subject | null });
  const [hierarchyModal, setHierarchyModal] = useState({ 
    isOpen: false, 
    hierarchy: null as SubjectHierarchy | null,
    parent: null as SubjectHierarchy | null
  });
  const [confirmModal, setConfirmModal] = useState({ 
    isOpen: false, 
    type: 'subject' as 'subject' | 'hierarchy',
    item: null as Subject | SubjectHierarchy | null, 
    loading: false 
  });

  // Statistics state
  const [stats, setStats] = useState({
    totalSubjects: 0,
    hierarchicalSubjects: 0,
    totalHierarchies: 0,
    totalTopicTests: 0
  });

  // Load subjects when filters change
  useEffect(() => {
    loadSubjects();
  }, [filters]);

  // Load initial data
  useEffect(() => {
    loadStats();
  }, []);

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const response = await subjectService.getSubjects(filters);
      if (response.success) {
        setSubjects(response.data);
        setPagination(response.pagination);
      }
    } catch (error: any) {
      console.error('Error loading subjects:', error);
      toast.error('Failed to load subjects');
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await subjectService.getSubjectStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadHierarchyTree = async (subject: Subject) => {
    setHierarchyLoading(true);
    try {
      const response = await subjectService.getHierarchyTree(subject.id);
      if (response.success) {
        setHierarchies(response.data);
      }
    } catch (error) {
      console.error('Error loading hierarchy tree:', error);
      toast.error('Failed to load hierarchy');
    } finally {
      setHierarchyLoading(false);
    }
  };

  // Event handlers
  const handleSearch = useCallback((searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  }, []);

  const handleRefresh = async () => {
    await Promise.all([loadSubjects(), loadStats()]);
    if (selectedSubject) {
      await loadHierarchyTree(selectedSubject);
    }
    toast.success('Data refreshed successfully');
  };

  const handleCreateSubject = () => {
    setSubjectModal({ isOpen: true, subject: null });
  };

  const handleEditSubject = (subject: Subject) => {
    setSubjectModal({ isOpen: true, subject });
  };

  const handleDeleteSubject = (subject: Subject) => {
    setConfirmModal({ isOpen: true, type: 'subject', item: subject, loading: false });
  };

  const handleManageHierarchy = async (subject: Subject) => {
    setSelectedSubject(subject);
    setCurrentView('hierarchy');
    await loadHierarchyTree(subject);
  };

  const handleViewTestSeries = (subject: Subject) => {
    toast.info(`Viewing test series for ${subject.name}`);
    // TODO: Navigate to test series page with subject filter
  };

  const handleCreateHierarchy = (parent: SubjectHierarchy | null) => {
    setHierarchyModal({ isOpen: true, hierarchy: null, parent });
  };

  const handleEditHierarchy = (hierarchy: SubjectHierarchy) => {
    setHierarchyModal({ isOpen: true, hierarchy, parent: null });
  };

  const handleDeleteHierarchy = (hierarchy: SubjectHierarchy) => {
    setConfirmModal({ isOpen: true, type: 'hierarchy', item: hierarchy, loading: false });
  };

  const handleViewHierarchyTestSeries = (hierarchy: SubjectHierarchy) => {
    toast.info(`Viewing test series for ${hierarchy.level_name}`);
    // TODO: Navigate to test series page with hierarchy filter
  };

  const handleConfirmDelete = async () => {
    if (!confirmModal.item) return;

    setConfirmModal(prev => ({ ...prev, loading: true }));
    try {
      if (confirmModal.type === 'subject') {
        const subject = confirmModal.item as Subject;
        await subjectService.deleteSubject(subject.id);
        toast.success('Subject deleted successfully');
        loadSubjects();
        loadStats();
      } else {
        const hierarchy = confirmModal.item as SubjectHierarchy;
        await subjectService.deleteHierarchy(hierarchy.id);
        toast.success('Hierarchy deleted successfully');
        if (selectedSubject) {
          await loadHierarchyTree(selectedSubject);
        }
      }
      setConfirmModal({ isOpen: false, type: 'subject', item: null, loading: false });
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete item');
      setConfirmModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleBackToSubjects = () => {
    setCurrentView('subjects');
    setSelectedSubject(null);
    setHierarchies([]);
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
              ? 'bg-indigo-600 text-white'
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center">
              {currentView === 'hierarchy' && selectedSubject && (
                <button
                  onClick={handleBackToSubjects}
                  className="mr-4 p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  ←
                </button>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {currentView === 'subjects' ? 'Topic-wise Test Series' : `Hierarchy: ${selectedSubject?.name}`}
                </h1>
                <p className="text-gray-600 mt-2">
                  {currentView === 'subjects' 
                    ? 'Manage subjects and their hierarchical structure for topic-wise tests'
                    : 'Manage the hierarchical structure for this subject'
                  }
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              disabled={loading || hierarchyLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${(loading || hierarchyLoading) ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            {currentView === 'subjects' && (
              <>
                <div className="flex items-center bg-white border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={handleCreateSubject}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subject
                </button>
              </>
            )}

            {currentView === 'hierarchy' && selectedSubject && (
              <button
                onClick={() => handleCreateHierarchy(null)}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Level
              </button>
            )}
          </div>
        </div>

        {/* Statistics Cards - Only show on subjects view */}
        {currentView === 'subjects' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-indigo-100">
                  <BookOpen className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Subjects</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSubjects}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <TreePine className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Hierarchical</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.hierarchicalSubjects}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <Layers className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Hierarchies</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalHierarchies}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100">
                  <BookOpen className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Topic Tests</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTopicTests}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters - Only show on subjects view */}
        {currentView === 'subjects' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search subjects by name or code..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  disabled={loading}
                />
              </div>
              <select
                value={filters.has_hierarchy === undefined ? '' : filters.has_hierarchy.toString()}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  has_hierarchy: e.target.value === '' ? undefined : e.target.value === 'true',
                  page: 1 
                }))}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="">All Types</option>
                <option value="true">Hierarchical</option>
                <option value="false">Non-hierarchical</option>
              </select>
              <select
                value={filters.sortBy || 'created_at'}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any, page: 1 }))}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="created_at">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="code">Sort by Code</option>
              </select>
            </div>
          </div>
        )}

        {/* Content */}
        {currentView === 'subjects' ? (
          <>
            {/* Subjects Grid */}
            {loading ? (
              <PDFListSkeleton count={filters.limit} />
            ) : subjects.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
                  <BookOpen className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No subjects found</h3>
                  <p className="text-gray-600 mb-6">
                    {filters.search
                      ? 'Try adjusting your search criteria.'
                      : 'Create your first subject to get started.'}
                  </p>
                  <button
                    onClick={handleCreateSubject}
                    className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Subject
                  </button>
                </div>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-4'
              }>
                {subjects.map((subject) => (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    onEdit={handleEditSubject}
                    onDelete={handleDeleteSubject}
                    onManageHierarchy={handleManageHierarchy}
                    onViewTestSeries={handleViewTestSeries}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && subjects.length > 0 && (
              <div className="mt-8">
                {renderPagination()}
              </div>
            )}
          </>
        ) : (
          /* Hierarchy View */
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Hierarchy Structure</h3>
              <button
                onClick={() => handleCreateHierarchy(null)}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Root Level
              </button>
            </div>
            
            {hierarchyLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="animate-spin h-8 w-8 text-gray-400" />
              </div>
            ) : (
              <HierarchyTree
                hierarchies={hierarchies}
                onCreateChild={handleCreateHierarchy}
                onEdit={handleEditHierarchy}
                onDelete={handleDeleteHierarchy}
                onViewTestSeries={handleViewHierarchyTestSeries}
              />
            )}
          </div>
        )}

        {/* Modals */}
        <SubjectModal
          isOpen={subjectModal.isOpen}
          onClose={() => setSubjectModal({ isOpen: false, subject: null })}
          subject={subjectModal.subject}
          onUpdate={() => {
            loadSubjects();
            loadStats();
          }}
        />

        {selectedSubject && (
          <HierarchyModal
            isOpen={hierarchyModal.isOpen}
            onClose={() => setHierarchyModal({ isOpen: false, hierarchy: null, parent: null })}
            subject={selectedSubject}
            hierarchy={hierarchyModal.hierarchy}
            parent={hierarchyModal.parent}
            onUpdate={() => {
              if (selectedSubject) {
                loadHierarchyTree(selectedSubject);
              }
            }}
          />
        )}

        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, type: 'subject', item: null, loading: false })}
          onConfirm={handleConfirmDelete}
          title={`Delete ${confirmModal.type === 'subject' ? 'Subject' : 'Hierarchy'}`}
          message={`Are you sure you want to delete "${
            confirmModal.type === 'subject' 
              ? (confirmModal.item as Subject)?.name 
              : (confirmModal.item as SubjectHierarchy)?.level_name
          }"? This will also delete all associated items. This action cannot be undone.`}
          confirmText="Delete"
          type="danger"
          loading={confirmModal.loading}
        />
      </div>
    </div>
  );
};