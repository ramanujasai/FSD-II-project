import { request } from './client';

export const applicationApi = {
  submitApplication: (data) => request('/applications', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  getApplications: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.schemeId) query.append('schemeId', params.schemeId);
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);

    const queryString = query.toString();
    return request(`/applications${queryString ? `?${queryString}` : ''}`);
  },

  getApplicationById: (id) => request(`/applications/${id}`),

  updateStatus: (id, statusData) => request(`/applications/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(statusData)
  })
};
