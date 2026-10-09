import { api } from './api';
import type { ApiResponse, User } from '../types';

export interface LoginParams {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterParams {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  login: async (params: LoginParams): Promise<ApiResponse<AuthResponse>> => {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', params);
    return res.data;
  },

  register: async (params: RegisterParams): Promise<ApiResponse<AuthResponse>> => {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', params);
    return res.data;
  },

  getMe: async (): Promise<ApiResponse<User>> => {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data;
  },

  getAllUsers: async (): Promise<ApiResponse<User[]>> => {
    const res = await api.get<ApiResponse<User[]>>('/users');
    return res.data;
  },

  updateUser: async (id: string, data: Partial<User>): Promise<ApiResponse<User>> => {
    const res = await api.put<ApiResponse<User>>(`/users/${id}`, data);
    return res.data;
  },

  deleteUser: async (id: string): Promise<ApiResponse<boolean>> => {
    const res = await api.delete<ApiResponse<boolean>>(`/users/${id}`);
    return res.data;
  },
};
