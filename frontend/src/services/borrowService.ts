import { api } from './api';
import type { ApiResponse, BorrowRecord } from '../types';

export interface CreateBorrowParams {
  bookId: string;
  userId?: string;
  borrowDays?: number;
  notes?: string;
}

export interface ReturnBookParams {
  notes?: string;
  isDamagedOrLost?: boolean;
  penaltyAmount?: number;
  penaltyReason?: string;
}

export const borrowService = {
  createBorrow: async (data: CreateBorrowParams): Promise<ApiResponse<BorrowRecord>> => {
    const res = await api.post<ApiResponse<BorrowRecord>>('/borrows', data);
    return res.data;
  },

  returnBook: async (id: string, data: ReturnBookParams): Promise<ApiResponse<BorrowRecord>> => {
    const res = await api.put<ApiResponse<BorrowRecord>>(`/borrows/${id}/return`, data);
    return res.data;
  },

  getMyLoans: async (): Promise<ApiResponse<BorrowRecord[]>> => {
    const res = await api.get<ApiResponse<BorrowRecord[]>>('/borrows/my-loans');
    return res.data;
  },

  getAllLoans: async (status?: string): Promise<ApiResponse<BorrowRecord[]>> => {
    const res = await api.get<ApiResponse<BorrowRecord[]>>('/borrows', { params: { status } });
    return res.data;
  },

  extendLoan: async (id: string, days: number = 7): Promise<ApiResponse<BorrowRecord>> => {
    const res = await api.put<ApiResponse<BorrowRecord>>(`/borrows/${id}/extend`, null, { params: { days } });
    return res.data;
  },
};
