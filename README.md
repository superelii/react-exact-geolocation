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
| `options.enableHighAccuracy` | `boolean` | `false` | 启用高精度（需设备有 GPS） |
| `options.amapSecuritySecret` | `string` | `undefined` | 高德「签名校验」私钥，仅在开启签名校验时使用 |

#### 返回值

| 属性 | 类型 | 说明 |
|------|------|------|
| `position` | `{ latitude, longitude, accuracy }` | 位置信息 |
| `city` | `string` | 城市名称 |
| `province` | `string` | 省份名称 |
| `error` | `string` | 错误信息 |
| `loading` | `boolean` | 加载状态 |
| `startGeolocation` | `() => void` | 开始定位 |
| `requestPermission` | `() => Promise<'granted' | 'denied' | 'prompt' | 'unsupported'>` | 主动请求位置授权 |
| `permissionState` | `'granted' | 'denied' | 'prompt' | 'unsupported' | null` | 当前位置权限状态 |

#### ⚠️ 约束与注意事项

- **安全上下文**：`navigator.geolocation` 仅在安全上下文可用 —— `https://`、`http://localhost`，或浏览器加白名单的来源。**普通 `http://局域网IP` 会被禁用**，`requestPermission()` 会返回 `unsupported`。手机实测建议：安卓 Chrome 用 `chrome://flags/#unsafely-treat-insecure-origin-as-secure` 加白名单，或用 `adb reverse` 走 `localhost`；iPhone 必须 HTTPS。
- **高德 Key 类型**：逆地理编码用的是高德 **Web 服务** 接口，Key 必须在控制台选「Web服务」类型，否则报 `USERKEY_PLAT_NOMATCH`。
- **安全密钥**：`amapSecuritySecret` 仅在你在高德控制台**开启「签名校验」**时才需要填写；未开启留空即可。
- **高精度生效条件**：`enableHighAccuracy` 只是给浏览器的建议，只有在**有 GPS 的设备（手机）**上才会显著减小 `accuracy`；桌面 WiFi 环境基本不变。
- **坐标说明**：`position` 保存设备实测的 **WGS-84** 原始坐标；传给地图服务做逆地理编码前，库内部会转换到对应坐标系（GCJ-02 / BD-09）。

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
| `options.enableHighAccuracy` | `boolean` | `false` | Enable high accuracy (requires GPS) |
| `options.amapSecuritySecret` | `string` | `undefined` | Amap "签名校验" secret; only when signature verification is enabled |

#### Return Values

| Property | Type | Description |
|------|------|------|
| `position` | `{ latitude, longitude, accuracy }` | Position info |
| `city` | `string` | City name |
| `province` | `string` | Province name |
| `error` | `string` | Error message |
| `loading` | `boolean` | Loading state |
| `startGeolocation` | `() => void` | Start geolocation |
| `requestPermission` | `() => Promise<'granted' | 'denied' | 'prompt' | 'unsupported'>` | Request geolocation permission proactively |
| `permissionState` | `'granted' | 'denied' | 'prompt' | 'unsupported' | null` | Current permission state |

#### ⚠️ Constraints & Notes

- **Secure context**: `navigator.geolocation` only works in a secure context — `https://`, `http://localhost`, or an allow-listed origin. A plain `http://<lan-ip>` is disabled and `requestPermission()` returns `unsupported`. For real-device testing: on Android Chrome use `chrome://flags/#unsafely-treat-insecure-origin-as-secure`, or `adb reverse` to use `localhost`; on iOS Safari HTTPS is required.
- **Amap key type**: reverse-geocoding calls Amap **Web Service** API, so the key must be created as "Web服务" in the console, otherwise `USERKEY_PLAT_NOMATCH` is returned.
- **Security secret**: `amapSecuritySecret` is only needed when you enable "签名校验" in the Amap console; leave it empty otherwise.
- **High accuracy**: `enableHighAccuracy` is only a hint and only reduces `accuracy` noticeably on GPS-capable devices (phones); on desktop Wi-Fi it barely changes.
- **Coordinates**: `position` holds the raw **WGS-84** reading; the library converts to the target system (GCJ-02 / BD-09) before reverse-geocoding.

---

## Changelog | 更新日志

完整变更记录由 [release-it](https://github.com/release-it/release-it) 自动生成并维护在 [CHANGELOG.md](./CHANGELOG.md)。

## Release | 发布

发版采用 Google 官方 [release-please](https://github.com/googleapis/release-please) + GitHub Actions，**CI 全自动**，npm 与 GitHub Release 同步发布。

流程：
1. 提交遵循 [Conventional Commits](https://www.conventionalcommits.org/)（`feat:` / `fix:` / `perf:` 等），推送到 `beta`。
2. `Release Please` workflow 自动打开/更新一个 release PR（含版本号 + CHANGELOG 汇总）。
3. 你 review 并合并该 PR → workflow 自动打 `v{x.y.z}` tag、创建 GitHub Release 并推送 tag。
4. `Publish to npm` workflow 监听到 `v*` tag，自动 `pnpm publish` 到 npm。

所需一次性配置：
- 仓库 **Settings → Secrets and variables → Actions** 添加 `NPM_TOKEN`（npm 账号的 Automation / Publish token）。
- 本地可用 `pnpm release-please` 预览即将生成的 release PR 内容（实际发版仍由 CI 完成）。

> 版本号由 commit 类型自动决定：`fix` → patch，`feat` → minor，含 `BREAKING CHANGE` → major。

---

## License

MIT © [Eli Chen](https://github.com/superelii)
