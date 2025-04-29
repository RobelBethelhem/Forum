import { api } from './api';

export const getDiscussions = async () => {
  const { data } = await api.get('/api/discussions');
  return data;
};

export const getDiscussion = async (id) => {
  // Always use the full API path
  console.log('[API] GET', `/api/discussions/${id}`); // DEBUG
  const { data } = await api.get(`/api/discussions/${id}`);
  return data;
};

export const createDiscussion = async (formData, token) => {
  const { data } = await api.post('/api/discussions', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};
