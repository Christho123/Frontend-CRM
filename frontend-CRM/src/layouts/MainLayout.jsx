import { Sidebar } from '../components/layout';
import { DashboardSectionProvider } from '../context/DashboardSectionContext';
import './MainLayout.css';

/**
 * Layout principal: sidebar fija a la izquierda + contenido (pantalla completa)
 */
export function MainLayout({ children }) {
  return (
    <DashboardSectionProvider>
      <div className="main-layout">
        <Sidebar />
        <div className="main-layout__content">{children}</div>
      </div>
    </DashboardSectionProvider>
  );
}
