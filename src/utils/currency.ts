/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ExchangeRates } from '../types';

export function convertCurrency(
  amount: number,
  from: string,
  to: string,
  rates: ExchangeRates
): number {
  if (from === to) return amount;
  if (!rates.rates[from] || !rates.rates[to]) return 0;
  
  const fromRate = rates.rates[from];
  const toRate = rates.rates[to];
  
  if (from === rates.base) {
    return amount * toRate;
  }
  if (to === rates.base) {
    return amount / fromRate;
  }
  
  return (amount / fromRate) * toRate;
}

export function formatCurrency(amount: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export function formatCurrencyWithRounding(
  amount: number,
  decimals: number = 2,
  rounding: number = 0
): number {
  if (rounding > 0) {
    return Math.round(amount / rounding) * rounding;
  }
  return amount;
}

export function parseAmount(value: string): number {
  const normalized = value.replace(',', '.');
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

export function formatAmount(value: number): string {
  if (value === 0) return '';
  return value.toString().replace('.', ',');
}

