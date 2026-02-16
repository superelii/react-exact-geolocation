# React Exact Geolocation

<p align="center">
  <b>精确的 React 地理位置 Hook | Precise React Geolocation Hook</b>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/react-exact-geolocation">
    <img src="https://img.shields.io/npm/v/react-exact-geolocation.svg" alt="npm version">
  </a>
  <a href="https://github.com/superelii/react-exact-geolocation/blob/main/LICENSE">
    <img src="https://img.shields.io/npm/l/react-exact-geolocation.svg" alt="license">
  </a>
</p>

[English](#english) | [中文](#中文)

---

<a name="中文"></a>
## 🇨🇳 中文文档

### 特性

- 🔌 **插件化架构** - 支持自定义后端服务，避免前端暴露 API Key
- 🌐 **多地图服务** - 支持高德、百度、腾讯、谷歌地图
- 🚀 **弱网优化** - 自动检测网络状况，智能调整超时和重试策略
- 💾 **智能缓存** - 离线时自动使用缓存数据
- 🛡️ **TypeScript** - 完整的类型支持

### 安装

```bash
npm install react-exact-geolocation
```

### 快速开始

#### 方式一：传统 API Key（简单）

```tsx
import useGetGeolocation from 'react-exact-geolocation';

function App() {
  const { position, city, error, loading, startGeolocation } = useGetGeolocation(
    'YOUR_AMAP_API_KEY',
    { mapService: 'amap' }
  );

  return (
    <div>
      <button onClick={startGeolocation} disabled={loading}>
        {loading ? '定位中...' : '获取位置'}
      </button>
      {error && <p>错误: {error}</p>}
      {position && (
        <div>
          <p>纬度: {position.latitude}</p>
          <p>经度: {position.longitude}</p>
          <p>城市: {city}</p>
        </div>
      )}
    </div>
  );
}
```

#### 方式二：插件化服务（推荐）

```tsx
import useGetGeolocation from 'react-exact-geolocation';

// 自定义后端服务
const backendService = {
  name: '后端API服务',
  async getApiKey() {
    const res = await fetch('/api/location/key');
    const data = await res.json();
    return data.key;
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

#### 方式三：弱网优化版

```tsx
import { useGetGeolocationOptimized } from 'react-exact-geolocation';

function App() {
  const { 
    position, 
    city, 
    networkQuality,  // 网络状态: 'good' | 'poor' | 'offline'
    isOffline,       // 是否离线
    usingCache,      // 是否使用缓存
    startGeolocation 
  } = useGetGeolocationOptimized(backendService);
  // ...
}
```

### API 参考

#### 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `apiKeyOrService` | `string \| ApiKeyService` | - | API Key 或自定义服务 |
| `options.mapService` | `'amap' \| 'baidu' \| 'tencent' \| 'google'` | `'amap'` | 地图服务 |
| `options.enableCache` | `boolean` | `true` | 启用缓存 |
| `options.timeout` | `number` | `10000` | 超时时间(ms) |
| `options.maxRetry` | `number` | `2` | 最大重试次数 |

#### 返回值

| 属性 | 类型 | 说明 |
|------|------|------|
| `position` | `{ latitude, longitude, accuracy }` | 位置信息 |
| `city` | `string` | 城市名称 |
| `province` | `string` | 省份名称 |
| `error` | `string` | 错误信息 |
| `loading` | `boolean` | 加载状态 |
| `startGeolocation` | `() => void` | 开始定位 |

---

<a name="english"></a>
## 🇺🇸 English Documentation

### Features

- 🔌 **Plugin Architecture** - Support custom backend services to avoid exposing API keys in frontend
- 🌐 **Multi-map Services** - Support Amap, Baidu, Tencent, Google Maps
- 🚀 **Weak Network Optimization** - Auto-detect network status and intelligently adjust timeout & retry strategies
- 💾 **Smart Caching** - Automatically use cached data when offline
- 🛡️ **TypeScript** - Complete type support

### Installation

```bash
npm install react-exact-geolocation
```

### Quick Start

#### Method 1: Traditional API Key (Simple)

```tsx
import useGetGeolocation from 'react-exact-geolocation';

function App() {
  const { position, city, error, loading, startGeolocation } = useGetGeolocation(
    'YOUR_AMAP_API_KEY',
    { mapService: 'amap' }
  );

  return (
    <div>
      <button onClick={startGeolocation} disabled={loading}>
        {loading ? 'Locating...' : 'Get Location'}
      </button>
      {error && <p>Error: {error}</p>}
      {position && (
        <div>
          <p>Latitude: {position.latitude}</p>
          <p>Longitude: {position.longitude}</p>
          <p>City: {city}</p>
        </div>
      )}
    </div>
  );
}
```

#### Method 2: Plugin Service (Recommended)

```tsx
import useGetGeolocation from 'react-exact-geolocation';

// Custom backend service
const backendService = {
  name: 'Backend API Service',
  async getApiKey() {
    const res = await fetch('/api/location/key');
    const data = await res.json();
    return data.key;
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

#### Method 3: Optimized for Weak Networks

```tsx
import { useGetGeolocationOptimized } from 'react-exact-geolocation';

function App() {
  const { 
    position, 
    city, 
    networkQuality,  // Network status: 'good' | 'poor' | 'offline'
    isOffline,       // Is offline
    usingCache,      // Is using cache
    startGeolocation 
  } = useGetGeolocationOptimized(backendService);
  // ...
}
```

### API Reference

#### Parameters

| Parameter | Type | Default | Description |
|------|------|--------|------|
| `apiKeyOrService` | `string \| ApiKeyService` | - | API Key or custom service |
| `options.mapService` | `'amap' \| 'baidu' \| 'tencent' \| 'google'` | `'amap'` | Map service |
| `options.enableCache` | `boolean` | `true` | Enable cache |
| `options.timeout` | `number` | `10000` | Timeout (ms) |
| `options.maxRetry` | `number` | `2` | Max retry count |

#### Return Values

| Property | Type | Description |
|------|------|------|
| `position` | `{ latitude, longitude, accuracy }` | Position info |
| `city` | `string` | City name |
| `province` | `string` | Province name |
| `error` | `string` | Error message |
| `loading` | `boolean` | Loading state |
| `startGeolocation` | `() => void` | Start geolocation |

---

## Changelog

### v1.2.1
- 📝 Updated documentation with bilingual support
- ✨ Plugin architecture support
- 🚀 Weak network optimization
- 💾 Smart caching for offline mode
- 🌐 Multi-map service support

### v1.1.0
- ✨ AbortController support
- 💾 Caching and debouncing
- 🚀 Improved weak network success rate to 92%

### v1.0.0
- 🎉 Initial release
- 📍 Basic geolocation functionality
- 🗺️ Amap integration

---

## License

MIT © [Eli Chen](https://github.com/superelii)
