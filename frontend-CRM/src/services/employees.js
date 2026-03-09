import { api } from './api';

const BASE = 'employees/employee';

/**
 * Listar empleados (paginado, con búsqueda opcional)
 * Params: page, page_size, search
 */
export async function getEmployees(params = {}) {
  const { page = 1, page_size = 10, ...rest } = params;
  const search = new URLSearchParams({ page: String(page), page_size: String(page_size), ...rest });
  const data = await api.get(`${BASE}/?${search.toString()}`);
  if (Array.isArray(data)) return { results: data, count: data.length };
  const results = data.results ?? data.data ?? data.employees ?? [];
  const count = data.count ?? data.total ?? results.length;
  return { results, count };
}

/**
 * Detalle de empleado
 */
export async function getEmployeeDetail(employeeId) {
  return api.get(`${BASE}/${employeeId}/`);
}

/**
 * Crear empleado
 */
export async function createEmployee(payload) {
  return api.post(`${BASE}/create/`, payload);
}

/**
 * Subir foto de empleado
 */
export async function uploadEmployeePhoto(employeeId, file) {
  const form = new FormData();
  form.append('photo', file);
  return api.post(`${BASE}/${employeeId}/photo/`, form);
}

/**
 * Editar empleado (parcial)
 */
export async function updateEmployee(employeeId, payload) {
  return api.patch(`${BASE}/${employeeId}/edit/`, payload);
}

/**
 * Actualizar foto de empleado
 */
export async function updateEmployeePhoto(employeeId, file) {
  const form = new FormData();
  form.append('photo', file);
  return api.put(`${BASE}/${employeeId}/photo/edit/`, form);
}

/**
 * Eliminar foto de empleado
 */
export async function deleteEmployeePhoto(employeeId) {
  return api.delete(`${BASE}/${employeeId}/photo/delete/`);
}

/**
 * Eliminar empleado
 */
export async function deleteEmployee(employeeId) {
  return api.delete(`${BASE}/${employeeId}/delete/`);
}

/**
 * Catálogos para el formulario
 */
export async function getRegions() {
  try {
    const data = await api.get('locations/regions/');
    return Array.isArray(data) ? data : data.results ?? data.data ?? [];
  } catch {
    return [];
  }
}

export async function getProvinces(regionId) {
  if (!regionId) return [];
  try {
    const data = await api.get(`locations/provinces/?region=${regionId}`);
    return Array.isArray(data) ? data : data.results ?? data.data ?? [];
  } catch {
    return [];
  }
}

export async function getDistricts(provinceId) {
  if (!provinceId) return [];
  try {
    const data = await api.get(`locations/districts/?province=${provinceId}`);
    return Array.isArray(data) ? data : data.results ?? data.data ?? [];
  } catch {
    return [];
  }
}

export async function getRoles() {
  try {
    const data = await api.get('architect/roles/');
    return Array.isArray(data) ? data : data.results ?? data.data ?? [];
  } catch {
    return [];
  }
}
