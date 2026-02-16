# React Exact Geolocation

A lightweight React hook for precise geolocation with multi-map service support, caching, and weak network optimization.

## Features

- **🔌 Plugin Architecture** - Support custom backend services to securely manage API keys
- **🌐 Multi-Map Services** - Amap, Baidu, Tencent, Google Maps
- **🚀 Weak Network Optimization** - Auto-detect network and adjust strategies
- **💾 Smart Caching** - Offline support with localStorage caching
- **🛡️ TypeScript** - Full type definitions included
- **⚡ Lightweight** - < 10KB gzipped

## Installation

```bash
npm install react-exact-geolocation
# or
yarn add react-exact-geolocation
```

## Usage

### Basic Usage with API Key

```tsx
import useGetGeolocation from 'react-exact-geolocation';

function LocationComponent() {
  const {
    position,
    city,
    province,
    error,
    loading,
    startGeolocation
  } = useGetGeolocation('YOUR_API_KEY', {
    mapService: 'amap', // 'amap' | 'baidu' | 'tencent' | 'google'
    enableCache: true,
    timeout: 10000,
  });

  return (
    <div>
      <button onClick={startGeolocation} disabled={loading}>
        {loading ? 'Locating...' : 'Get Location'}
      </button>
      
      {error && <p className="error">{error}</p>}
      
      {position && (
        <div className="location-info">
          <p>Latitude: {position.latitude}</p>
          <p>Longitude: {position.longitude}</p>
          <p>Accuracy: {position.accuracy}m</p>
          <p>City: {city}</p>
          <p>Province: {province}</p>
        </div>
      )}
    </div>
  );
}
```

### Plugin Service (Recommended for Production)

```tsx
import useGetGeolocation from 'react-exact-geolocation';

// Define your backend service
const backendService = {
  name: 'My Backend Service',
  
  async getApiKey() {
    // Fetch API key from your backend
    const response = await fetch('/api/geolocation/key');
    if (!response.ok) throw new Error('Failed to get API key');
    const data = await response.json();
    return data.key;
  },
  
  getAccuracyLevel() {
    return 'city'; // 'city' | 'meter'
  }
};

function App() {
  const { position, city, startGeolocation } = useGetGeolocation(
    backendService,
    { mapService: 'amap' }
  );
  
  // ...
}
```

### Optimized Hook for Weak Networks

```tsx
import { useGetGeolocationOptimized } from 'react-exact-geolocation';

function App() {
  const {
    position,
    city,
    networkQuality,    // 'good' | 'poor' | 'offline'
    isOffline,         // boolean
    usingCache,        // boolean
    retryCount,        // number
    startGeolocation,
    refresh,
    clearCache
  } = useGetGeolocationOptimized(backendService);

  return (
    <div>
      {/* Network status indicator */}
      <div className={`network-status ${networkQuality?.type}`}>
        Network: {networkQuality?.type}
        {isOffline && <span> (Offline Mode)</span>}
        {usingCache && <span> (Using Cache)</span>}
      </div>
      
      <button onClick={startGeolocation}>
        Get Location
      </button>
      
      {/* Display location info */}
      {position && (
        <div>
          <p>Lat: {position.latitude}</p>
          <p>Lng: {position.longitude}</p>
          <p>City: {city}</p>
        </div>
      )}
    </div>
  );
}
```

## API Reference

### `useGetGeolocation(apiKeyOrService, options)`

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `apiKeyOrService` | `string \| ApiKeyService` | Yes | API key string or custom service object |
| `options` | `UseGetGeolocationOptions` | No | Configuration options |

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `mapService` | `'amap' \| 'baidu' \| 'tencent' \| 'google'` | `'amap'` | Map service provider |
| `enableCache` | `boolean` | `true` | Enable location caching |
| `timeout` | `number` | `10000` | Geolocation timeout (ms) |
| `maxRetry` | `number` | `2` | Max retry attempts |
| `enableHighAccuracy` | `boolean` | `false` | Enable high accuracy mode |
| `accuracyLevel` | `'city' \| 'meter'` | `'city'` | Required accuracy level |

#### Return Values

| Property | Type | Description |
|----------|------|-------------|
| `position` | `{ latitude: number, longitude: number, accuracy: number } \| null` | Geolocation coordinates |
| `country` | `string \| null` | Country name |
| `province` | `string \| null` | Province/State name |
| `city` | `string \| null` | City name |
| `district` | `string \| null` | District name |
| `error` | `string \| null` | Error message if failed |
| `loading` | `boolean` | Loading state |
| `browser` | `string` | Detected browser name |
| `retryCount` | `number` | Current retry count |
| `startGeolocation` | `() => void` | Function to start geolocation |
| `clearCache` | `() => void` | Function to clear cache |

### `useGetGeolocationOptimized(apiKeyOrService, options)`

Same API as `useGetGeolocation` but with additional features:

#### Additional Return Values

| Property | Type | Description |
|----------|------|-------------|
| `networkQuality` | `{ type: 'good' \| 'poor' \| 'offline', rtt: number, ... } \| null` | Network quality info |
| `isOffline` | `boolean` | Whether currently offline |
| `usingCache` | `boolean` | Whether using cached data |
| `refresh` | `() => Promise<void>` | Refresh location with network check |

## Plugin Service Interface

```typescript
interface ApiKeyService {
  name: string;
  getApiKey(): Promise<string>;
  getAccuracyLevel?(): 'city' | 'meter';
}
```

## Browser Support

- Chrome/Edge (Chromium)
- Firefox
- Safari
- 360 Browser
- QQ Browser
- UC Browser

**Note**: Geolocation API requires HTTPS or localhost environment.

## Network Optimization

The optimized hook automatically adjusts behavior based on network conditions:

| Network | Timeout | Retries | Cache Duration |
|---------|---------|---------|----------------|
| Good | 10s | 2 | 5 minutes |
| Poor | 30s | 1 | 30 minutes |
| Offline | N/A | 0 | 24 hours (from cache) |

## TypeScript

Full TypeScript definitions are included:

```typescript
import useGetGeolocation, { 
  UseGetGeolocationOptions,
  UseGetGeolocationResult,
  ApiKeyService 
} from 'react-exact-geolocation';
```

## License

MIT © [Eli Chen](https://github.com/superelii)
