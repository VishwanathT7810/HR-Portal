import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { config } from '@/config';
import { addToast } from '@/hooks/useToast';

export interface ApiErrorData {
  message?: string;
  errors?: Record<string, string[]>;
  [key: string]: unknown;
}

export class ApiError extends Error {
  status: number;
  data: ApiErrorData;
  errors: Record<string, string[]>;

  constructor(message: string, status: number, data: ApiErrorData = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.errors = data.errors || {};
  }
}

const axiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 30000,
  headers: {
    Accept: 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (reqConfig: InternalAxiosRequestConfig) => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const username = user?.username || user?.email;
        if (username) {
          reqConfig.headers['X-Admin-Username'] = username;
          reqConfig.headers.Authorization = `Admin ${username}`;
        }
      } else {
        const token = localStorage.getItem('access_token');
        if (token) {
          reqConfig.headers['X-Admin-Username'] = token;
          reqConfig.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch {
      // ignore parsing errors
    }
    return reqConfig;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (!error.response) {
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        addToast('Unable to connect to the server. Please try again.', 'error');
        return Promise.reject(
          new ApiError('Unable to connect to the server. Please try again.', 0, {})
        );
      }
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    const errorData = (data || {}) as ApiErrorData;

    let message = errorData.message;
    if (!message && (data as any)?.detail) {
      const detail = (data as any).detail;
      if (typeof detail === 'string') {
        message = detail;
      } else if (Array.isArray(detail) && detail.length > 0) {
        message = detail[0]?.msg || 'Validation failed. Please check your input.';
      }
    }

    if (!message) {
      if (status === 401) {
        message = 'Invalid username or password. Please check your credentials and try again.';
      } else if (status === 403) {
        message = 'Access denied. You do not have permission to perform this action.';
      } else if (status === 404) {
        message = 'The requested resource was not found.';
      } else if (status === 409) {
        message = 'A record with these details already exists.';
      } else if (status === 422) {
        message = 'Please check the required fields and try again.';
      } else if (status >= 500) {
        message = 'Server encountered an issue. Please try again later.';
      } else {
        message = 'An unexpected error occurred. Please try again.';
      }
    }

    if (status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }

    if (status === 422) {
      return Promise.reject(new ApiError(message, status, errorData));
    }

    return Promise.reject(new ApiError(message, status, errorData));
  }
);

export const apiGet = <T = unknown>(url: string, reqConfig?: InternalAxiosRequestConfig) =>
  axiosInstance.get<T>(url, reqConfig).then((res) => res.data);

export const apiPost = <T = unknown>(url: string, data?: unknown, reqConfig?: InternalAxiosRequestConfig) =>
  axiosInstance.post<T>(url, data, reqConfig).then((res) => res.data);

export const apiPut = <T = unknown>(url: string, data?: unknown, reqConfig?: InternalAxiosRequestConfig) =>
  axiosInstance.put<T>(url, data, reqConfig).then((res) => res.data);

export const apiDelete = <T = unknown>(url: string, reqConfig?: InternalAxiosRequestConfig) =>
  axiosInstance.delete<T>(url, reqConfig).then((res) => res.data);

export default axiosInstance;
