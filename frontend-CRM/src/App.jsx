import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './layouts';
import { Login, Register, Dashboard, Contacts, Deals, Companies } from './pages';
import { ROUTES } from './constants';
import './App.css';

const ProtectedLayout = ({ children }) => (
  <ProtectedRoute>
    <MainLayout>{children}</MainLayout>
  </ProtectedRoute>
);

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.REGISTER} element={<Register />} />
          <Route path={ROUTES.DASHBOARD} element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
          <Route path={ROUTES.CONTACTS} element={<ProtectedLayout><Contacts /></ProtectedLayout>} />
          <Route path={ROUTES.DEALS} element={<ProtectedLayout><Deals /></ProtectedLayout>} />
          <Route path={ROUTES.COMPANIES} element={<ProtectedLayout><Companies /></ProtectedLayout>} />
          <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
