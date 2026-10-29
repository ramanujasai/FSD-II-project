import { request } from './client';

export const schemeApi = {
  getSchemes: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category) query.append('category', params.category);
    if (params.status) query.append('status', params.status);

    const queryString = query.toString();
    return request(`/schemes${queryString ? `?${queryString}` : ''}`);
  },

  getSchemeById: (id) => request(`/schemes/${id}`),

  createScheme: (data) => request('/schemes', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  updateScheme: (id, data) => request(`/schemes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  toggleSchemeStatus: (id) => request(`/schemes/${id}/toggle-status`, {
    method: 'PATCH'
  }),

  deleteScheme: (id) => request(`/schemes/${id}`, {
    method: 'DELETE'
  })
};
