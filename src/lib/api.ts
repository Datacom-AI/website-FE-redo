import axios from 'axios';

// Base URLs cho các dịch vụ khác nhau
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3000/api';
const AI_BASE_URL = import.meta.env.VITE_AI_BASE_URL || 'http://localhost:5000/api';

// Tạo instance axios cho backend services
const backendApi = axios.create({
  baseURL: BACKEND_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tạo instance axios cho AI services
const aiApi = axios.create({
  baseURL: AI_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor để xử lý token cho backend API
backendApi.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage nếu có
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Thêm interceptor để xử lý token cho AI API
aiApi.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage nếu có
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Định nghĩa kiểu dữ liệu cho các API
interface CrawlerTaskConfig {
  depth: number;
  maxPages: number;
  selectors?: {
    productContainer?: string;
    name?: string;
    price?: string;
    description?: string;
    image?: string;
    ingredients?: string;
    nutritionFacts?: string;
    brand?: string;
  };
}

interface CrawlerTaskCreateParams {
  url: string;
  config: CrawlerTaskConfig;
  userId: string;
  autoSave?: boolean;
  aiProvider?: 'default' | 'openai' | 'gemini' | 'claude';
}

interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface ProductData {
  name: string;
  description?: string;
  price?: number;
  brand?: string;
  categories?: string[];
  sku?: string;
  barcode?: string;
  images?: string[];
  primaryImage?: string;
  keywords?: string[];
  weight?: number;
  weightUnit?: string;
  ingredients?: string[];
  nutritionFacts?: Record<string, string>;
  // Catalog specific fields
  unitType?: string;
  currentAvailableStock?: number;
  minimumOrderQuantity?: number;
  dailyCapacity?: number;
  productType?: string;
  leadTime?: string;
  leadTimeUnit?: string;
  isSustainableProduct?: boolean;
  pricePerUnit?: number;
  // Additional dynamic fields
  [key: string]: unknown;
}

// Auth API interfaces
interface LoginParams {
  email: string;
  password: string;
}

interface RegisterParams {
  email: string;
  password: string;
  name: string;
  companyName: string;
  role: 'manufacturer' | 'brand' | 'retailer';
}

interface ResetPasswordParams {
  token: string;
  password: string;
  confirmPassword: string;
}

interface ForgotPasswordParams {
  email: string;
}

interface VerifyEmailParams {
  token: string;
  email: string;
}

interface UpdateProfileParams {
  name?: string;
  companyName?: string;
  phone?: string;
  website?: string;
  address?: string;
  description?: string;
  [key: string]: unknown;
}

// API cho Authentication và User management
export const authApi = {
  // Đăng ký tài khoản
  register: (data: RegisterParams) => {
    return backendApi.post('/auth/register', data);
  },

  // Đăng nhập
  login: (data: LoginParams) => {
    return backendApi.post('/auth/login', data);
  },

  // Refresh token
  refreshToken: (refreshToken: string) => {
    return backendApi.post('/auth/refresh-token', { refreshToken });
  },

  // Quên mật khẩu
  forgotPassword: (data: ForgotPasswordParams) => {
    return backendApi.post('/auth/forgot-password', data);
  },

  // Đặt lại mật khẩu
  resetPassword: (data: ResetPasswordParams) => {
    return backendApi.post('/auth/reset-password', data);
  },

  // Xác minh email
  verifyEmail: (data: VerifyEmailParams) => {
    return backendApi.post('/auth/verify-email', data);
  },

  // Gửi lại email xác minh
  resendVerification: (email: string) => {
    return backendApi.post('/auth/resend-verification', { email });
  },

  // Gửi lại email đặt lại mật khẩu
  resendPasswordReset: (email: string) => {
    return backendApi.post('/auth/resend-password-reset', { email });
  },

  // Đăng nhập admin
  adminLogin: (username: string, password: string) => {
    return backendApi.post('/auth/admin/login', { username, password });
  },

  // Lấy thông tin người dùng hiện tại
  getCurrentUser: () => {
    return backendApi.get('/user/profile');
  },

  // Cập nhật thông tin hồ sơ
  updateProfile: (data: UpdateProfileParams) => {
    return backendApi.patch('/user/profile', data);
  },

  // Thay đổi mật khẩu
  changePassword: (currentPassword: string, newPassword: string) => {
    return backendApi.post('/user/change-password', { currentPassword, newPassword });
  },

  // Cập nhật avatar
  updateAvatar: (formData: FormData) => {
    return backendApi.post('/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Cập nhật cài đặt vai trò cụ thể (manufacturer, brand, retailer)
  updateRoleSettings: (role: string, settings: Record<string, unknown>) => {
    return backendApi.post(`/user/settings/${role}`, settings);
  },
};

// API cho tính năng Web Crawler
export const crawlerApi = {
  // Tạo nhiệm vụ crawl mới
  createTask: (data: CrawlerTaskCreateParams) => {
    return aiApi.post('/crawler/tasks', data);
  },

  // Lấy danh sách nhiệm vụ crawl
  getTasks: (page = 1, limit = 10, status?: string) => {
    return aiApi.get('/crawler/tasks', {
      params: { page, limit, status },
    });
  },

  // Lấy chi tiết nhiệm vụ crawl
  getTask: (taskId: string) => {
    return aiApi.get(`/crawler/tasks/${taskId}`);
  },

  // Lấy kết quả crawl
  getResults: (taskId: string) => {
    return aiApi.get(`/crawler/results/${taskId}`);
  },

  // Xử lý kết quả crawl với AI
  processResult: (resultId: string) => {
    return aiApi.post(`/crawler/process/${resultId}`);
  },

  // Thêm sản phẩm từ kết quả crawl vào catalog
  integrateProduct: (resultId: string, userId: string = 'admin', additionalParams = {}) => {
    const params = {
      userId,
      minimumOrderQuantity: 10,
      dailyCapacity: 100,
      unitType: 'units',
      currentAvailableStock: 50,
      leadTime: '3',
      leadTimeUnit: 'days',
      ...additionalParams
    };
    
    // Ensure numeric fields are properly formatted
    if (params.minimumOrderQuantity) {
      params.minimumOrderQuantity = Number(params.minimumOrderQuantity);
    }
    if (params.dailyCapacity) {
      params.dailyCapacity = Number(params.dailyCapacity);
    }
    if (params.currentAvailableStock) {
      params.currentAvailableStock = Number(params.currentAvailableStock);
    }
    
    return aiApi.post(`/crawler/integrate/${resultId}`, params);
  },

  // Xóa nhiệm vụ crawl
  deleteTask: (taskId: string) => {
    return aiApi.delete(`/crawler/tasks/${taskId}`);
  },

  // Get queue status
  getQueueStatus: () => {
    return aiApi.get(`/crawler/queue`);
  },

  // Clear queue
  clearQueue: () => {
    return aiApi.delete(`/crawler/queue`);
  },

  batchDeleteByStatus: (status: string) => {
    return aiApi.delete(`/crawler/tasks/status/${status}`);
  },
};

// API cho quản lý sản phẩm
export const productApi = {
  // Lấy danh sách sản phẩm
  getProducts: (params?: ProductQueryParams) => {
    return backendApi.get('/products', { params });
  },

  // Lấy chi tiết sản phẩm
  getProduct: (productId: string) => {
    return backendApi.get(`/products/${productId}`);
  },

  // Tạo sản phẩm mới
  createProduct: (data: ProductData) => {
    return backendApi.post('/products', data);
  },

  // Cập nhật sản phẩm
  updateProduct: (productId: string, data: ProductData) => {
    return backendApi.put(`/products/${productId}`, data);
  },

  // Xóa sản phẩm
  deleteProduct: (productId: string) => {
    return backendApi.delete(`/products/${productId}`);
  },

  // Lấy dữ liệu bộ lọc (thương hiệu, danh mục, phạm vi giá)
  getFilters: () => {
    return backendApi.get('/products/filters');
  },

  // Methods for catalog products
  getCatalogProducts: (params?: ProductQueryParams) => backendApi.get('/catalog', { params }),
  getCatalogProductById: (id: string) => backendApi.get(`/catalog/${id}`),
  updateCatalogProduct: (id: string, data: ProductData) => {
    // Ensure all numeric fields are properly formatted
    const cleanData = { ...data };
    
    // Numeric fields
    const numericFields = [
      'price', 'pricePerUnit', 'currentAvailableStock', 
      'minimumOrderQuantity', 'dailyCapacity', 'weight'
    ];
    
    // Convert numeric fields to numbers
    numericFields.forEach(field => {
      if (cleanData[field] !== undefined && cleanData[field] !== null) {
        cleanData[field] = Number(cleanData[field]);
      }
    });
    
    // Remove empty values and null values
    Object.keys(cleanData).forEach(key => {
      if (cleanData[key] === '' || cleanData[key] === null) {
        delete cleanData[key];
      }
    });
    
    console.log('Sending update request with data:', cleanData);
    return backendApi.put(`/catalog/${id}`, cleanData);
  },
  deleteCatalogProduct: (id: string) => backendApi.delete(`/catalog/${id}`),
  getCatalogFilters: () => backendApi.get('/catalog/filters'),
};

// For backward compatibility
const api = backendApi;
export default api; 