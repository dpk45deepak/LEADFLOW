import api from './client';

export const leadsApi = {
  list: (params, signal) => api.get('/leads', { params, signal }).then((r) => r.data), // { data, pagination }
  get: (id) => api.get(`/leads/${id}`).then((r) => r.data.data),
  create: (payload) => api.post('/leads', payload).then((r) => r.data.data),
  update: (id, payload) => api.put(`/leads/${id}`, payload).then((r) => r.data.data),
  remove: (id) => api.delete(`/leads/${id}`).then((r) => r.data),
  stats: () => api.get('/leads/stats').then((r) => r.data.data),
};
