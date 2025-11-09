import type { ExchangeRates } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.vatcomply.com/rates';
const CACHE_KEY = 'currency_rates_cache';
const CACHE_DURATION = 5 * 60 * 1000; 

export async function fetchExchangeRates(): Promise<ExchangeRates> {
  try {
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    const rates: ExchangeRates = {
      base: data.base || 'EUR',
      rates: data.rates || {},
      timestamp: data.date ? new Date(data.date).getTime() : Date.now(),
    };
    console.log("DATA_API", data)
    
    if (!rates.rates[rates.base]) {
      rates.rates[rates.base] = 1.0;
    }
    
    const cacheData = {
      ...rates,
      cachedAt: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    
    return rates;
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
    throw error;
  }
}

export function getCachedRates(): ExchangeRates | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const cacheData = JSON.parse(cached);
    const now = Date.now();
    
    if (now - cacheData.cachedAt > CACHE_DURATION) {
      return null;
    }
    
    return {
      base: cacheData.base,
      rates: cacheData.rates,
      timestamp: cacheData.timestamp,
    };
  } catch (error) {
    console.error('Failed to read cache:', error);
    return null;
  }
}

export function getCacheTimestamp(): number | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const cacheData = JSON.parse(cached);
    return cacheData.cachedAt;
  } catch {
    return null;
  }
}

