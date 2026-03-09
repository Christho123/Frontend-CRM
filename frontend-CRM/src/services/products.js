import { api } from './api';

const BASE = 'products_configurations/product';

export async function getProducts(params = {}) {
  const { page = 1, page_size = 10, ...rest } = params;
  const search = new URLSearchParams({ page: String(page), page_size: String(page_size), ...rest });
  const data = await api.get(`${BASE}/?${search.toString()}`);
  if (Array.isArray(data)) return { results: data, count: data.length };
  const results = data.results ?? data.data ?? data.products ?? [];
  const count = data.count ?? data.total ?? results.length;
  return { results, count };
}

export async function getProductDetail(productId) {
  return api.get(`${BASE}/${productId}/`);
}

export async function createProduct(payload) {
  return api.post(`${BASE}/create/`, payload);
}

export async function updateProduct(productId, payload) {
  return api.put(`${BASE}/${productId}/edit/`, payload);
}

export async function deleteProduct(productId) {
  return api.delete(`${BASE}/${productId}/delete/`);
}

export async function uploadProductPhoto(productId, file) {
  const form = new FormData();
  form.append('photo', file);
  return api.post(`${BASE}/${productId}/photo/`, form);
}

export async function updateProductPhoto(productId, file) {
  const form = new FormData();
  form.append('photo', file);
  return api.put(`${BASE}/${productId}/photo/edit/`, form);
}

export async function deleteProductPhoto(productId) {
  return api.delete(`${BASE}/${productId}/photo/delete/`);
}

export async function getProductCategories() {
  const data = await api.get('products_configurations/category/');
  if (Array.isArray(data)) return data;
  return (
    data.category ??
    data.categories ??
    data.results ??
    data.data ??
    []
  );
}

export async function getProductSuppliers() {
  const data = await api.get('products_configurations/supplier/');
  if (Array.isArray(data)) return data;
  return (
    data.supplier ??
    data.suppliers ??
    data.results ??
    data.data ??
    []
  );
}

export async function getProductBrands() {
  const data = await api.get('products_configurations/brand/');
  if (Array.isArray(data)) return data;
  return (
    data.brand ??
    data.brands ??
    data.results ??
    data.data ??
    []
  );
}

