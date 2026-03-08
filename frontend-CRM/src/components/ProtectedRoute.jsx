import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context';
import { ROUTES } from '../constants';

/**
 * Protege rutas que requieren autenticación (token 2FA).
 * Redirige a /login si no hay sesión.
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useApp();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return children;
}
