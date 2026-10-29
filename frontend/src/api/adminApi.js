import { request } from './client';

export const adminApi = {
  getStats: () => request('/admin/stats'),

  getBeneficiaries: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.schemeId) query.append('schemeId', params.schemeId);
    if (params.status) query.append('status', params.status);

    const queryString = query.toString();
    return request(`/admin/beneficiaries${queryString ? `?${queryString}` : ''}`);
  }
};
