# Currency Converter

A single-page currency converter web application built with React + TypeScript. Convert between currencies using live exchange rates with caching and offline support.

## Features

- Real-time currency conversion with live exchange rates
- Swap currencies with one click
- Offline support with cached rates
- Searchable currency selection modal
- Full keyboard navigation support
- Responsive design (mobile & desktop)
- Remembers last selected currencies and amount
- Manual refresh with debounce
- Optimized with memoization and lazy loading

## Setup

### Prerequisites

- Node.js 18+ 
- Yarn or npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd currencies
```

2. Install dependencies:
```bash
yarn install --ignore-scripts
```

Note: Use `--ignore-scripts` flag to skip postinstall scripts that may cause issues.

3. Create `.env` file (optional):
```bash
cp .env.example .env
```

By default, the app uses VATComply API (free, no key required). To use a different API, update `VITE_API_URL` in `.env`.

4. Start development server:
```bash
yarn dev
```

5. Build for production:
```bash
yarn build
```

## API Configuration

The app supports two exchange rate APIs:

1. **VATComply** (default): `https://api.vatcomply.com/rates`
   - Free, no API key required
   - Base currency: EUR

2. **fxratesapi.com**: `https://api.fxratesapi.com/latest`
   - May require API key
   - Set `VITE_API_URL` and optionally `VITE_API_KEY` in `.env`

## Architecture & Key Decisions

### API Choice
- **VATComply** is used by default as it's free, requires no authentication, and provides reliable rates
- The API service is abstracted, making it easy to switch providers

### Caching Strategy
- Exchange rates are cached in `localStorage` for 5 minutes
- Cache includes rates, base currency, and timestamp
- When offline, the app automatically uses cached data
- Cache expiration triggers automatic refresh when online

### State Management
- React hooks (`useState`, `useEffect`, `useMemo`, `useCallback`) for state management
- Custom hooks (`useExchangeRates`, `useLocalStorage`) for reusable logic
- Memoization to prevent unnecessary re-renders

### Performance Optimizations
- Debounced input handling (250ms) for live conversion updates
- Memoized currency conversion calculations
- Lazy loading of heavy components
- React.memo for component memoization where beneficial

### Formatting
- Supports both "." and "," as decimal separators
- Uses `Intl.NumberFormat` for consistent number formatting
- Currency codes displayed with full names in selection modal

## Project Structure

```
src/
├── components/          # React components
│   ├── CurrencyConverter.tsx
│   ├── CurrencySelector.tsx
│   └── *.css
├── hooks/              # Custom React hooks
│   ├── useExchangeRates.ts
│   └── useLocalStorage.ts
├── services/           # API services
│   └── api.ts
├── types/              # TypeScript types
│   └── index.ts
├── utils/              # Utility functions
│   ├── currency.ts
│   └── debounce.ts
└── App.tsx
```



