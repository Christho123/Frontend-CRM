import { api } from './api';

const REGISTER_ENDPOINT = 'profiles/register/';
const DOCUMENT_TYPES_ENDPOINT = 'types_documents/document_types/';

/**
 * Obtiene los tipos de documento disponibles (solo los que existen en la BD)
 * @returns {Promise<Array<{ id: number, name: string }>>}
 */
export async function getDocumentTypes() {
  const data = await api.get(DOCUMENT_TYPES_ENDPOINT);
  if (Array.isArray(data)) return data;
  if (data.document_types) return data.document_types;
  if (data.results) return data.results;
  return data.data || [];
}

/**
 * Registro de usuario
 * @param {{ email: string, user_name: string, document_number: string, document_type: number, password: string, password_confirm: string }}
 * @returns {Promise<{ message: string, user: { id: number, email: string, user_name: string, document_number: string, document_type_id: number, document_type: string } }>}
 */
export async function registerUser({ email, user_name, document_number, document_type, password, password_confirm }) {
  return api.post(REGISTER_ENDPOINT, {
    email,
    user_name,
    document_number,
    document_type,
    password,
    password_confirm,
  });
}
