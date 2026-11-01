import api from './api';

export const createPaymentOrder = async (payload) => {
  const res = await api.post('/payments/create-order', payload);
  return res.data;
};

export const verifyPaymentSignature = async (payload) => {
  const res = await api.post('/payments/verify', payload);
  return res.data;
};
