import { useState, useMemo, useRef, useEffect } from 'react';
import type { Currency } from '../types';
import './CurrencySelector.css';

interface CurrencySelectorProps {
  currencies: Currency[];
  selected: string;
  onSelect: (code: string) => void;
  label: string;
}

export function CurrencySelector({ currencies, selected, onSelect, label }: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedCurrency = currencies.find(c => c.code === selected);

  const filteredCurrencies = useMemo(() => {
    if (!search) return currencies;
    const lowerSearch = search.toLowerCase();
    return currencies.filter(
      c =>
        c.code.toLowerCase().includes(lowerSearch) ||
        c.name.toLowerCase().includes(lowerSearch)
    );
  }, [currencies, search]);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (e: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
          setIsOpen(false);
          setSearch('');
        }
      };

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
          setSearch('');
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev =>
        prev < filteredCurrencies.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCurrencies[highlightedIndex]) {
        onSelect(filteredCurrencies[highlightedIndex].code);
        setIsOpen(false);
        setSearch('');
      }
    }
  };

  useEffect(() => {
    if (listRef.current && highlightedIndex >= 0) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [highlightedIndex]);

  const handleSelect = (code: string) => {
    onSelect(code);
    setIsOpen(false);
    setSearch('');
    setHighlightedIndex(0);
  };

  return (
    <div className="currency-selector">
      <label className="currency-selector-label">{label}</label>
      <button
        type="button"
        className="currency-selector-button"
        onClick={() => setIsOpen(true)}
      >
        <div className="currency-selector-icon">
          <span
            className={`currency-selector-symbol ${(selectedCurrency?.symbolNative ||
              selectedCurrency?.symbol ||
              selectedCurrency?.code ||
              '?').length > 2
              ? 'long'
              : ''
              }`}
          >
            {selectedCurrency?.symbolNative ||
              selectedCurrency?.symbol ||
              selectedCurrency?.code ||
              '?'}
          </span>
        </div>
        <div className="currency-selector-info">
          <span className="currency-selector-code">{selectedCurrency?.code || selected}</span>
          <span className="currency-selector-name">
            {selectedCurrency?.name || 'Select currency'}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="currency-modal-overlay">
          <div className="currency-modal" ref={modalRef}>
            <div className="currency-modal-header">
              <h3>Select currancy</h3>
              <button
                type="button"
                className="currency-modal-close"
                onClick={() => {
                  setIsOpen(false);
                  setSearch('');
                }}
              >
                ×
              </button>
            </div>

            <div className="currency-modal-text"> Choose a currency from the list below or use the search bar to find a specific currency. </div>
            <div className="currency-modal-search">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by code or name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="currency-modal-list" ref={listRef}>
              {filteredCurrencies.length === 0 ? (
                <div className="currency-modal-empty">No currencies found</div>
              ) : (
                filteredCurrencies.map((currency, index) => (
                  <div
                    key={currency.code}
                    className={`currency-modal-item ${currency.code === selected ? 'selected' : ''
                      } ${index === highlightedIndex ? 'highlighted' : ''}`}
                    onClick={() => handleSelect(currency.code)}
                  >
                    <div className="currency-modal-item-icon">  <span
                      className={`currency-modal-item-symbol ${(currency.symbolNative || currency.symbol || currency.code || '?').length > 2
                          ? 'long'
                          : ''
                        }`}
                    >
                      {currency.symbolNative || currency.symbol || currency.code || '?'}
                    </span></div>
                    {currency.symbolNative && (
                      <div className='currency-modal-item-info' >
                        <span className="currency-modal-item-code">{currency.code}</span>
                        <span className="currency-modal-item-name">{currency.name}</span>
                      </div>
                    )}

                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

