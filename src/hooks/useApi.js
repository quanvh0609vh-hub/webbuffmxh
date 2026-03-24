import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export function useApi(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refetchIndex, setRefetchIndex] = useState(0);

  const refetch = useCallback(() => {
    setRefetchIndex((prev) => prev + 1);
  }, []);

  const method = options.method || 'GET';
  const requestData = options.data || null;

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        const response = await api({
          url,
          method,
          data: requestData,
          params: options.params,
        });
        if (!cancelled) {
          setData(response.data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || err.message || 'An error occurred');
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [url, refetchIndex, method, JSON.stringify(requestData), JSON.stringify(options.params)]);

  return { data, loading, error, refetch };
}

export function useMutation(url, options = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const mutate = useCallback(
    async (mutationData) => {
      setLoading(true);
      setError(null);
      try {
        const method = options.method || 'POST';
        const response = await api({
          url,
          method,
          data: mutationData,
        });
        setData(response.data);
        return { success: true, data: response.data };
      } catch (err) {
        const message = err.response?.data?.message || err.message || 'An error occurred';
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [url, options.method]
  );

  return { mutate, loading, error, data };
}
