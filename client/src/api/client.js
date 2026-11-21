import axios from 'axios';

export const TOKEN_KEY = 'leadflow_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const isAuthForm = /\/auth\/(login|register)$/.test(error.config?.url || '');
    if (error.response?.status === 401 && !isAuthForm) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(error) {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
  if (error.request) return 'Cannot reach the server. Check your connection and try again.';
  return 'Something went wrong. Please try again.';
}

/** Field-level validation errors from the API: [{ field, message }] */
export const getFieldErrors = (error) => error.response?.data?.errors ?? [];

export default api;
