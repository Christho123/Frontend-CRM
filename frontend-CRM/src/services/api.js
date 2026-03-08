import { baseURL } from '../config/baseURL';

const getAccessToken = () => window.localStorage.getItem('access_token');

const getHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

export async function fetchApi(endpoint, options = {}) {
  const url = `${baseURL}${endpoint}`;
  const config = {
    ...options,
    headers: { ...getHeaders(), ...options.headers },
  };
  const response = await fetch(url, config);
  if (!response.ok) {
    const err = new Error(`API Error: ${response.status} ${response.statusText}`);
    err.status = response.status;
    throw err;
  }
  return response.json();
}

export const api = {
  get: (endpoint) => fetchApi(endpoint, { method: 'GET' }),
  post: (endpoint, body) =>
    fetchApi(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) =>
    fetchApi(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (endpoint, body) =>
    fetchApi(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (endpoint) => fetchApi(endpoint, { method: 'DELETE' }),
};
