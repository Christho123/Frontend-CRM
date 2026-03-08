import { useState, useEffect, useCallback } from 'react';
import {
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
} from '../services';
import { getDocumentTypes } from '../services/register';
import './Employees.css';

const INITIAL_FORM = {
  name: '',
  last_name_paternal: '',
  last_name_maternal: '',
  document_type: '',
  document_number: '',
  email: '',
  gender: 'M',
  phone: '',
  birth_date: '',
  region_id: '',
  province_id: '',
  district_id: '',
  rol: '',
  salary: '',
  address: '',
};

export function Employees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [photoFile, setPhotoFile] = useState(null);
  const [deletePhotoFlag, setDeletePhotoFlag] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [detailEmployee, setDetailEmployee] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [documentTypes, setDocumentTypes] = useState([]);
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [roles, setRoles] = useState([]);

  const loadEmployees = useCallback(() => {
    setLoading(true);
    const params = search.trim() ? { search: search.trim() } : {};
    getEmployees(params)
      .then((data) => setEmployees(Array.isArray(data) ? data : []))
      .catch(() => setEmployees([]))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    const t = setTimeout(loadEmployees, 300);
    return () => clearTimeout(t);
  }, [loadEmployees]);

  useEffect(() => {
    getDocumentTypes().then(setDocumentTypes).catch(() => setDocumentTypes([]));
    getRegions().then(setRegions).catch(() => setRegions([]));
    getRoles().then(setRoles).catch(() => setRoles([]));
  }, []);

  useEffect(() => {
    if (!form.region_id) {
      setProvinces([]);
      return;
    }
  
    getProvinces(Number(form.region_id))
      .then(setProvinces)
      .catch(() => setProvinces([]));
  }, [form.region_id]);

  useEffect(() => {
    if (!form.province_id) {
      setDistricts([]);
      return;
    }
  
    getDistricts(Number(form.province_id))
      .then(setDistricts)
      .catch(() => setDistricts([]));
  }, [form.province_id]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setPhotoFile(null);
    setDeletePhotoFlag(false);
    setError('');
    setSuccess('');
    setFormOpen(true);
  };

  const handleOpenEdit = async (emp) => {
    setError('');
    setSuccess('');
    setPhotoFile(null);
    setDeletePhotoFlag(false);
    try {
      const data = await getEmployeeDetail(emp.id);
      const e = data.employee ?? data;
      setForm({
        name: e.name ?? '',
        last_name_paternal: e.last_name_paternal ?? '',
        last_name_maternal: e.last_name_maternal ?? '',
        document_type: e.document_type?.id ?? e.document_type ?? '',
        document_number: e.document_number ?? '',
        email: e.email ?? '',
        gender: e.gender ?? 'M',
        phone: e.phone ?? '',
        birth_date: e.birth_date ? e.birth_date.slice(0, 10) : '',
        region_id: e.region?.id ?? e.region_id ?? '',
        province_id: e.province?.id ?? e.province_id ?? '',
        district_id: e.district?.id ?? e.district_id ?? '',
        rol: e.rol?.id ?? e.rol ?? '',
        salary: e.salary ?? '',
        address: e.address ?? '',
      });
      setEditingId(emp.id);
      setFormOpen(true);
    } catch (err) {
      setError('No se pudo cargar el empleado.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitLoading(true);

    const payload = {
      name: form.name.trim(),
      last_name_paternal: form.last_name_paternal.trim(),
      last_name_maternal: form.last_name_maternal.trim(),
      document_type: form.document_type ? Number(form.document_type) : null,
      document_number: form.document_number.trim(),
      email: form.email.trim(),
      gender: form.gender,
      phone: form.phone.trim() || null,
      birth_date: form.birth_date || null,
      region: form.region_id ? Number(form.region_id) : null,
      province: form.province_id ? Number(form.province_id) : null,
      district: form.district_id ? Number(form.district_id) : null,
      rol: form.rol ? Number(form.rol) : null,
      salary: form.salary ? parseFloat(form.salary) : null,
      address: form.address.trim() || null,
    };

    try {
      if (editingId) {
        await updateEmployee(editingId, payload);
        if (deletePhotoFlag) {
          await deleteEmployeePhoto(editingId);
        } else if (photoFile) {
          await updateEmployeePhoto(editingId, photoFile);
        }
        setSuccess('Empleado actualizado correctamente.');
      } else {
        const res = await createEmployee(payload);
        const empId = res.employee?.id ?? res.id;
        if (empId && photoFile) {
          await uploadEmployeePhoto(empId, photoFile);
        }
        setSuccess('Empleado creado correctamente.');
      }
      loadEmployees();
      setTimeout(() => {
        setFormOpen(false);
        setSuccess('');
      }, 1500);
    } catch (err) {
      console.log("ERROR BACKEND:", err.response?.data);
      setError(JSON.stringify(err.response?.data) || 'Error al guardar.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (emp) => {
    setDeleteConfirm(emp);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setSubmitLoading(true);
    setError('');
    try {
      await deleteEmployee(deleteConfirm.id);
      setSuccess('Empleado eliminado.');
      loadEmployees();
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message || 'Error al eliminar.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDetail = async (emp) => {
    setError('');
    try {
      const data = await getEmployeeDetail(emp.id);
      setDetailEmployee(data.employee ?? data);
    } catch {
      setDetailEmployee(null);
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

  const getDocTypeName = (emp) => emp.document_type?.name ?? emp.document_type_name ?? '—';
  const getRoleName = (emp) => emp.rol?.name ?? emp.rol_name ?? '—';

  return (
    <main className="employees">
      <header className="employees__header">
        <h1 className="employees__title">RRHH - Empleados</h1>
        <button type="button" className="employees__btn-create" onClick={handleOpenCreate}>
          Crear empleado
        </button>
      </header>

      <div className="employees__search-wrap">
        <input
          type="search"
          className="employees__search"
          placeholder="Buscar por nombre, apellido, documento, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <p className="employees__msg employees__msg--error">{error}</p>}
      {success && <p className="employees__msg employees__msg--success">{success}</p>}

      <div className="employees__table-wrap">
        {loading ? (
          <p className="employees__loading">Cargando empleados…</p>
        ) : (
          <table className="employees__table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellidos</th>
                <th>Tipo doc.</th>
                <th>Nº documento</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={9}>No hay empleados</td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.name ?? '—'}</td>
                    <td>{[emp.last_name_paternal, emp.last_name_maternal].filter(Boolean).join(' ') || '—'}</td>
                    <td>{getDocTypeName(emp)}</td>
                    <td>{emp.document_number ?? '—'}</td>
                    <td>{emp.phone ?? '—'}</td>
                    <td>{emp.email ?? '—'}</td>
                    <td>{getRoleName(emp)}</td>
                    <td>{formatDate(emp.created_at)}</td>
                    <td>
                      <div className="employees__actions">
                        <button type="button" className="employees__btn employees__btn--detail" onClick={() => handleDetail(emp)} title="Detalle">
                          Detalle
                        </button>
                        <button type="button" className="employees__btn employees__btn--edit" onClick={() => handleOpenEdit(emp)} title="Editar">
                          Editar
                        </button>
                        <button type="button" className="employees__btn employees__btn--delete" onClick={() => handleDelete(emp)} title="Eliminar">
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

      <EmployeeFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        form={form}
        setForm={setForm}
        photoFile={photoFile}
        setPhotoFile={setPhotoFile}
        deletePhotoFlag={deletePhotoFlag}
        setDeletePhotoFlag={setDeletePhotoFlag}
        documentTypes={documentTypes}
        regions={regions}
        provinces={provinces}
        districts={districts}
        roles={roles}
        editingId={editingId}
        onSubmit={handleSubmit}
        loading={submitLoading}
      />

      {detailEmployee && (
        <div className="employees__modal-overlay" onClick={() => setDetailEmployee(null)}>
          <div className="employees__modal" onClick={(e) => e.stopPropagation()}>
            <div className="employees__modal-header">
              <h3>Detalle de empleado</h3>
              <button type="button" className="employees__modal-close" onClick={() => setDetailEmployee(null)}>×</button>
            </div>
            <div className="employees__modal-body">
              {detailEmployee.photo_url && (
                <div className="employees__modal-photo">
                  <img src={detailEmployee.photo_url} alt="" />
                </div>
              )}
              <div className="employees__modal-fields">
                <div className="employees__modal-field">
                  <span className="employees__modal-field-label">Nombre completo</span>
                  <span className="employees__modal-field-value">{detailEmployee.full_name ?? '—'}</span>
                </div>
                <div className="employees__modal-field">
                  <span className="employees__modal-field-label">Nombre</span>
                  <span className="employees__modal-field-value">{detailEmployee.name ?? '—'}</span>
                </div>
                <div className="employees__modal-field">
                  <span className="employees__modal-field-label">Apellidos</span>
                  <span className="employees__modal-field-value">{[detailEmployee.last_name_paternal, detailEmployee.last_name_maternal].filter(Boolean).join(' ') || '—'}</span>
                </div>
                <div className="employees__modal-field">
                  <span className="employees__modal-field-label">Documento</span>
                  <span className="employees__modal-field-value">{getDocTypeName(detailEmployee)} {detailEmployee.document_number ?? ''}</span>
                </div>
                <div className="employees__modal-field">
                  <span className="employees__modal-field-label">Email</span>
                  <span className="employees__modal-field-value">{detailEmployee.email ?? '—'}</span>
                </div>
                <div className="employees__modal-field">
                  <span className="employees__modal-field-label">Teléfono</span>
                  <span className="employees__modal-field-value">{detailEmployee.phone ?? '—'}</span>
                </div>
                <div className="employees__modal-field">
                  <span className="employees__modal-field-label">Rol</span>
                  <span className="employees__modal-field-value">{getRoleName(detailEmployee)}</span>
                </div>
                <div className="employees__modal-field">
                  <span className="employees__modal-field-label">Dirección</span>
                  <span className="employees__modal-field-value">{detailEmployee.address ?? '—'}</span>
                </div>
                <div className="employees__modal-field">
                  <span className="employees__modal-field-label">Salario</span>
                  <span className="employees__modal-field-value">{detailEmployee.salary ?? '—'}</span>
                </div>
                <div className="employees__modal-field">
                  <span className="employees__modal-field-label">Fecha de alta</span>
                  <span className="employees__modal-field-value">{formatDate(detailEmployee.created_at)}</span>
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
              <h3>Eliminar empleado</h3>
              <button type="button" className="employees__modal-close" onClick={() => setDeleteConfirm(null)}>×</button>
            </div>
            <div className="employees__modal-body">
              <p>¿Eliminar a {deleteConfirm.full_name ?? deleteConfirm.name ?? 'este empleado'}?</p>
              <div className="employees__modal-actions">
                <button type="button" className="employees__btn employees__btn--delete" onClick={confirmDelete} disabled={submitLoading}>
                  {submitLoading ? 'Eliminando…' : 'Eliminar'}
                </button>
                <button type="button" className="employees__btn employees__btn--secondary" onClick={() => setDeleteConfirm(null)}>
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

function EmployeeFormModal({
  open,
  onClose,
  form,
  setForm,
  photoFile,
  setPhotoFile,
  deletePhotoFlag,
  setDeletePhotoFlag,
  documentTypes,
  regions,
  provinces,
  districts,
  roles,
  editingId,
  onSubmit,
  loading,
}) {
  if (!open) return null;

  return (
    <div className="employees__modal-overlay" onClick={onClose}>
      <div className="employees__modal employees__modal--form" onClick={(e) => e.stopPropagation()}>
        <div className="employees__modal-header">
          <h3>{editingId ? 'Editar empleado' : 'Crear empleado'}</h3>
          <button type="button" className="employees__modal-close" onClick={onClose}>×</button>
        </div>
        <form className="employees__form" onSubmit={onSubmit}>
          <div className="employees__form-grid">
            <div className="employees__form-group">
              <label>Nombre</label>
              <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="employees__form-group">
              <label>Apellido paterno</label>
              <input type="text" value={form.last_name_paternal} onChange={(e) => setForm((f) => ({ ...f, last_name_paternal: e.target.value }))} required />
            </div>
            <div className="employees__form-group">
              <label>Apellido materno</label>
              <input type="text" value={form.last_name_maternal} onChange={(e) => setForm((f) => ({ ...f, last_name_maternal: e.target.value }))} />
            </div>
            <div className="employees__form-group">
              <label>Tipo de documento</label>
              <select value={form.document_type} onChange={(e) => setForm((f) => ({ ...f, document_type: e.target.value }))} required>
                <option value="">Seleccionar</option>
                {documentTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.name ?? t.document_type ?? t.label ?? `Tipo ${t.id}`}</option>
                ))}
              </select>
            </div>
            <div className="employees__form-group">
              <label>Número de documento</label>
              <input type="text" value={form.document_number} onChange={(e) => setForm((f) => ({ ...f, document_number: e.target.value }))} required />
            </div>
            <div className="employees__form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className="employees__form-group">
              <label>Género</label>
              <select value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>
            <div className="employees__form-group">
              <label>Teléfono</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="employees__form-group">
              <label>Fecha de nacimiento</label>
              <input type="date" value={form.birth_date} onChange={(e) => setForm((f) => ({ ...f, birth_date: e.target.value }))} />
            </div>
            <div className="employees__form-group">
              <label>Región</label>
              <select value={form.region_id} onChange={(e) => { const region = e.target.value; setForm((f) => ({ ...f, region_id: region, province_id: '', district_id: '', })); setProvinces([]);setDistricts([]); }} >
                <option value="">Seleccionar</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>{r.name ?? r.region_name ?? `Región ${r.id}`}</option>
                ))}
              </select>
            </div>
            <div className="employees__form-group">
              <label>Provincia</label>
              <select value={form.province_id} onChange={(e) => setForm((f) => ({ ...f, province_id: e.target.value }))} disabled={!form.region_id}>
                <option value="">Seleccionar</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>{p.name ?? p.province_name ?? `Provincia ${p.id}`}</option>
                ))}
              </select>
            </div>
            <div className="employees__form-group">
              <label>Distrito</label>
              <select value={form.district_id} onChange={(e) => setForm((f) => ({ ...f, district_id: e.target.value }))} disabled={!form.province_id}>
                <option value="">Seleccionar</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>{d.name ?? d.district_name ?? `Distrito ${d.id}`}</option>
                ))}
              </select>
            </div>
            <div className="employees__form-group">
              <label>Rol</label>
              <select value={form.rol} onChange={(e) => setForm((f) => ({ ...f, rol: e.target.value }))} required>
                <option value="">Seleccionar</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name ?? r.rol ?? `Rol ${r.id}`}</option>
                ))}
              </select>
            </div>
            <div className="employees__form-group">
              <label>Salario</label>
              <input type="number" step="0.01" min="0" value={form.salary} onChange={(e) => setForm((f) => ({ ...f, salary: e.target.value }))} />
            </div>
            <div className="employees__form-group employees__form-group--full">
              <label>Dirección</label>
              <input type="text" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="employees__form-group employees__form-group--full">
              <label>Foto</label>
              <input type="file" accept="image/*" onChange={(e) => { setPhotoFile(e.target.files?.[0] || null); setDeletePhotoFlag(false); }} />
              {editingId && (
                <label className="employees__form-check">
                  <input type="checkbox" checked={deletePhotoFlag} onChange={(e) => { setDeletePhotoFlag(e.target.checked); if (e.target.checked) setPhotoFile(null); }} />
                  Eliminar foto actual
                </label>
              )}
            </div>
          </div>
          <div className="employees__form-footer">
            <button type="button" className="employees__btn employees__btn--secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="employees__btn employees__btn--primary" disabled={loading}>
              {loading ? 'Guardando…' : (editingId ? 'Editar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
