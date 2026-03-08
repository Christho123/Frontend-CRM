/**
 * URL base para todos los endpoints de la API
 */
export const baseURL = 'http://127.0.0.1:8000/api/';

/** Origen del backend (sin /api/) para construir URLs de medios (fotos, etc.) */
export const apiOrigin = baseURL.replace(/\/api\/?$/, '') || 'http://127.0.0.1:8000';

/**
 * Convierte una ruta relativa de foto/medio (ej. /media/employee_photos/...) en URL absoluta
 * para que la imagen cargue desde el backend.
 */
export function getMediaUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return apiOrigin + (path.startsWith('/') ? path : '/' + path);
}
