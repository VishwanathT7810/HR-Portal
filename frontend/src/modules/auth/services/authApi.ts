import { apiPost } from '@/services/api/axios';
import { LoginRequest, LoginResponse } from '../types/auth.types';

export const authApi = {
  login: (credentials: LoginRequest) => {
    return apiPost<LoginResponse>('/auth/login', credentials);
  },

  logout: () => {
    return apiPost<void>('/auth/logout', {});
  },
};

export default authApi;
