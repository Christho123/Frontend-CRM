import { useApp } from '../../context';
import { ROUTES } from '../../constants';
import { useNavigate } from 'react-router-dom';
import './Header.css';

export function Header() {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <header className="app-header">
      <div className="app-header__brand">Sistema CRM</div>
      <div className="app-header__user">
        {user?.email && <span className="app-header__email">{user.email}</span>}
        <button type="button" className="app-header__logout" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
