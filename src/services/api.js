// API configuration for all endpoints (easy to update for deployment)
const API_CONFIG = {
  Front_End_URL: 'https://movacash.com',
  BASE_URL: 'https://base.movacash.com', 
  ENDPOINTS: {
    // Auth endpoints
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    // Forum endpoints
    CREATE_DISCUSSION: '/api/discussions',
    LIKE_DISCUSSION: (id) => `/api/discussions/${id}/like`,
    CREATE_COMMENT: (discussionId) => `/api/discussions/${discussionId}/comments`,
    LIKE_COMMENT: (commentId) => `/api/discussions/comments/${commentId}/like`,
    // Replies endpoints
    CREATE_REPLY: (commentId) => `/api/discussions/comments/${commentId}/replies`,
    LIKE_REPLY: (commentId, replyId) => `/api/discussions/comments/${commentId}/replies/${replyId}/like`,
    CREATE_REPLY_TO_REPLY: (parentId, replyId) => `/api/discussions/comments/${parentId}/replies/${replyId}/replies`,
    // Testimony endpoints
    CREATE_TESTIMONY: '/api/testimonies',
    GET_TESTIMONIES: '/api/testimonies',
    GET_PENDING_TESTIMONIES: '/api/testimonies/pending',
    APPROVE_TESTIMONY: (id) => `/api/testimonies/${id}/approve`,
    REJECT_TESTIMONY: (id) => `/api/testimonies/${id}/reject`,
  }
};

// Axios instance with base URL and JWT interceptor
import axios from 'axios';
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
});

// Attach JWT token from localStorage to every request
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default API_CONFIG;
export { api };
