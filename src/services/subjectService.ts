import api from './api';

export interface Subject {
  id: number;
  name: string;
  code: string;
  has_hierarchy: boolean;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  hierarchies?: SubjectHierarchy[];
  testSeriesCount?: number;
  freeTestsCount?: number;
}

export interface SubjectHierarchy {
  id: number;
  subject_id: number;
  level_name: string;
  level_type: 'standard' | 'class' | 'chapter' | 'topic';
  parent_id?: number;
  order_index: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  parent?: SubjectHierarchy;
  children?: SubjectHierarchy[];
  subject?: Subject;
  testSeriesCount?: number;
  freeTestsCount?: number;
}

export interface TopicTestSeries {
  id: string;
  title: string;
  description?: string;
  subject_id: number;
  subject_hierarchy_id?: number;
  total_questions: number;
  duration_minutes: number;
  max_attempts: number;
  pass_percentage: number;
  is_active: boolean;
  is_premium: boolean;
  difficulty_level: 'easy' | 'medium' | 'hard';
  created_at: string;
  subject?: Subject;
  hierarchy?: SubjectHierarchy;
}

export interface SubjectFilters {
  search?: string;
  has_hierarchy?: boolean;
  is_active?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'code' | 'created_at';
  sortOrder?: 'ASC' | 'DESC';
}

export interface HierarchyFilters {
  subject_id?: number;
  level_type?: 'standard' | 'class' | 'chapter' | 'topic';
  parent_id?: number | null;
  search?: string;
  page?: number;
  limit?: number;
}

class SubjectService {
  // Subject Management
  async getSubjects(filters: SubjectFilters = {}): Promise<{
    success: boolean;
    data: Subject[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.has_hierarchy !== undefined) params.append('has_hierarchy', filters.has_hierarchy.toString());
    if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await api.get(`/admin/subjects?${params.toString()}`);
    return response.data;
  }

  async getSubjectById(id: number): Promise<{ success: boolean; data: Subject }> {
    const response = await api.get(`/admin/subjects/${id}`);
    return response.data;
  }

  async createSubject(data: {
    name: string;
    code: string;
    has_hierarchy?: boolean;
    description?: string;
    is_active?: boolean;
  }): Promise<{ success: boolean; data: Subject; message: string }> {
    const response = await api.post('/admin/subjects', data);
    return response.data;
  }

  async updateSubject(id: number, data: Partial<Subject>): Promise<{ success: boolean; data: Subject; message: string }> {
    const response = await api.put(`/admin/subjects/${id}`, data);
    return response.data;
  }

  async deleteSubject(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/admin/subjects/${id}`);
    return response.data;
  }

  // Subject Hierarchy Management
  async getSubjectHierarchies(filters: HierarchyFilters = {}): Promise<{
    success: boolean;
    data: SubjectHierarchy[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const params = new URLSearchParams();
    
    if (filters.subject_id) params.append('subject_id', filters.subject_id.toString());
    if (filters.level_type) params.append('level_type', filters.level_type);
    if (filters.parent_id !== undefined) {
      params.append('parent_id', filters.parent_id?.toString() || 'null');
    }
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/admin/subject-hierarchies?${params.toString()}`);
    return response.data;
  }

  async getHierarchyTree(subjectId: number): Promise<{ success: boolean; data: SubjectHierarchy[] }> {
    const response = await api.get(`/admin/subjects/${subjectId}/hierarchy-tree`);
    return response.data;
  }

  async createHierarchy(data: {
    subject_id: number;
    level_name: string;
    level_type: 'standard' | 'class' | 'chapter' | 'topic';
    parent_id?: number;
    order_index?: number;
    description?: string;
    is_active?: boolean;
  }): Promise<{ success: boolean; data: SubjectHierarchy; message: string }> {
    const response = await api.post('/admin/subject-hierarchies', data);
    return response.data;
  }

  async updateHierarchy(id: number, data: Partial<SubjectHierarchy>): Promise<{ success: boolean; data: SubjectHierarchy; message: string }> {
    const response = await api.put(`/admin/subject-hierarchies/${id}`, data);
    return response.data;
  }

  async deleteHierarchy(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/admin/subject-hierarchies/${id}`);
    return response.data;
  }

  async reorderHierarchies(hierarchyIds: number[]): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/admin/subject-hierarchies/reorder', { hierarchyIds });
    return response.data;
  }

  // Topic-wise Test Series Management
  async getTopicTestSeries(filters: {
    subject_id?: number;
    subject_hierarchy_id?: number;
    difficulty_level?: string;
    is_premium?: boolean;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    success: boolean;
    data: TopicTestSeries[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/admin/topic-test-series?${params.toString()}`);
    return response.data;
  }

  async createTopicTestSeries(data: {
    title: string;
    description?: string;
    subject_id: number;
    subject_hierarchy_id?: number;
    total_questions: number;
    duration_minutes: number;
    max_attempts: number;
    pass_percentage: number;
    is_premium?: boolean;
    difficulty_level: 'easy' | 'medium' | 'hard';
  }): Promise<{ success: boolean; data: TopicTestSeries; message: string }> {
    const response = await api.post('/admin/topic-test-series', data);
    return response.data;
  }

  async updateTopicTestSeries(id: string, data: Partial<TopicTestSeries>): Promise<{ success: boolean; data: TopicTestSeries; message: string }> {
    const response = await api.put(`/admin/topic-test-series/${id}`, data);
    return response.data;
  }

  async deleteTopicTestSeries(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/admin/topic-test-series/${id}`);
    return response.data;
  }

  // Statistics
  async getSubjectStats(): Promise<{
    success: boolean;
    data: {
      totalSubjects: number;
      hierarchicalSubjects: number;
      totalHierarchies: number;
      totalTopicTests: number;
      subjectBreakdown: Array<{
        subject: string;
        hierarchies: number;
        testSeries: number;
      }>;
    };
  }> {
    const response = await api.get('/admin/subjects/stats');
    return response.data;
  }
}

export const subjectService = new SubjectService();
export default subjectService;