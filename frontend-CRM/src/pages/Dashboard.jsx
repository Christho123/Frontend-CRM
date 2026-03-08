import { useState, useEffect } from 'react';
import { useApp } from '../context';
import { useDashboardSection } from '../context/DashboardSectionContext';
import { getAnalyticsSummary, getAuditSessions, getUserDetail, getUserProfile } from '../services';
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
      <h1 className="dashboard__title">Dashboard</h1>
      <p className="dashboard__welcome">Bienvenido, {fullName}</p>
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

function AuditoriaSection() {
  const [audits, setAudits] = useState({ results: [], count: 0 });
  const [loadingAudits, setLoadingAudits] = useState(true);
  const [detailUser, setDetailUser] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    getAuditSessions()
      .then((data) => setAudits({ results: data.results || [], count: data.count || 0 }))
      .catch(() => setAudits({ results: [], count: 0 }))
      .finally(() => setLoadingAudits(false));
  }, []);

  const handleVerDetalle = (auditUserId) => {
    setLoadingDetail(true);
    setDetailUser(null);
    getUserDetail(auditUserId)
      .then(setDetailUser)
      .catch(() => setDetailUser(null))
      .finally(() => setLoadingDetail(false));
  };

  const handleCerrarDetalle = () => setDetailUser(null);

  return (
    <section className="dashboard__section">
      <h1 className="dashboard__title">Auditoría</h1>

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
                        onClick={() => handleVerDetalle(r.user_id)}
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

      {detailUser && (
        <div className="dashboard__modal-overlay" onClick={handleCerrarDetalle}>
          <div className="dashboard__modal" onClick={(e) => e.stopPropagation()}>
            <div className="dashboard__modal-header">
              <h3>Detalle de usuario</h3>
              <button type="button" className="dashboard__modal-close" onClick={handleCerrarDetalle}>
                ×
              </button>
            </div>
            {loadingDetail ? (
              <p>Cargando…</p>
            ) : (
              <div className="dashboard__modal-body">
                <div className="dashboard__modal-user">
                  <p><strong>Usuario:</strong> {detailUser.user?.user_name}</p>
                  <p><strong>Email:</strong> {detailUser.user?.email}</p>
                  <p><strong>Nombre completo:</strong> {detailUser.user?.full_name || '—'}</p>
                  <p><strong>Documento:</strong> {detailUser.user?.document_number || '—'}</p>
                  <p><strong>Fecha alta:</strong>{' '}
                    {detailUser.user?.date_joined
                      ? new Date(detailUser.user.date_joined).toLocaleString('es')
                      : '—'}
                  </p>
                </div>
                <h4>Eventos</h4>
                <div className="dashboard__modal-events">
                  {(detailUser.events || []).map((ev) => (
                    <div key={ev.id} className="dashboard__modal-event">
                      <span className="dashboard__modal-event-action">{ev.action}</span>
                      <span className="dashboard__modal-event-datetime">
                        {ev.datetime
                          ? new Date(ev.datetime).toLocaleString('es', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })
                          : '—'}
                      </span>
                      {ev.detail && (
                        <span className="dashboard__modal-event-detail">
                          {JSON.stringify(ev.detail)}
                        </span>
                      )}
                    </div>
                  ))}
                  {(detailUser.events || []).length === 0 && <p>Sin eventos</p>}
                </div>
              </div>
            )}
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
