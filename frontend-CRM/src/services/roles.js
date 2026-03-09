import { api } from './api';

const BASE = 'architect/roles';

/**
 * Listar roles (paginado)
 */
export async function getRolesPaginated(params = {}) {
  const { page = 1, page_size = 10, ...rest } = params;
  const search = new URLSearchParams({ page: String(page), page_size: String(page_size), ...rest });
  const data = await api.get(`${BASE}/?${search.toString()}`);
  if (Array.isArray(data)) return { results: data, count: data.length };
  const results = data.results ?? data.data ?? data.roles ?? [];
  const count = data.count ?? data.total ?? results.length;
  return { results, count };
}

export async function getRoleDetail(roleId) {
  return api.get(`${BASE}/${roleId}/`);
}

export async function createRole(payload) {
  return api.post(`${BASE}/`, payload);
}

export async function updateRole(roleId, payload) {
  return api.put(`${BASE}/${roleId}/`, payload);
}

export async function deleteRole(roleId) {
  return api.delete(`${BASE}/${roleId}/`);
}
