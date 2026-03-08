import { createContext, useContext, useState, useCallback } from 'react';

const DashboardSectionContext = createContext(null);

export function DashboardSectionProvider({ children }) {
  const [section, setSection] = useState('dashboard');

  const value = {
    section,
    setSection,
  };

  return (
    <DashboardSectionContext.Provider value={value}>
      {children}
    </DashboardSectionContext.Provider>
  );
}

export function useDashboardSection() {
  const ctx = useContext(DashboardSectionContext);
  return ctx || { section: 'dashboard', setSection: () => {} };
}
