 

import { useState, useEffect, useMemo, useRef } from 'react';
import { useExchangeRates } from '../hooks/useExchangeRates';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { convertCurrency, parseAmount, formatCurrency } from '../utils/currency';
import { debounce } from '../utils/debounce';
import { CurrencySelector } from './CurrencySelector';
import  CURRENCIES_DATA  from '../data/currencies.json';
import type { Currency, CurrencyPair } from '../types';
import './CurrencyConverter.css';

export function CurrencyConverter() {
  const { rates, loading, error, isOnline, cacheTimestamp, refreshRates } = useExchangeRates();
  const [amount, setAmount] = useLocalStorage<string>('currency_amount', '');
  const [pair, setPair] = useLocalStorage<CurrencyPair>('currency_pair', {
    from: 'USD',
    to: 'EUR',
  });

  const [currencies, setCurrencies] = useState<Currency[]>(CURRENCIES_DATA as Currency[]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [displayAmount, setDisplayAmount] = useState(amount);

  useEffect(() => {
    if (!rates?.rates) {
      setCurrencies(CURRENCIES_DATA as Currency[]);
      return;
    }

    const currencyMap = new Map<string, Currency>();

    Object.keys(rates.rates).forEach(code => {
      const currencyFromJSON = CURRENCIES_DATA.find(c => c.code === code);
      currencyMap.set(code, currencyFromJSON || { code, name: code });
    });

    if (!currencyMap.has(rates.base)) {
      const baseCurrency = CURRENCIES_DATA.find(c => c.code === rates.base) || {
        code: rates.base,
        name: rates.base,
      };
      currencyMap.set(rates.base, baseCurrency);
    }

    setCurrencies(Array.from(currencyMap.values()).sort((a, b) => a.code.localeCompare(b.code)));
  }, [rates]);


  const debouncedSetAmountRef = useRef<((value: string) => void) | null>(null);

  useEffect(() => {
    debouncedSetAmountRef.current = debounce((value: string) => {
      setAmount(value);
    }, 250);
  }, [setAmount]);

  useEffect(() => {
    setDisplayAmount(amount);
  }, [amount]);

  const parsedAmount = useMemo(() => parseAmount(displayAmount), [displayAmount]);

  const convertedAmount = useMemo(() => {
    if (!rates || !parsedAmount || parsedAmount <= 0) return 0;
    return convertCurrency(parsedAmount, pair.from, pair.to, rates);
  }, [parsedAmount, pair.from, pair.to, rates]);

  const toCurrency = useMemo(() => {
    return currencies.find(c => c.code === pair.to);
  }, [currencies, pair.to]);

  const formattedResult = useMemo(() => {
    if (convertedAmount === 0) return '0.00';
    const decimals = toCurrency?.decimalDigits ?? 2;
    return formatCurrency(convertedAmount, decimals);
  }, [convertedAmount, toCurrency]);


  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    await refreshRates();
    setIsRefreshing(false);
  };

  const handleSwap = () => {
    setPair({ from: pair.to, to: pair.from });
  };

  const formatCacheDate = (timestamp: number | null) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const exchangeRate = useMemo(() => {
    if (!rates || !rates.rates) return null;
    if (pair.from === pair.to) return 1;
  
    const base = rates.base;
    const fromRate = pair.from === base ? 1 : rates.rates[pair.from];
    const toRate = pair.to === base ? 1 : rates.rates[pair.to];
  
    if (!fromRate || !toRate) return null;
  
    return toRate / fromRate;
  }, [rates, pair.from, pair.to]);

  const inverseRate = useMemo(() => {
    if (!exchangeRate || exchangeRate === 0) return null;
    return 1 / exchangeRate;
  }, [exchangeRate]);

  const displayAmountValue = displayAmount;
  const parsedAmountValue = parsedAmount || 1;

  return (
    <div className="currency-converter">
      <div className="currency-converter-header">
        <h1>Currency converter</h1>
        <p className="currency-converter-subtitle">Get real-time exchange rates</p>
        <div className="currency-converter-status-bar">
          <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`}>
          {isOnline ? <span className="status-icon"><img src="/icons/wifi-on-icon.png" alt="Wi-Fi" /></span> 
          : <span className="status-icon"><img src="/assets/wifi-off-icon.png" alt="Wi-Fi" /></span>}
            {isOnline ? 'Online' : 'Offline'}
          </div>
          {cacheTimestamp && (
            <div className="last-updated">
              <span className="clock-icon"><img src="/icons/clock-icon.png" alt="Wi-Fi" /></span>
              Last updated: {formatCacheDate(cacheTimestamp)}
            </div>
          )}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading || isRefreshing || !isOnline}
            className="refresh-button"
          >
            <span className="refresh-icon"><img src="/icons/refresh.png" alt="Wi-Fi" /></span>
            Refresh rates
          </button>
        </div>
      </div>

      {error && !rates && (
        <div className="currency-converter-error">
          {error}
        </div>
      )}

{ error && (
        <div className="currency-converter-error">
          {error}
        </div>
      )}

      <div className="currency-converter-content">
        <div className="currency-converter-card input-card">

          <div className="currency-converter-amount">
            <label>Amount</label>
            <input
              type="text"
              value={displayAmountValue}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^[\d,.\s]*$/.test(value)) {
                  setDisplayAmount(value);
                  debouncedSetAmountRef.current?.(value);
                }
              }}
            />
          </div>

          <div className="currency-selectors">
            <CurrencySelector
              currencies={currencies}
              selected={pair.from}
              onSelect={(code) => setPair({ ...pair, from: code })}
              label="From"
            />

            <span className='swap-button' onClick={handleSwap } > <img src="/icons/switch-icon.png" alt="Switch" /></span>

            <CurrencySelector
              currencies={currencies}
              selected={pair.to}
              onSelect={(code) => setPair({ ...pair, to: code })}
              label="To"
            />
          </div>
        </div>

        <div className="currency-converter-card result-card">
          <h2 className="card-title">Conversion result</h2>

          <div className="conversion-result-main">
            <div className="result-amount">
              {toCurrency?.symbolNative || toCurrency?.symbol || ''}{formattedResult}
            </div>
            <div className="result-equivalent">
              {parsedAmountValue} {pair.from} =
            </div>
          </div>
          {exchangeRate !== null && inverseRate !== null ? (
            <div className="exchange-rates-details">
              <div className="rate-item">
                <span className="rate-label">Exchange Rate</span>
                <span className="rate-value">
                  1 {pair.from} = {formatCurrency(exchangeRate, 6)} {pair.to}
                </span>
              </div>
              <div className="rate-item">
                <span className="rate-label">Inverse Rate</span>
                <span className="rate-value">
                  1 {pair.to} = {formatCurrency(inverseRate, 6)} {pair.from}
                </span>
              </div>
            </div>
          ) : (
            <div className="currency-converter-error">
              Conversion not available for selected currencies.
            </div>
          )}

          <div className="disclaimer">
            Rates are for informational purposes only and may not reflect real-time market rates.
          </div>
        </div>
      </div>
    </div>
  );
}

