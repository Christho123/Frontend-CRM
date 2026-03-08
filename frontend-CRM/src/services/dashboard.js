import { api } from './api';

/**
 * Resumen de analytics
 */
export async function getAnalyticsSummary() {
  return api.get('analytics/summary/');
}

/**
 * Sesiones de auditoría (paginado)
 */
export async function getAuditSessions(params = {}) {
  const sp = new URLSearchParams(params).toString();
  return api.get(`audits/sessions/${sp ? `?${sp}` : ''}`);
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
 */
export async function getUserDetail(userId) {
  return api.get(`users/${userId}/`);
}
