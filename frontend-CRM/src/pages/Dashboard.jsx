import { useApp } from '../context';
import './Dashboard.css';

export function Dashboard() {
  const { user } = useApp();

  return (
    <main className="dashboard">
      <h1 className="dashboard__title">Dashboard</h1>
      <p className="dashboard__welcome">
        Bienvenido{user?.email ? `, ${user.email}` : ''}. Resumen y métricas del CRM.
      </p>
      <div className="dashboard__cards">
        <div className="dashboard__card">Métricas</div>
        <div className="dashboard__card">Actividad reciente</div>
      </div>
    </main>
  );
}
