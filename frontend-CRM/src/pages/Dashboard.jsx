import { useState, useEffect } from 'react';
import { useApp } from '../context';
import { useDashboardSection } from '../context/DashboardSectionContext';
import { getAnalyticsSummary, getAuditSessions, getAuditUserDetail, getUserProfile } from '../services';
import './Dashboard.css';

function getFullName(profile) {
  const u = profile?.user ?? profile;
  if (!u) return '';
  if (u.full_name && u.full_name !== 'None None' && u.full_name !== 'None None None') {
    return u.full_name.trim();
  }
  const parts = [u.name, u.paternal_lastname, u.maternal_lastname].filter(Boolean);
  if (parts.length) return parts.join(' ').trim();
  return u.user_name || u.email || 'Usuario';
}

function DashboardSection() {
  const { user } = useApp();
  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  const userId = user?.user_id ?? user?.id;

  useEffect(() => {
    if (!userId) return;
    getUserProfile(userId)
      .then(setProfile)
      .catch(() => setProfile(null));
  }, [userId]);

  useEffect(() => {
    getAnalyticsSummary()
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoadingSummary(false));
  }, []);

  const fullName = getFullName(profile) || user?.email || 'Usuario';

  const cards = summary
    ? [
        { label: 'Empleados', value: summary.employees_total ?? 0 },
        { label: 'Usuarios', value: summary.users_total ?? 0 },
        { label: 'Clicks', value: summary.clicks_total ?? 0 },
        { label: 'Clicks productos', value: summary.clicks_products_total ?? 0 },
      ]
    : [];

  return (
    <section className="dashboard__section">
      <header className="dashboard__header">
        <h1 className="dashboard__title">Panel de Resumen</h1>
        <p className="dashboard__welcome">Bienvenido, {fullName.split(' ')[0] || fullName}</p>
      </header>
      <p className="dashboard__session">Sesión iniciada como {user?.email || '—'}</p>

      <div className="dashboard__cards">
        {loadingSummary ? (
          <div className="dashboard__cards-loading">Cargando métricas…</div>
        ) : (
          cards.map((c) => (
            <div key={c.label} className="dashboard__card">
              <span className="dashboard__card-value">{c.value}</span>
              <span className="dashboard__card-label">{c.label}</span>
            </div>
          ))
        )}
      </div>

      <p className="dashboard__2fa-msg">
        Verificación 2FA con envío de código a email exitoso.
      </p>
    </section>
  );
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function AuditoriaSection() {
  const [audits, setAudits] = useState({ results: [], count: 0 });
  const [loadingAudits, setLoadingAudits] = useState(true);
  const [detailUser, setDetailUser] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setLoadingAudits(true);
    getAuditSessions({ page, page_size: pageSize })
      .then((data) => setAudits({ results: data.results || [], count: data.count ?? 0 }))
      .catch(() => setAudits({ results: [], count: 0 }))
      .finally(() => setLoadingAudits(false));
  }, [page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(audits.count / pageSize));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setPage(1);
  };

  const handleVerDetalle = (userId, eventFromRow) => {
    setLoadingDetail(true);
    setDetailUser(null);
    setSelectedEvent(eventFromRow);
    getAuditUserDetail(userId)
      .then(setDetailUser)
      .catch(() => {
        setDetailUser(null);
        setSelectedEvent(null);
      })
      .finally(() => setLoadingDetail(false));
  };

  const handleCerrarDetalle = () => {
    setDetailUser(null);
    setSelectedEvent(null);
  };

  return (
    <section className="dashboard__section">
      <header className="dashboard__header">
        <h1 className="dashboard__title">Auditoría</h1>
      </header>

      {loadingAudits ? (
        <p className="dashboard__loading">Cargando auditoría…</p>
      ) : (
        <div className="dashboard__table-wrap">
          <table className="dashboard__table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Correo</th>
                <th>Acción</th>
                <th>IP</th>
                <th>Fecha/Hora</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {audits.results.length === 0 ? (
                <tr>
                  <td colSpan={6}>No hay registros de auditoría</td>
                </tr>
              ) : (
                audits.results.map((r) => (
                  <tr key={r.id}>
                    <td>{r.full_name || '—'}</td>
                    <td>{r.email || '—'}</td>
                    <td>{r.action || '—'}</td>
                    <td>{r.ip || '—'}</td>
                    <td>
                      {r.datetime
                        ? new Date(r.datetime).toLocaleString('es', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })
                        : '—'}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="dashboard__btn-detalle"
                        onClick={() => handleVerDetalle(r.user_id, r)}
                      >
                        Detalle
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loadingAudits && audits.count > 0 && (
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

      {(detailUser || loadingDetail) && (
        <div className="dashboard__modal-overlay" onClick={handleCerrarDetalle}>
          <div className="dashboard__modal" onClick={(e) => e.stopPropagation()}>
            <div className="dashboard__modal-header">
              <h3>Detalle de usuario</h3>
              <button type="button" className="dashboard__modal-close" onClick={handleCerrarDetalle}>
                ×
              </button>
            </div>
            {loadingDetail ? (
              <div className="dashboard__modal-body">
                <p className="dashboard__modal-loading">Cargando…</p>
              </div>
            ) : detailUser ? (
              <div className="dashboard__modal-body">
                <div className="dashboard__modal-user-wrap">
                  {detailUser.user?.profile_photo_url && (
                    <div className="dashboard__modal-photo">
                      <img src={detailUser.user.profile_photo_url} alt="" />
                    </div>
                  )}
                  <div className="dashboard__modal-fields">
                    <div className="dashboard__modal-field">
                      <span className="dashboard__modal-field-label">Usuario</span>
                      <span className="dashboard__modal-field-value">{detailUser.user?.user_name || '—'}</span>
                    </div>
                    <div className="dashboard__modal-field">
                      <span className="dashboard__modal-field-label">Email</span>
                      <span className="dashboard__modal-field-value">{detailUser.user?.email || '—'}</span>
                    </div>
                    <div className="dashboard__modal-field">
                      <span className="dashboard__modal-field-label">Nombre completo</span>
                      <span className="dashboard__modal-field-value">{detailUser.user?.full_name || '—'}</span>
                    </div>
                    <div className="dashboard__modal-field">
                      <span className="dashboard__modal-field-label">Documento</span>
                      <span className="dashboard__modal-field-value">{detailUser.user?.document_number || '—'}</span>
                    </div>
                    <div className="dashboard__modal-field">
                      <span className="dashboard__modal-field-label">Teléfono</span>
                      <span className="dashboard__modal-field-value">{detailUser.user?.phone || '—'}</span>
                    </div>
                    <div className="dashboard__modal-field">
                      <span className="dashboard__modal-field-label">Estado</span>
                      <span className="dashboard__modal-field-value">{detailUser.user?.is_active ? 'Activo' : 'Inactivo'}</span>
                    </div>
                    <div className="dashboard__modal-field">
                      <span className="dashboard__modal-field-label">Fecha de alta</span>
                      <span className="dashboard__modal-field-value">
                        {detailUser.user?.date_joined
                          ? new Date(detailUser.user.date_joined).toLocaleString('es')
                          : '—'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="dashboard__modal-event-section">
                  <h4 className="dashboard__modal-event-title">Evento de la fila</h4>
                  {selectedEvent ? (
                    <div className="dashboard__modal-event-fields">
                      <div className="dashboard__modal-field">
                        <span className="dashboard__modal-field-label">Acción</span>
                        <span className="dashboard__modal-field-value">{selectedEvent.action || '—'}</span>
                      </div>
                      <div className="dashboard__modal-field">
                        <span className="dashboard__modal-field-label">Fecha y hora</span>
                        <span className="dashboard__modal-field-value">
                          {selectedEvent.datetime
                            ? new Date(selectedEvent.datetime).toLocaleString('es', { dateStyle: 'short', timeStyle: 'short' })
                            : '—'}
                        </span>
                      </div>
                      <div className="dashboard__modal-field">
                        <span className="dashboard__modal-field-label">IP</span>
                        <span className="dashboard__modal-field-value">{selectedEvent.ip || '—'}</span>
                      </div>
                      {selectedEvent.detail != null && (
                        <div className="dashboard__modal-field dashboard__modal-field--full">
                          <span className="dashboard__modal-field-label">Detalle</span>
                          <span className="dashboard__modal-field-value">
                            {typeof selectedEvent.detail === 'object' ? JSON.stringify(selectedEvent.detail) : String(selectedEvent.detail)}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="dashboard__modal-no-event">Sin evento</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}

export function Dashboard() {
  const { section } = useDashboardSection();

  return (
    <main className="dashboard">
      {section === 'auditoria' ? <AuditoriaSection /> : <DashboardSection />}
    </main>
  );
}
