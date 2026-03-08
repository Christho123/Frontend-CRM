import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para peticiones fetch con estado loading/error/data
 * @param {string} url - URL o null para no ejecutar
 * @param {RequestInit} options - Opciones de fetch
 * @returns {{ data, loading, error, refetch }}
 */
export function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!!url);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(res.statusText);
      const json = await res.json();
      setData(json);
      return json;
    } catch (err) {
      setError(err.message || 'Error en la petición');
    } finally {
      setLoading(false);
    }
  }, [url, JSON.stringify(options)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
