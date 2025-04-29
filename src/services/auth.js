import api from './api';

export const login = async (credentials) => {
  const { data } = await api.post('/auth/login', credentials);
  return data;
};

export const register = async (userInfo) => {
  const { data } = await api.post('/auth/register', userInfo);
  return data;
};
