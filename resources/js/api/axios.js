import axios from 'axios';

// Karena frontend & backend sekarang satu domain (disajikan oleh Laravel/Herd
// yang sama), cukup pakai path relatif "/api" — tidak perlu VITE_API_URL lagi.
const BASE_URL = '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: 'application/json',
  },
});

// Sisipkan token Bearer dari localStorage ke setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Jika token expired / unauthorized, redirect ke login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const reqUrl = error.config?.url || '';
    // Don't auto-redirect for auth-related endpoints (login, send-otp, register)
    const skipRedirect = ['/login', '/send-otp', '/register'].some((p) => reqUrl.includes(p));
    if (status === 401 && !skipRedirect) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
