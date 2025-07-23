import api from './api';

export interface FreeTest {
  id: number;
  uuid: string;
  title: string;
  description?: string;
  test_type: 'practice' | 'mock' | 'sample' | 'general';
  subject_id?: number;
  subject_hierarchy_id?: number;
  total_questions: number;
  duration_minutes: number;
  allows_pause_resume: boolean;
  negative_marking: boolean;
  negative_marks: number;
  supports_multilanguage: boolean;
  instructions?: string;
  is_active: boolean;
  is_featured: boolean;
  created_by?: number;
  created_at: string;
  updated_at: string;
  subject?: {
    id: number;
    name: string;
    code: string;
  };
  subjectHierarchy?: {
    id: number;
    level_name: string;
    level_type: string;
  };
  creator?: {
    id: number;
    name: string;
    email: string;
  };
  questionCount?: number;
  attemptCount?: number;
}

export interface FreeTestFilters {
  search?: string;
  test_type?: 'practice' | 'mock' | 'sample' | 'general' | '';
  subject_id?: number;
  subject_hierarchy_id?: number;
  is_active?: boolean;
  is_featured?: boolean;
  supports_multilanguage?: boolean;
  created_by?: number;
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'created_at' | 'total_questions' | 'duration_minutes';
  sortOrder?: 'ASC' | 'DESC';
}

export interface FreeTestStats {
  totalTests: number;
  activeTests: number;
  featuredTests: number;
  practiceTests: number;
  mockTests: number;
  sampleTests: number;
  generalTests: number;
  totalQuestions: number;
  totalAttempts: number;
  averageDuration: number;
  testsBySubject: Array<{
    subject: string;
    count: number;
    attempts: number;
  }>;
  popularTests: Array<{
    id: number;
    title: string;
    attempts: number;
    test_type: string;
  }>;
  recentActivity: Array<{
    type: 'test_created' | 'test_attempted' | 'test_updated';
    title: string;
    date: string;
    user?: string;
  }>;
}

class FreeTestService {
  // Get all free tests with filters
  async getFreeTests(filters: FreeTestFilters = {}): Promise<{
    success: boolean;
    data: FreeTest[];
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

    const response = await api.get(`/admin/free-tests?${params.toString()}`);
    return response.data;
  }

  // Get single free test by ID
  async getFreeTestById(id: number): Promise<{ success: boolean; data: FreeTest }> {
    const response = await api.get(`/admin/free-tests/${id}`);
    return response.data;
  }

  // Create free test
  async createFreeTest(data: {
    title: string;
    description?: string;
    test_type: 'practice' | 'mock' | 'sample' | 'general';
    subject_id?: number;
    subject_hierarchy_id?: number;
    total_questions: number;
    duration_minutes: number;
    allows_pause_resume?: boolean;
    negative_marking?: boolean;
    negative_marks?: number;
    supports_multilanguage?: boolean;
    instructions?: string;
    is_active?: boolean;
    is_featured?: boolean;
  }): Promise<{ success: boolean; data: FreeTest; message: string }> {
    const response = await api.post('/admin/free-tests', data);
    return response.data;
  }

  // Update free test
  async updateFreeTest(id: number, data: Partial<FreeTest>): Promise<{ success: boolean; data: FreeTest; message: string }> {
    const response = await api.put(`/admin/free-tests/${id}`, data);
    return response.data;
  }

  // Delete free test
  async deleteFreeTest(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/admin/free-tests/${id}`);
    return response.data;
  }

  // Toggle test status (active/inactive)
  async toggleTestStatus(id: number): Promise<{ success: boolean; message: string; data: FreeTest }> {
    const response = await api.patch(`/admin/free-tests/${id}/toggle-status`);
    return response.data;
  }

  // Toggle featured status
  async toggleFeaturedStatus(id: number): Promise<{ success: boolean; message: string; data: FreeTest }> {
    const response = await api.patch(`/admin/free-tests/${id}/toggle-featured`);
    return response.data;
  }

  // Duplicate test
  async duplicateTest(id: number, title: string): Promise<{ success: boolean; data: FreeTest; message: string }> {
    const response = await api.post(`/admin/free-tests/${id}/duplicate`, { title });
    return response.data;
  }

  // Get test statistics
  async getFreeTestStats(): Promise<{ success: boolean; data: FreeTestStats }> {
    const response = await api.get('/admin/free-tests/stats');
    return response.data;
  }

  // Get test types for dropdown
  async getTestTypes(): Promise<{ success: boolean; data: Array<{ value: string; label: string; description: string }> }> {
    return {
      success: true,
      data: [
        { value: 'practice', label: 'Practice Test', description: 'For skill building and practice' },
        { value: 'mock', label: 'Mock Test', description: 'Simulates real exam conditions' },
        { value: 'sample', label: 'Sample Test', description: 'Sample questions for familiarization' },
        { value: 'general', label: 'General Test', description: 'General knowledge or mixed topics' }
      ]
    };
  }

  // Bulk operations
  async bulkUpdateStatus(ids: number[], status: boolean): Promise<{ success: boolean; message: string }> {
    const response = await api.patch('/admin/free-tests/bulk-status', { ids, status });
    return response.data;
  }

  async bulkDelete(ids: number[]): Promise<{ success: boolean; message: string }> {
    const response = await api.delete('/admin/free-tests/bulk-delete', { data: { ids } });
    return response.data;
  }

  // Test questions management
  async getTestQuestions(testId: number): Promise<{
    success: boolean;
    data: Array<{
      id: number;
      question_text: string;
      question_type: string;
      difficulty_level: string;
      language: string;
    }>;
  }> {
    const response = await api.get(`/admin/free-tests/${testId}/questions`);
    return response.data;
  }

  async addQuestionsToTest(testId: number, questionIds: number[]): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/admin/free-tests/${testId}/questions`, { questionIds });
    return response.data;
  }

  async removeQuestionsFromTest(testId: number, questionIds: number[]): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/admin/free-tests/${testId}/questions`, { data: { questionIds } });
    return response.data;
  }

  // Test attempts and analytics
  async getTestAttempts(testId: number, page = 1, limit = 10): Promise<{
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
    const response = await api.get(`/admin/free-tests/${testId}/attempts?page=${page}&limit=${limit}`);
    return response.data;
  }

  async getTestAnalytics(testId: number): Promise<{
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
      questionAnalysis: Array<{
        questionId: number;
        correctAnswers: number;
        incorrectAnswers: number;
        accuracyRate: number;
      }>;
    };
  }> {
    const response = await api.get(`/admin/free-tests/${testId}/analytics`);
    return response.data;
  }
}

export const freeTestService = new FreeTestService();
export default freeTestService;