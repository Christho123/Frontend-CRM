import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants';
import { useApp } from '../../context';
import { useDashboardSection } from '../../context/DashboardSectionContext';
import { getUserProfile } from '../../services';
import './Sidebar.css';

const navItems = [
  { to: ROUTES.DASHBOARD, label: 'Dashboard', section: 'dashboard' },
  { to: ROUTES.DASHBOARD, label: 'Auditoría', section: 'auditoria' },
  { to: ROUTES.CONTACTS, label: 'Contactos' },
  { to: ROUTES.DEALS, label: 'Deals' },
  { to: ROUTES.COMPANIES, label: 'Empresas' },
];

function getDisplayName(profile) {
  if (!profile) return '';
  const u = profile.user ?? profile;
  const fn = u?.name || (u?.full_name || '').split(/\s+/)[0];
  const ln = u?.paternal_lastname || (u?.full_name || '').split(/\s+/)[1];
  if (fn && fn !== 'None' && ln && ln !== 'None') return `${fn} ${ln}`.trim();
  if (u?.user_name) return u.user_name;
  return u?.email || '';
}

export function Sidebar() {
  const { user, logout } = useApp();
  const { section, setSection } = useDashboardSection();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const id = user?.user_id ?? user?.id;
    if (!id) return;
    getUserProfile(id)
      .then(setProfile)
      .catch(() => setProfile(null));
  }, [user?.user_id, user?.id]);

  const displayName = getDisplayName(profile);
  const data = profile?.user ?? profile;
  const photoUrl = data?.photo_url ?? data?.photo_url_display ?? data?.profile_photo_url;
  const isDashboard = location.pathname === ROUTES.DASHBOARD;

  const handleSectionClick = (e, item) => {
    if (item.section && item.to === ROUTES.DASHBOARD) {
      e.preventDefault();
      if (location.pathname !== ROUTES.DASHBOARD) {
        navigate(ROUTES.DASHBOARD);
      }
      setSection(item.section);
    }
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const isSectionActive = (item) => {
    if (item.section && item.to === ROUTES.DASHBOARD && isDashboard) {
      return section === item.section;
    }
    return false;
  };

  return (
    <aside className="app-sidebar">
      <div className="app-sidebar__user">
        <div className="app-sidebar__avatar-wrap">
          {photoUrl ? (
            <img src={photoUrl} alt="" className="app-sidebar__avatar" />
          ) : (
            <div className="app-sidebar__avatar-placeholder">
              {(displayName || user?.email || 'U')[0].toUpperCase()}
            </div>
          )}
        </div>
        <p className="app-sidebar__name">{displayName || user?.email || 'Usuario'}</p>
      </div>

      <nav className="app-sidebar__nav">
        {navItems.map((item) => {
          if (item.section && item.to === ROUTES.DASHBOARD) {
            return (
              <button
                key={item.label}
                type="button"
                className={`app-sidebar__link app-sidebar__link--btn ${isSectionActive(item) ? 'app-sidebar__link--active' : ''}`}
                onClick={(e) => handleSectionClick(e, item)}
              >
                {item.label}
              </button>
            );
          }
          return (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `app-sidebar__link ${isActive ? 'app-sidebar__link--active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="app-sidebar__footer">
        <button type="button" className="app-sidebar__logout" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
