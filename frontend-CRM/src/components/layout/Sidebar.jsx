import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../constants';
import './Sidebar.css';

const navItems = [
  { to: ROUTES.DASHBOARD, label: 'Dashboard' },
  { to: ROUTES.CONTACTS, label: 'Contactos' },
  { to: ROUTES.DEALS, label: 'Deals' },
  { to: ROUTES.COMPANIES, label: 'Empresas' },
];

export function Sidebar() {
  return (
    <aside className="app-sidebar">
      <nav className="app-sidebar__nav">
        {navItems.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `app-sidebar__link ${isActive ? 'app-sidebar__link--active' : ''}`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
