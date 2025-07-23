import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, Upload, Filter } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { CardSkeleton } from '../../components/common/LoadingSpinner';
import { ApiError, ErrorBoundary } from '../../components/common/ErrorBoundary';
import { QuestionModal } from '../../components/modals/QuestionModal';
import { ConfirmModal } from '../../components/modals/ConfirmModal';
import api from '../../services/api';
import toast from 'react-hot-toast';

const questionsService = {
  getQuestions: async (params: any) => {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/admin/questions?${queryParams}`);
    return { data: response.data };
  },

  getQuestionsStats: async () => {
    const response = await api.get('/admin/questions/stats');
    return { data: response.data };
  }
};

export const QuestionsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [difficulty, setDifficulty] = useState('');
  const [subject, setSubject] = useState('');
  
  // Modal states
  const [questionModal, setQuestionModal] = useState({ isOpen: false, mode: 'create' as 'create' | 'edit', question: null as any });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, question: null as any, loading: false });

  const { 
    data: questionsResponse, 
    loading, 
    error, 
    refresh 
  } = useApi(() => questionsService.getQuestions({
    page: currentPage,
    limit: pageSize,
    search: searchTerm,
    difficulty,
    subject
  }));

  const { data: stats } = useApi(questionsService.getQuestionsStats);

  const questions = questionsResponse?.data?.data || [];
  const pagination = questionsResponse?.data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 };

  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800'
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // CRUD handlers
  const handleAddQuestion = () => {
    setQuestionModal({ isOpen: true, mode: 'create', question: null });
  };

  const handleEditQuestion = (question: any) => {
    setQuestionModal({ isOpen: true, mode: 'edit', question });
  };

  const handleDeleteQuestion = (question: any) => {
    setConfirmModal({ isOpen: true, question, loading: false });
  };

  const handleConfirmDelete = async () => {
    try {
      setConfirmModal(prev => ({ ...prev, loading: true }));
      await api.delete(`/admin/questions/${confirmModal.question.id}`);
      toast.success('Question deleted successfully');
      refresh();
      setConfirmModal({ isOpen: false, question: null, loading: false });
    } catch (error: any) {
      console.error('Delete question error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete question');
      setConfirmModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleModalSuccess = () => {
    refresh();
  };

  if (error) {
    return <ApiError error={error} onRetry={refresh} />;
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Question Bank</h1>
            <p className="text-gray-600">Manage quiz questions and organize by subjects</p>
          </div>
          <div className="flex space-x-3">
            <button className="btn-secondary inline-flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Bulk Import
            </button>
            <button 
              onClick={handleAddQuestion}
              className="btn-primary inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Edit className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Questions</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.data?.total_questions || 0}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Plus className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Easy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.data?.difficulty_stats?.find((d: any) => d.difficulty === 'easy')?.count || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <Edit className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Medium</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.data?.difficulty_stats?.find((d: any) => d.difficulty === 'medium')?.count || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hard</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.data?.difficulty_stats?.find((d: any) => d.difficulty === 'hard')?.count || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Questions
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search questions..."
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="input-field"
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="input-field"
              >
                <option value="">All Subjects</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="English">English</option>
                <option value="History">History</option>
              </select>
            </div>

            <button 
              onClick={refresh}
              className="btn-primary inline-flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Questions</h3>
          </div>

          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: pageSize }).map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </div>
          ) : questions.length === 0 ? (
            <div className="p-12 text-center">
              <Edit className="mx-auto h-24 w-24 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
              <p className="text-gray-600 mb-6">Create your first question to get started.</p>
              <button onClick={handleAddQuestion} className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {questions.map((question: any, index: number) => (
                <div key={question.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-sm font-medium text-gray-500">
                          Q{((currentPage - 1) * pageSize) + index + 1}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyBadge(question.difficulty)}`}>
                          {question.difficulty}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {question.subject}
                        </span>
                      </div>
                      
                      <h4 className="text-lg font-medium text-gray-900 mb-3">
                        {question.question_text}
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center">
                          <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium mr-2">A</span>
                          <span className="text-gray-700">{question.option_a}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium mr-2">B</span>
                          <span className="text-gray-700">{question.option_b}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium mr-2">C</span>
                          <span className="text-gray-700">{question.option_c}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium mr-2">D</span>
                          <span className="text-gray-700">{question.option_d}</span>
                        </div>
                      </div>

                      {question.topic && (
                        <p className="text-sm text-gray-500 mt-2">Topic: {question.topic}</p>
                      )}
                    </div>

                    <div className="ml-6 flex space-x-2">
                      <button 
                        onClick={() => handleEditQuestion(question)}
                        className="text-green-600 hover:text-green-900"
                        title="Edit Question"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteQuestion(question)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Question"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination.total)} of {pagination.total} results
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                    disabled={currentPage === pagination.totalPages}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        <QuestionModal
          isOpen={questionModal.isOpen}
          onClose={() => setQuestionModal({ isOpen: false, mode: 'create', question: null })}
          onSuccess={handleModalSuccess}
          question={questionModal.question}
          mode={questionModal.mode}
        />

        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, question: null, loading: false })}
          onConfirm={handleConfirmDelete}
          title="Delete Question"
          message={`Are you sure you want to delete this question? This action cannot be undone.`}
          confirmText="Delete"
          type="danger"
          loading={confirmModal.loading}
        />
      </div>
    </ErrorBoundary>
  );
};