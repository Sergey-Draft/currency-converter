export interface Currency {
  code: string;
  name: string;
  symbol?: string;
  symbolNative?: string;
  decimalDigits?: number;
  rounding?: number;
  namePlural?: string;
  countryCodeISO2?: string;
  flagSrc?: string;
}

export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
}

export interface CurrencyPair {
  from: string;
  to: string;
}

export interface CacheData extends ExchangeRates {
  cachedAt: number;
}

