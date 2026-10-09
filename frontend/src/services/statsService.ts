import { api } from './api';
import type { ApiResponse, DashboardStats } from '../types';

export const statsService = {
  getOverview: async (): Promise<ApiResponse<DashboardStats>> => {
    const res = await api.get<ApiResponse<DashboardStats>>('/stats/overview');
    return res.data;
  },
};
