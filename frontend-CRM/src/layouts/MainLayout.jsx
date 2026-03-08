import { Header, Sidebar } from '../components/layout';
import './MainLayout.css';

/**
 * Layout principal: header + sidebar + contenido (solo para usuarios autenticados)
 */
export function MainLayout({ children }) {
  return (
    <div className="main-layout">
      <Header />
      <div className="main-layout__body">
        <Sidebar />
        <div className="main-layout__content">{children}</div>
      </div>
    </div>
  );
}
