import { useState, useEffect, useCallback } from 'react';
import { getRolesPaginated, getRoleDetail, createRole, updateRole, deleteRole } from '../services/roles';
import './Employees.css';
import './Dashboard.css';

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const INITIAL_FORM = { name: '', guard_name: '' };

export function Roles() {
  const [rolesData, setRolesData] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [detailRole, setDetailRole] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const loadRoles = useCallback(() => {
    setLoading(true);
    getRolesPaginated({ page, page_size: pageSize })
      .then((data) =>
        setRolesData({
          results: Array.isArray(data.results) ? data.results : [],
          count: data.count ?? 0,
        })
      )
      .catch(() => setRolesData({ results: [], count: 0 }))
      .finally(() => setLoading(false));
  }, [page, pageSize]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setError('');
    setSuccess('');
    setFormOpen(true);
  };

  const handleOpenEdit = async (role) => {
    setError('');
    setSuccess('');
    try {
      const data = await getRoleDetail(role.id);
      const r = data.role ?? data;
      setForm({
        name: r.name ?? '',
        guard_name: r.guard_name ?? r.name ?? '',
      });
      setEditingId(role.id);
      setFormOpen(true);
    } catch {
      setError('No se pudo cargar el rol.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitLoading(true);
    const payload = { name: form.name.trim(), guard_name: form.guard_name.trim() || form.name.trim() };
    try {
      if (editingId) {
        await updateRole(editingId, payload);
        setSuccess('Rol actualizado correctamente.');
      } else {
        await createRole(payload);
        setSuccess('Rol creado correctamente.');
      }
      loadRoles();
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

  const handleDelete = (role) => setDeleteConfirm(role);

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setSubmitLoading(true);
    setError('');
    try {
      await deleteRole(deleteConfirm.id);
      setSuccess('Rol eliminado.');
      loadRoles();
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message || 'Error al eliminar.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDetail = async (role) => {
    setError('');
    try {
      const data = await getRoleDetail(role.id);
      setDetailRole(data.role ?? data);
    } catch {
      setDetailRole(null);
      setError('No se pudo cargar el detalle.');
    }
  };

  const formatDate = (dt) => {
    if (!dt) return '—';
    try {
      return new Date(dt).toLocaleString('es', { dateStyle: 'short', timeStyle: 'short' });
    } catch {
      return dt;
    }
  };

  const roles = rolesData.results;
  const totalPages = Math.max(1, Math.ceil(rolesData.count / pageSize));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;
  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setPage(1);
  };

  return (
    <main className="employees">
      <header className="employees__header">
        <h1 className="employees__title">RRHH - Roles</h1>
        <button type="button" className="employees__btn-create" onClick={handleOpenCreate}>
          Crear rol
        </button>
      </header>

      {error && <p className="employees__msg employees__msg--error">{error}</p>}
      {success && <p className="employees__msg employees__msg--success">{success}</p>}

      <div className="employees__table-wrap">
        {loading ? (
          <p className="employees__loading">Cargando roles…</p>
        ) : (
          <table className="employees__table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Guard name</th>
                <th>Creado</th>
                <th>Actualizado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {roles.length === 0 ? (
                <tr>
                  <td colSpan={5}>No hay roles</td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr key={role.id}>
                    <td>{role.name ?? '—'}</td>
                    <td>{role.guard_name ?? '—'}</td>
                    <td>{formatDate(role.created_at)}</td>
                    <td>{formatDate(role.updated_at)}</td>
                    <td>
                      <div className="employees__actions">
                        <button
                          type="button"
                          className="employees__btn employees__btn--detail"
                          onClick={() => handleDetail(role)}
                          title="Detalle"
                        >
                          Detalle
                        </button>
                        <button
                          type="button"
                          className="employees__btn employees__btn--edit"
                          onClick={() => handleOpenEdit(role)}
                          title="Editar"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="employees__btn employees__btn--delete"
                          onClick={() => handleDelete(role)}
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

      {!loading && rolesData.count > 0 && (
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

      <RoleFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        form={form}
        setForm={setForm}
        editingId={editingId}
        onSubmit={handleSubmit}
        loading={submitLoading}
      />

      {detailRole && (
        <div className="employees__modal-overlay" onClick={() => setDetailRole(null)}>
          <div className="employees__modal" onClick={(e) => e.stopPropagation()}>
            <div className="employees__modal-header">
              <h3>Detalle de rol</h3>
              <button type="button" className="employees__modal-close" onClick={() => setDetailRole(null)}>
                ×
              </button>
            </div>
            <div className="employees__modal-body">
              <div className="employees__modal-fields">
                <div className="employees__modal-field">
                  <span className="employees__modal-field-label">Nombre</span>
                  <span className="employees__modal-field-value">{detailRole.name ?? '—'}</span>
                </div>
                <div className="employees__modal-field">
                  <span className="employees__modal-field-label">Guard name</span>
                  <span className="employees__modal-field-value">{detailRole.guard_name ?? '—'}</span>
                </div>
                <div className="employees__modal-field">
                  <span className="employees__modal-field-label">Creado</span>
                  <span className="employees__modal-field-value">{formatDate(detailRole.created_at)}</span>
                </div>
                <div className="employees__modal-field">
                  <span className="employees__modal-field-label">Actualizado</span>
                  <span className="employees__modal-field-value">{formatDate(detailRole.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="employees__modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="employees__modal employees__modal--sm" onClick={(e) => e.stopPropagation()}>
            <div className="employees__modal-header">
              <h3>Eliminar rol</h3>
              <button type="button" className="employees__modal-close" onClick={() => setDeleteConfirm(null)}>
                ×
              </button>
            </div>
            <div className="employees__modal-body">
              <p>¿Eliminar el rol {deleteConfirm.name ?? 'seleccionado'}?</p>
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

function RoleFormModal({ open, onClose, form, setForm, editingId, onSubmit, loading }) {
  if (!open) return null;
  return (
    <div className="employees__modal-overlay" onClick={onClose}>
      <div className="employees__modal employees__modal--form" onClick={(e) => e.stopPropagation()}>
        <div className="employees__modal-header">
          <h3>{editingId ? 'Editar rol' : 'Crear rol'}</h3>
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
              <label>Guard name</label>
              <input
                type="text"
                value={form.guard_name}
                onChange={(e) => setForm((f) => ({ ...f, guard_name: e.target.value }))}
                placeholder="Mismo que nombre si se deja vacío"
              />
            </div>
          </div>
          <div className="employees__form-footer">
            <button type="button" className="employees__btn employees__btn--secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="employees__btn employees__btn--primary" disabled={loading}>
              {loading ? 'Guardando…' : editingId ? 'Editar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
