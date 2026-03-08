import { api } from './api';

const LOGIN_ENDPOINT = 'architect/auth/login/';

/**
 * Paso 1: enviar email y password. Si 2FA está activo, devuelve challenge_id y mensaje.
 * @param {{ email: string, password: string }}
 * @returns {Promise<{ twoFaRequired: boolean, challengeId: number, email: string, message: string }>}
 */
export async function loginStep1({ email, password }) {
  const data = await api.post(LOGIN_ENDPOINT, { email, password });
  return {
    twoFaRequired: data['2fa_required'] === true,
    challengeId: data.challenge_id,
    email: data.email,
    message: data.message,
  };
}

/**
 * Paso 2: enviar código 2FA con email, password y challenge_id guardados.
 * @param {{ email: string, password: string, code: string, challenge_id: number }}
 * @returns {Promise<{ access: string, refresh: string, user_id: number, audit_session_id: number }>}
 */
export async function loginStep2({ email, password, code, challenge_id }) {
  const data = await api.post(LOGIN_ENDPOINT, {
    email,
    password,
    code,
    challenge_id,
  });
  return {
    access: data.access,
    refresh: data.refresh,
    user_id: data.user_id,
    audit_session_id: data.audit_session_id,
    email: data.email,
  };
}
