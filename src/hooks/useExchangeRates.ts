import { useState, useEffect, useCallback } from 'react';
import { fetchExchangeRates, getCachedRates, getCacheTimestamp } from '../services/api';
import type { ExchangeRates } from '../types';

export function useExchangeRates() {
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cacheTimestamp, setCacheTimestamp] = useState<number | null>(null);

  const loadRates = useCallback(async (force = false) => {
    const online = navigator.onLine;
    setIsOnline(online);

    const cached = getCachedRates();
    const cachedTimestamp = getCacheTimestamp();

    if (!force && cached) {
      setRates(cached);
      setCacheTimestamp(cachedTimestamp);
      setError(null);
    }

    if (!online) {
      if (cached) {
        setRates(cached);
        setCacheTimestamp(cachedTimestamp);
        setError(
          `Offline: Using cached rates from ${
            cachedTimestamp
              ? new Date(cachedTimestamp).toLocaleString()
              : 'unknown time'
          }`
        );
      } else {
        setRates(null);
        setCacheTimestamp(null);
        setError('Offline and no cached data available');
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const freshRates = await fetchExchangeRates();
      setRates(freshRates);
      setCacheTimestamp(getCacheTimestamp());
      setError(null);
    } catch (err) {
      if (cached) {
        setRates(cached);
        setCacheTimestamp(cachedTimestamp);
        setError(
          `Using cached rates due to network error (${
            cachedTimestamp
              ? new Date(cachedTimestamp).toLocaleString()
              : 'unknown time'
          })`
        );
      } else {
        setRates(null);
        setCacheTimestamp(null);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to fetch exchange rates'
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRates();

    const handleOnline = () => {
      setIsOnline(true);
      loadRates(true); 
    };

    const handleOffline = () => {
      setIsOnline(false);
      loadRates(false); 
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadRates]);

  return {
    rates,
    loading,
    error,
    isOnline,
    cacheTimestamp,
    refreshRates: () => loadRates(true),
  };
}