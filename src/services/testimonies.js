import { api } from './api';
import API_CONFIG from './api';

export const createTestimony = async (formData) => {
  const { data } = await api.post(
    API_CONFIG.ENDPOINTS.CREATE_TESTIMONY,
    formData,
    { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data;
};

export const getTestimonies = async () => {
  const { data } = await api.get(API_CONFIG.ENDPOINTS.GET_TESTIMONIES, { withCredentials: true });
  return data;
};

export const getPendingTestimonies = async () => {
  const { data } = await api.get(API_CONFIG.ENDPOINTS.GET_PENDING_TESTIMONIES, { withCredentials: true });
  return data;
};

export const approveTestimony = async (id) => {
  const { data } = await api.patch(API_CONFIG.ENDPOINTS.APPROVE_TESTIMONY(id), {}, { withCredentials: true });
  return data;
};

export const rejectTestimony = async (id) => {
  const { data } = await api.patch(API_CONFIG.ENDPOINTS.REJECT_TESTIMONY(id), {}, { withCredentials: true });
  return data;
};
