import { useState, useCallback } from 'react';

/**
 * Hook para sincronizar estado con localStorage
 * @param {string} key - Clave en localStorage
 * @param {*} initialValue - Valor inicial si no existe
 * @returns {[*, function]}
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error('useLocalStorage setValue:', error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}
