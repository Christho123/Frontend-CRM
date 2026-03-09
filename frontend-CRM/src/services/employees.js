import { api } from './api';

const BASE = 'employees/employee';

/**
 * Listar empleados (con búsqueda opcional)
 */
export async function getEmployees(params = {}) {
  const sp = new URLSearchParams(params).toString();
  const url = `${BASE}/${sp ? `?${sp}` : ''}`;
  const data = await api.get(url);
  if (Array.isArray(data)) return data;
  return data.results ?? data.data ?? data.employees ?? [];
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
