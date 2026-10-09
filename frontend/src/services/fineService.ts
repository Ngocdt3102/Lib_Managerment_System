import { api } from './api';
import type { ApiResponse, Fine } from '../types';

export const fineService = {
  getAllFines: async (status?: string): Promise<ApiResponse<Fine[]>> => {
    const res = await api.get<ApiResponse<Fine[]>>('/fines', { params: { status } });
    return res.data;
  },

  getMyFines: async (): Promise<ApiResponse<Fine[]>> => {
    const res = await api.get<ApiResponse<Fine[]>>('/fines/my-fines');
    return res.data;
  },

  payFine: async (id: string): Promise<ApiResponse<Fine>> => {
    const res = await api.put<ApiResponse<Fine>>(`/fines/${id}/pay`);
    return res.data;
  },
};
