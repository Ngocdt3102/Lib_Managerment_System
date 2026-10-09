import { api } from './api';
import type { ApiResponse, Book, PagedResult } from '../types';

export interface BookQueryParams {
  keyword?: string;
  categoryId?: string;
  availableOnly?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CreateBookParams {
  title: string;
  author: string;
  isbn: string;
  categoryId: string;
  publisher?: string;
  publishYear?: number;
  totalCopies: number;
  location?: string;
  coverImageUrl?: string;
  description?: string;
}

export const bookService = {
  getBooks: async (params?: BookQueryParams): Promise<ApiResponse<PagedResult<Book>>> => {
    const res = await api.get<ApiResponse<PagedResult<Book>>>('/books', { params });
    return res.data;
  },

  getBookById: async (id: string): Promise<ApiResponse<Book>> => {
    const res = await api.get<ApiResponse<Book>>(`/books/${id}`);
    return res.data;
  },

  createBook: async (data: CreateBookParams): Promise<ApiResponse<Book>> => {
    const res = await api.post<ApiResponse<Book>>('/books', data);
    return res.data;
  },

  updateBook: async (id: string, data: Partial<CreateBookParams>): Promise<ApiResponse<Book>> => {
    const res = await api.put<ApiResponse<Book>>(`/books/${id}`, data);
    return res.data;
  },

  deleteBook: async (id: string): Promise<ApiResponse<boolean>> => {
    const res = await api.delete<ApiResponse<boolean>>(`/books/${id}`);
    return res.data;
  },
};
