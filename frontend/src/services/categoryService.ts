import { api } from './api';
import type { ApiResponse, Category } from '../types';

export interface CreateCategoryParams {
  name: string;
  description?: string;
}

export const categoryService = {
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    const res = await api.get<ApiResponse<Category[]>>('/categories');
    return res.data;
  },

  getCategoryById: async (id: string): Promise<ApiResponse<Category>> => {
    const res = await api.get<ApiResponse<Category>>(`/categories/${id}`);
    return res.data;
  },

  createCategory: async (data: CreateCategoryParams): Promise<ApiResponse<Category>> => {
    const res = await api.post<ApiResponse<Category>>('/categories', data);
    return res.data;
  },

  updateCategory: async (id: string, data: CreateCategoryParams): Promise<ApiResponse<Category>> => {
    const res = await api.put<ApiResponse<Category>>(`/categories/${id}`, data);
    return res.data;
  },

  deleteCategory: async (id: string): Promise<ApiResponse<boolean>> => {
    const res = await api.delete<ApiResponse<boolean>>(`/categories/${id}`);
    return res.data;
  },
};
