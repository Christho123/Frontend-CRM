import { api } from './api';

/**
 * Resumen de analytics
 */
export async function getAnalyticsSummary() {
  return api.get('analytics/summary/');
}

/**
 * Sesiones de auditoría (paginado)
 * Params: page, page_size, opcionales: user_id, active
 * Ej: audits/sessions/?page=1&page_size=20
 */
export async function getAuditSessions(params = {}) {
  const { page = 1, page_size = 20, ...rest } = params;
  const search = new URLSearchParams({ page: String(page), page_size: String(page_size), ...rest });
  return api.get(`audits/sessions/?${search.toString()}`);
}

/**
 * Perfil del usuario actual (foto, nombre completo, etc.)
 * Endpoint: architect/users/{id}/
 */
export async function getUserProfile(userId) {
  return api.get(`architect/users/${userId}/`);
}

/**
 * Detalle de usuario con eventos (para auditoría)
 * Endpoint: audits/users/{id}/
 */
export async function getAuditUserDetail(userId) {
  return api.get(`audits/users/${userId}/`);
}

/**
 * Detalle de usuario (legacy, para otros usos)
 */
export async function getUserDetail(userId) {
  return api.get(`users/${userId}/`);
}
