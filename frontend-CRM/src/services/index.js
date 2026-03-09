export { api, fetchApi } from './api';
export { loginStep1, loginStep2 } from './auth';
export { registerUser, getDocumentTypes } from './register';
export { getAnalyticsSummary, getAuditSessions, getAuditUserDetail, getUserDetail, getUserProfile } from './dashboard';
export {
  getEmployees,
  getEmployeeDetail,
  createEmployee,
  uploadEmployeePhoto,
  updateEmployee,
  updateEmployeePhoto,
  deleteEmployeePhoto,
  deleteEmployee,
  getRegions,
  getProvinces,
  getDistricts,
  getRoles,
} from './employees';
export {
  getProducts,
  getProductDetail,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductPhoto,
  updateProductPhoto,
  deleteProductPhoto,
  getProductCategories,
  getProductSuppliers,
  getProductBrands,
} from './products';
