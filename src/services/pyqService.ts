import api from './api';

export interface PYQ {
  id: number;
  uuid: string;
  title: string;
  description?: string;
  exam_type_id: number;
  exam_year: number;
  exam_session?: string;
  paper_type: 'prelims' | 'mains' | 'full' | 'sectional';
  paper_number?: number;
  total_questions: number;
  duration_minutes: number;
  total_marks: number;
  negative_marking: boolean;
  negative_marks: number;
  supports_multilanguage: boolean;
  original_exam_date?: string;
  conducting_authority?: string;
  instructions?: string;
  exam_pattern_notes?: string;
  is_active: boolean;
  is_featured: boolean;
  created_by?: number;
  created_at: string;
  updated_at: string;
  examType?: {
    id: number;
    name: string;
    code: string;
  };
  creator?: {
    id: number;
    name: string;
    email: string;
  };
  questionCount?: number;
  attemptCount?: number;
  averageScore?: number;
}

export interface PYQFilters {
  search?: string;
  exam_type_id?: number;
  exam_year?: number;
  exam_session?: string;
  paper_type?: 'prelims' | 'mains' | 'full' | 'sectional' | '';
  conducting_authority?: string;
  is_active?: boolean;
  is_featured?: boolean;
  supports_multilanguage?: boolean;
  created_by?: number;
  year_from?: number;
  year_to?: number;
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'exam_year' | 'created_at' | 'total_questions' | 'duration_minutes';
  sortOrder?: 'ASC' | 'DESC';
}

export interface PYQStats {
  totalPYQs: number;
  activePYQs: number;
  featuredPYQs: number;
  totalQuestions: number;
  totalAttempts: number;
  uniqueExamTypes: number;
  yearRange: {
    earliest: number;
    latest: number;
  };
  examTypeBreakdown: Array<{
    examType: string;
    count: number;
    attempts: number;
  }>;
  yearlyBreakdown: Array<{
    year: number;
    count: number;
    attempts: number;
  }>;
  paperTypeBreakdown: Array<{
    type: string;
    count: number;
    attempts: number;
  }>;
  popularPYQs: Array<{
    id: number;
    title: string;
    attempts: number;
    examType: string;
    year: number;
  }>;
  recentActivity: Array<{
    type: 'pyq_created' | 'pyq_attempted' | 'pyq_updated';
    title: string;
    date: string;
    user?: string;
  }>;
}

export interface ExamYear {
  year: number;
  count: number;
}

export interface ExamSession {
  session: string;
  count: number;
}

class PYQService {
  // Get all PYQs with filters
  async getPYQs(filters: PYQFilters = {}): Promise<{
    success: boolean;
    data: PYQ[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/admin/pyqs?${params.toString()}`);
    return response.data;
  }

  // Get single PYQ by ID
  async getPYQById(id: number): Promise<{ success: boolean; data: PYQ }> {
    const response = await api.get(`/admin/pyqs/${id}`);
    return response.data;
  }

  // Create PYQ
  async createPYQ(data: {
    title: string;
    description?: string;
    exam_type_id: number;
    exam_year: number;
    exam_session?: string;
    paper_type: 'prelims' | 'mains' | 'full' | 'sectional';
    paper_number?: number;
    total_questions: number;
    duration_minutes: number;
    total_marks: number;
    negative_marking?: boolean;
    negative_marks?: number;
    supports_multilanguage?: boolean;
    original_exam_date?: string;
    conducting_authority?: string;
    instructions?: string;
    exam_pattern_notes?: string;
    is_active?: boolean;
    is_featured?: boolean;
  }): Promise<{ success: boolean; data: PYQ; message: string }> {
    const response = await api.post('/admin/pyqs', data);
    return response.data;
  }

  // Update PYQ
  async updatePYQ(id: number, data: Partial<PYQ>): Promise<{ success: boolean; data: PYQ; message: string }> {
    const response = await api.put(`/admin/pyqs/${id}`, data);
    return response.data;
  }

  // Delete PYQ
  async deletePYQ(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/admin/pyqs/${id}`);
    return response.data;
  }

  // Toggle PYQ status (active/inactive)
  async togglePYQStatus(id: number): Promise<{ success: boolean; message: string; data: PYQ }> {
    const response = await api.patch(`/admin/pyqs/${id}/toggle-status`);
    return response.data;
  }

  // Toggle featured status
  async toggleFeaturedStatus(id: number): Promise<{ success: boolean; message: string; data: PYQ }> {
    const response = await api.patch(`/admin/pyqs/${id}/toggle-featured`);
    return response.data;
  }

  // Duplicate PYQ
  async duplicatePYQ(id: number, title: string, year?: number): Promise<{ success: boolean; data: PYQ; message: string }> {
    const response = await api.post(`/admin/pyqs/${id}/duplicate`, { title, year });
    return response.data;
  }

  // Get PYQ statistics
  async getPYQStats(): Promise<{ success: boolean; data: PYQStats }> {
    const response = await api.get('/admin/pyqs/stats');
    return response.data;
  }

  // Get available exam years
  async getExamYears(examTypeId?: number): Promise<{ success: boolean; data: ExamYear[] }> {
    const params = examTypeId ? `?exam_type_id=${examTypeId}` : '';
    const response = await api.get(`/admin/pyqs/years${params}`);
    return response.data;
  }

  // Get available exam sessions
  async getExamSessions(examTypeId?: number, year?: number): Promise<{ success: boolean; data: ExamSession[] }> {
    const params = new URLSearchParams();
    if (examTypeId) params.append('exam_type_id', examTypeId.toString());
    if (year) params.append('year', year.toString());
    
    const response = await api.get(`/admin/pyqs/sessions?${params.toString()}`);
    return response.data;
  }

  // Get conducting authorities
  async getConductingAuthorities(): Promise<{ success: boolean; data: string[] }> {
    const response = await api.get('/admin/pyqs/authorities');
    return response.data;
  }

  // Get paper types info
  getPaperTypes(): Array<{ value: string; label: string; description: string }> {
    return [
      { value: 'prelims', label: 'Prelims', description: 'Preliminary examination paper' },
      { value: 'mains', label: 'Mains', description: 'Main examination paper' },
      { value: 'full', label: 'Full Paper', description: 'Complete examination paper' },
      { value: 'sectional', label: 'Sectional', description: 'Section-wise paper' }
    ];
  }

  // Bulk operations
  async bulkUpdateStatus(ids: number[], status: boolean): Promise<{ success: boolean; message: string }> {
    const response = await api.patch('/admin/pyqs/bulk-status', { ids, status });
    return response.data;
  }

  async bulkDelete(ids: number[]): Promise<{ success: boolean; message: string }> {
    const response = await api.delete('/admin/pyqs/bulk-delete', { data: { ids } });
    return response.data;
  }

  async bulkUpdateExamType(ids: number[], examTypeId: number): Promise<{ success: boolean; message: string }> {
    const response = await api.patch('/admin/pyqs/bulk-exam-type', { ids, examTypeId });
    return response.data;
  }

  // PYQ questions management
  async getPYQQuestions(pyqId: number): Promise<{
    success: boolean;
    data: Array<{
      id: number;
      question_text: string;
      question_type: string;
      difficulty_level: string;
      subject?: string;
      topic?: string;
      language: string;
    }>;
  }> {
    const response = await api.get(`/admin/pyqs/${pyqId}/questions`);
    return response.data;
  }

  async addQuestionsToPYQ(pyqId: number, questionIds: number[]): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/admin/pyqs/${pyqId}/questions`, { questionIds });
    return response.data;
  }

  async removeQuestionsFromPYQ(pyqId: number, questionIds: number[]): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/admin/pyqs/${pyqId}/questions`, { data: { questionIds } });
    return response.data;
  }

  // PYQ attempts and analytics
  async getPYQAttempts(pyqId: number, page = 1, limit = 10): Promise<{
    success: boolean;
    data: Array<{
      id: number;
      user_name: string;
      score: number;
      total_questions: number;
      time_taken: number;
      completion_status: string;
      attempted_at: string;
    }>;
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const response = await api.get(`/admin/pyqs/${pyqId}/attempts?page=${page}&limit=${limit}`);
    return response.data;
  }

  async getPYQAnalytics(pyqId: number): Promise<{
    success: boolean;
    data: {
      totalAttempts: number;
      averageScore: number;
      averageTimeSpent: number;
      completionRate: number;
      difficultyAnalysis: Array<{
        difficulty: string;
        avgScore: number;
        attempts: number;
      }>;
      subjectAnalysis: Array<{
        subject: string;
        avgScore: number;
        attempts: number;
      }>;
      questionAnalysis: Array<{
        questionId: number;
        correctAnswers: number;
        incorrectAnswers: number;
        accuracyRate: number;
      }>;
      performanceTrend: Array<{
        date: string;
        attempts: number;
        avgScore: number;
      }>;
    };
  }> {
    const response = await api.get(`/admin/pyqs/${pyqId}/analytics`);
    return response.data;
  }

  // Import/Export functionality
  async exportPYQ(id: number, format: 'pdf' | 'excel' | 'json'): Promise<Blob> {
    const response = await api.get(`/admin/pyqs/${id}/export?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async importPYQQuestions(pyqId: number, file: File): Promise<{ success: boolean; message: string; imported: number }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/admin/pyqs/${pyqId}/import-questions`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export const pyqService = new PYQService();
export default pyqService;