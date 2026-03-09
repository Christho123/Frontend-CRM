import { useState, useEffect, useCallback } from 'react';
import {
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
} from '../services';
import { getMediaUrl } from '../config/baseURL';
import './Employees.css';
import './Dashboard.css';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const INITIAL_FORM = {
  name: '',
  description: '',
  model: '',
  unit_price: '',
  sales_price: '',
  stock: '',
  discount: '',
  category_id: '',
  supplier_id: '',
  brand_id: '',
  state: true,
};

export function Products() {
  const [productsData, setProductsData] = useState({ results: [], count: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [photoFile, setPhotoFile] = useState(null);
  const [deletePhotoFlag, setDeletePhotoFlag] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [detailProduct, setDetailProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [brands, setBrands] = useState([]);

  const loadProducts = useCallback(() => {
    setLoading(true);
    getProducts({ page, page_size: pageSize })
      .then((data) =>
        setProductsData({
          results: Array.isArray(data.results) ? data.results : [],
          count: data.count ?? 0,
        })
      )
      .catch(() => setProductsData({ results: [], count: 0 }))
      .finally(() => setLoading(false));
  }, [page, pageSize]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    Promise.all([
      getProductCategories().catch(() => []),
      getProductSuppliers().catch(() => []),
      getProductBrands().catch(() => []),
    ]).then(([cats, sups, brs]) => {
      setCategories(Array.isArray(cats) ? cats : []);
      setSuppliers(Array.isArray(sups) ? sups : []);
      setBrands(Array.isArray(brs) ? brs : []);
    });
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setPhotoFile(null);
    setDeletePhotoFlag(false);
    setError('');
    setSuccess('');
    setFormOpen(true);
  };

  const handleOpenEdit = async (prod) => {
    setError('');
    setSuccess('');
    setPhotoFile(null);
    setDeletePhotoFlag(false);
    try {
      const data = await getProductDetail(prod.id);
      const p = data.product ?? data;
      setForm({
        name: p.name ?? '',
        description: p.description ?? '',
        model: p.model ?? '',
        unit_price: p.unit_price ?? '',
        sales_price: p.sales_price ?? '',
        stock: p.stock ?? '',
        discount: p.discount ?? '',
        category_id: p.category?.id ?? p.category_id ?? '',
        supplier_id: p.supplier?.id ?? p.supplier_id ?? '',
        brand_id: p.brand?.id ?? p.brand_id ?? '',
        state: typeof p.state === 'boolean' ? p.state : String(p.state) === 'True',
      });
      setEditingId(prod.id);
      setFormOpen(true);
    } catch {
      setError('No se pudo cargar el producto.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitLoading(true);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      model: form.model.trim() || null,
      unit_price: form.unit_price ? parseFloat(form.unit_price) : 0,
      sales_price: form.sales_price ? parseFloat(form.sales_price) : 0,
      stock: form.stock ? Number(form.stock) : 0,
      discount: form.discount ? parseFloat(form.discount) : 0,
      category_id: form.category_id ? Number(form.category_id) : null,
      supplier_id: form.supplier_id ? Number(form.supplier_id) : null,
      brand_id: form.brand_id ? Number(form.brand_id) : null,
      state: Boolean(form.state),
    };

    try {
      if (editingId) {
        await updateProduct(editingId, payload);
        if (deletePhotoFlag) {
          await deleteProductPhoto(editingId);
        } else if (photoFile) {
          await updateProductPhoto(editingId, photoFile);
        }
        setSuccess('Producto actualizado correctamente.');
      } else {
        const res = await createProduct(payload);
        const prodId = res.product?.id ?? res.id;
        if (prodId && photoFile) {
          await uploadProductPhoto(prodId, photoFile);
        }
        setSuccess('Producto creado correctamente.');
      }
      loadProducts();
      setTimeout(() => {
        setFormOpen(false);
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(JSON.stringify(err.response?.data) || 'Error al guardar.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = (prod) => {
    setDeleteConfirm(prod);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setSubmitLoading(true);
    setError('');
    try {
      await deleteProduct(deleteConfirm.id);
      setSuccess('Producto eliminado.');
      loadProducts();
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message || 'Error al eliminar.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDetail = async (prod) => {
    setError('');
    try {
      const data = await getProductDetail(prod.id);
      setDetailProduct(data.product ?? data);
    } catch {
      setDetailProduct(null);
      setError('No se pudo cargar el detalle.');
    }
  };

  const getSupplierName = (p) => {
    if (p.supplier_name) return p.supplier_name;
    if (p.supplier) {
      const s = p.supplier;
      return (
        s.company_name ||
        s.business_name ||
        s.name ||
        s.supplier_name ||
        '—'
      );
    }
    const supId = p.supplier_id ?? p.supplier ?? null;
    if (!supId) return '—';
    const s = suppliers.find((x) => String(x.id) === String(supId));
    if (!s) return '—';
    return s.company_name || s.business_name || s.name || `Proveedor ${s.id}`;
  };

  const products = productsData.results;
  const filteredProducts = search.trim()
    ? products.filter((p) => {
        const term = search.trim().toLowerCase();
        const parts = [
          p.name,
          p.description,
          p.model,
          p.category_name ?? p.category?.name,
          getSupplierName(p),
          p.brand_name ?? p.brand?.name,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return parts.includes(term);
      })
    : products;

  const totalPages = Math.max(1, Math.ceil(productsData.count / pageSize));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setPage(1);
  };

  const formatMoney = (v) => {
    if (v == null || v === '') return '—';
    const num = typeof v === 'number' ? v : parseFloat(v);
    if (Number.isNaN(num)) return String(v);
    return num.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' });
  };

  const formatDate = (dt) => {
    if (!dt) return '—';
    try {
      return new Date(dt).toLocaleString('es', { dateStyle: 'short', timeStyle: 'short' });
    } catch {
      return dt;
    }
  };

  return (
    <main className="employees">
      <header className="employees__header">
        <h1 className="employees__title">Productos</h1>
        <button type="button" className="employees__btn-create" onClick={handleOpenCreate}>
          Crear producto
        </button>
      </header>

      <div className="employees__search-wrap">
        <input
          type="search"
          className="employees__search"
          placeholder="Buscar por nombre, modelo, categoría, proveedor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <p className="employees__msg employees__msg--error">{error}</p>}
      {success && <p className="employees__msg employees__msg--success">{success}</p>}

      <div className="employees__table-wrap">
        {loading ? (
          <p className="employees__loading">Cargando productos…</p>
        ) : (
          <table className="employees__table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Modelo</th>
                <th>Proveedor</th>
                <th>Marca</th>
                <th>Precio venta</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8}>No hay productos</td>
                </tr>
              ) : (
                filteredProducts.map((prod) => (
                  <tr key={prod.id}>
                    <td>
                      {prod.photo_url ? (
                        <img
                          src={getMediaUrl(prod.photo_url)}
                          alt={prod.name ?? ''}
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '10px',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>{prod.name ?? '—'}</td>
                    <td>{prod.model ?? '—'}</td>
                    <td>{getSupplierName(prod)}</td>
                    <td>{prod.brand_name ?? prod.brand?.name ?? '—'}</td>
                    <td>{formatMoney(prod.sales_price)}</td>
                    <td>{prod.stock ?? '—'}</td>
                    <td>
                      <div className="employees__actions">
                        <button
                          type="button"
                          className="employees__btn employees__btn--detail"
                          onClick={() => handleDetail(prod)}
                          title="Detalle"
                        >
                          Detalle
                        </button>
                        <button
                          type="button"
                          className="employees__btn employees__btn--edit"
                          onClick={() => handleOpenEdit(prod)}
                          title="Editar"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="employees__btn employees__btn--delete"
                          onClick={() => handleDelete(prod)}
                          title="Eliminar"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {!loading && productsData.count > 0 && (
        <div className="dashboard__pagination">
          <div className="dashboard__pagination-size">
            <span className="dashboard__pagination-size-label">Filas por página:</span>
            <div className="dashboard__pagination-size-btns">
              {PAGE_SIZE_OPTIONS.map((size) => (
                <button
                  key={size}
                  type="button"
                  className={`dashboard__pagination-size-btn ${pageSize === size ? 'dashboard__pagination-size-btn--active' : ''}`}
                  onClick={() => handlePageSizeChange(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          <div className="dashboard__pagination-arrows">
            <button
              type="button"
              className="dashboard__pagination-arrow"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!hasPrev}
              aria-label="Página anterior"
            >
              ← Anterior
            </button>
            <span className="dashboard__pagination-info">
              Página {page} de {totalPages}
            </span>
            <button
              type="button"
              className="dashboard__pagination-arrow"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={!hasNext}
              aria-label="Página siguiente"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}

      <ProductFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        form={form}
        setForm={setForm}
        categories={categories}
        suppliers={suppliers}
        brands={brands}
        photoFile={photoFile}
        setPhotoFile={setPhotoFile}
        deletePhotoFlag={deletePhotoFlag}
        setDeletePhotoFlag={setDeletePhotoFlag}
        editingId={editingId}
        onSubmit={handleSubmit}
        loading={submitLoading}
      />

      {detailProduct && (
        <div className="employees__modal-overlay" onClick={() => setDetailProduct(null)}>
          <div className="employees__modal" onClick={(e) => e.stopPropagation()}>
            <div className="employees__modal-header">
              <h3>Detalle de producto</h3>
              <button
                type="button"
                className="employees__modal-close"
                onClick={() => setDetailProduct(null)}
              >
                ×
              </button>
            </div>
            <div className="employees__modal-body">
              {detailProduct.photo_url && (
                <div className="employees__modal-photo">
                  <img src={getMediaUrl(detailProduct.photo_url)} alt="" />
                </div>
              )}
              <div className="employees__modal-fields">
                <div className="employees__modal-field">
                  <span className="employees__modal-field-label">Nombre</span>
                  <span className="employees__modal-field-value">
                    {detailProduct.name ?? '—'}
                  </span>
                </div>
                <div className="employees__modal-field">
                  <span className="employees__modal-field-label">Descripción</span>
                  <span className="employees__modal-field-value">
                    {detailProduct.description ?? '—'}
                  </span>
                </div>
                <div className="employees__modal-field">
                  <span className="employees__modal-field-label">Modelo</span>
                  <span className="employees__modal-field-value">
                    {detailProduct.model ?? '—'}
                  </span>
                </div>
                <div className="employees__modal-field">
                  <span className="employees__modal-field-label">Categoría</span>
                  <span className="employees__modal-field-value">
                    {detailProduct.category_name ?? detailProduct.category?.name ?? '—'}
                  </span>
                </div>
                <div className="employees__modal-field">
                  <span className="employees__modal-field-label">Proveedor</span>
                  <span className="employees__modal-field-value">
                    {detailProduct.supplier?.company_name ?? '—'}
                  </span>
                </div>
                <div className="employees__modal-field">
                  <span className="employees__modal-field-label">Marca</span>
                  <span className="employees__modal-field-value">
                    {detailProduct.brand_name ?? detailProduct.brand?.name ?? '—'}
                  </span>
                </div>
                <div className="employees__modal-field">
                  <span className="employees__modal-field-label">Precio costo</span>
                  <span className="employees__modal-field-value">
                    {formatMoney(detailProduct.unit_price)}
                  </span>
                </div>
                <div className="employees__modal-field">
                  <span className="employees__modal-field-label">Precio venta</span>
                  <span className="employees__modal-field-value">
                    {formatMoney(detailProduct.sales_price)}
                  </span>
                </div>
                <div className="employees__modal-field">
                  <span className="employees__modal-field-label">Stock</span>
                  <span className="employees__modal-field-value">
                    {detailProduct.stock ?? '—'}
                  </span>
                </div>
                <div className="employees__modal-field">
                  <span className="employees__modal-field-label">Descuento</span>
                  <span className="employees__modal-field-value">
                    {detailProduct.discount ?? '—'}
                  </span>
                </div>
                <div className="employees__modal-field">
                  <span className="employees__modal-field-label">Estado</span>
                  <span className="employees__modal-field-value">
                    {detailProduct.state ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div className="employees__modal-field">
                  <span className="employees__modal-field-label">Creado</span>
                  <span className="employees__modal-field-value">
                    {formatDate(detailProduct.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="employees__modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div
            className="employees__modal employees__modal--sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="employees__modal-header">
              <h3>Eliminar producto</h3>
              <button
                type="button"
                className="employees__modal-close"
                onClick={() => setDeleteConfirm(null)}
              >
                ×
              </button>
            </div>
            <div className="employees__modal-body">
              <p>¿Eliminar el producto {deleteConfirm.name ?? 'seleccionado'}?</p>
              <div className="employees__modal-actions">
                <button
                  type="button"
                  className="employees__btn employees__btn--delete"
                  onClick={confirmDelete}
                  disabled={submitLoading}
                >
                  {submitLoading ? 'Eliminando…' : 'Eliminar'}
                </button>
                <button
                  type="button"
                  className="employees__btn employees__btn--secondary"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function ProductFormModal({
  open,
  onClose,
  form,
  setForm,
  categories,
  suppliers,
  brands,
  photoFile,
  setPhotoFile,
  deletePhotoFlag,
  setDeletePhotoFlag,
  editingId,
  onSubmit,
  loading,
}) {
  if (!open) return null;

  return (
    <div className="employees__modal-overlay" onClick={onClose}>
      <div
        className="employees__modal employees__modal--form"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="employees__modal-header">
          <h3>{editingId ? 'Editar producto' : 'Crear producto'}</h3>
          <button type="button" className="employees__modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <form className="employees__form" onSubmit={onSubmit}>
          <div className="employees__form-grid">
            <div className="employees__form-group">
              <label>Nombre</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="employees__form-group">
              <label>Modelo</label>
              <input
                type="text"
                value={form.model}
                onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
              />
            </div>
            <div className="employees__form-group employees__form-group--full">
              <label>Descripción</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="employees__form-group">
              <label>Precio costo</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.unit_price}
                onChange={(e) => setForm((f) => ({ ...f, unit_price: e.target.value }))}
              />
            </div>
            <div className="employees__form-group">
              <label>Precio venta</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.sales_price}
                onChange={(e) => setForm((f) => ({ ...f, sales_price: e.target.value }))}
              />
            </div>
            <div className="employees__form-group">
              <label>Stock</label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
              />
            </div>
            <div className="employees__form-group">
              <label>Descuento</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.discount}
                onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))}
              />
            </div>
            <div className="employees__form-group">
              <label>Categoría</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
              >
                <option value="">Seleccionar</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name ?? c.category_name ?? `Categoría ${c.id}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="employees__form-group">
              <label>Proveedor</label>
              <select
                value={form.supplier_id}
                onChange={(e) => setForm((f) => ({ ...f, supplier_id: e.target.value }))}
              >
                <option value="">Seleccionar</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.company_name ?? s.business_name ?? s.name ?? `Proveedor ${s.id}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="employees__form-group">
              <label>Marca</label>
              <select
                value={form.brand_id}
                onChange={(e) => setForm((f) => ({ ...f, brand_id: e.target.value }))}
              >
                <option value="">Seleccionar</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name ?? b.brand_name ?? `Marca ${b.id}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="employees__form-group">
              <label>Estado</label>
              <select
                value={form.state ? 'true' : 'false'}
                onChange={(e) =>
                  setForm((f) => ({ ...f, state: e.target.value === 'true' }))
                }
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
            <div className="employees__form-group employees__form-group--full">
              <label>Foto</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setPhotoFile(e.target.files?.[0] || null);
                  setDeletePhotoFlag(false);
                }}
              />
              {editingId && (
                <label className="employees__form-check">
                  <input
                    type="checkbox"
                    checked={deletePhotoFlag}
                    onChange={(e) => {
                      setDeletePhotoFlag(e.target.checked);
                      if (e.target.checked) setPhotoFile(null);
                    }}
                  />
                  Eliminar foto actual
                </label>
              )}
            </div>
          </div>
          <div className="employees__form-footer">
            <button
              type="button"
              className="employees__btn employees__btn--secondary"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="employees__btn employees__btn--primary"
              disabled={loading}
            >
              {loading ? 'Guardando…' : editingId ? 'Editar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

