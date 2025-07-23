import api from './api';
import { ApiResponse, Student, PaginationParams } from '../types';

export const studentsService = {
  // Get all students with pagination and filters
  getStudents: async (params: PaginationParams) => {
    const queryParams = new URLSearchParams({
      page: params.page.toString(),
      limit: params.limit.toString(),
      ...(params.search && { search: params.search }),
      ...(params.sortBy && { sortBy: params.sortBy }),
      ...(params.sortOrder && { sortOrder: params.sortOrder })
    });
    
    const response = await api.get(`/admin/students?${queryParams}`);
    
    return {
      data: response.data // This contains the backend response: { success, data, pagination }
    };
  },

  // Get single student by ID
  getStudentById: async (id: string) => {
    const response = await api.get(`/admin/students/${id}`);
    return { data: response.data };
  },

  // Create new student
  createStudent: async (data: { username: string; email: string; password: string; phone?: string }) => {
    const response = await api.post('/admin/students', data);
    return { data: response.data };
  },

  // Update student
  updateStudent: async (id: string, data: { username?: string; email?: string; phone?: string; isEmailVerified?: boolean }) => {
    const response = await api.put(`/admin/students/${id}`, data);
    return { data: response.data };
  },

  // Delete student
  deleteStudent: async (id: string) => {
    const response = await api.delete(`/admin/students/${id}`);
    return { data: response.data };
  },

  // Get student statistics
  getStudentStats: async (): Promise<ApiResponse<{
    total_students: number;
    active_students: number;
    new_students_this_week: number;
    unverified_students: number;
  }>> => {
    const response = await api.get('/admin/students/stats');
    return response.data;
  }
};