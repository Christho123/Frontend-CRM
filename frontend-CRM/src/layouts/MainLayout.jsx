import { Sidebar } from '../components/layout';
import { DashboardSectionProvider } from '../context/DashboardSectionContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import './MainLayout.css';

function MainLayoutInner({ children }) {
  const { theme } = useTheme();
  return (
    <div className={`main-layout main-layout--${theme}`}>
      <Sidebar />
      <div className="main-layout__content">{children}</div>
    </div>
  );
}

/**
 * Layout principal: sidebar fija a la izquierda + contenido (pantalla completa)
 */
export function MainLayout({ children }) {
  return (
    <ThemeProvider>
      <DashboardSectionProvider>
        <MainLayoutInner>{children}</MainLayoutInner>
      </DashboardSectionProvider>
    </ThemeProvider>
  );
}
