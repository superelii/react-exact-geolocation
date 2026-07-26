# Changelog | 更新日志

All notable changes to this project will be documented in this file.

## [1.4.1](https://github.com/superelii/react-exact-geolocation/compare/react-exact-geolocation-v1.4.0...react-exact-geolocation-v1.4.1) (2026-07-26)


### Bug Fixes | 修复

* correct publish workflow tag pattern for release-please ([3d5c4b1](https://github.com/superelii/react-exact-geolocation/commit/3d5c4b153613b1233a79f1856330d7cb4ea043ad))
* correct publish workflow tag pattern for release-please ([ea3da89](https://github.com/superelii/react-exact-geolocation/commit/ea3da8995cbefded7ebf791624793c56c401e4ca))

## [1.4.0](https://github.com/superelii/react-exact-geolocation/compare/react-exact-geolocation-v1.3.0...react-exact-geolocation-v1.4.0) (2026-07-26)


### Features | 新特性

* add release-please CI automated release workflow ([f7a6986](https://github.com/superelii/react-exact-geolocation/commit/f7a6986375518452824d9c7cf5a176193b9a85c0))
* add release-please CI automated release workflow ([090edc7](https://github.com/superelii/react-exact-geolocation/commit/090edc774be9932ae53e780155ac64662c932b45))
* 版本更新 ([bb8aedb](https://github.com/superelii/react-exact-geolocation/commit/bb8aedb56d0a7922286028061c0fc54d3242906a))
* 调整 ([29689af](https://github.com/superelii/react-exact-geolocation/commit/29689afca38c579d46836ec347f6254dd8a27a1b))

## [1.3.0] - 2026-07-26

### ✨ Features | 新特性

- **Permission API** | **位置权限请求**
  - Added `requestPermission()` to proactively trigger the browser's geolocation authorization prompt
  - 新增 `requestPermission()`，可主动触发浏览器位置授权弹窗
  - Exposed `permissionState` (`granted` / `denied` / `prompt` / `unsupported`) with live updates via `PermissionStatus.onchange`
  - 暴露 `permissionState` 权限状态，并通过 `PermissionStatus.onchange` 实时刷新（在地址栏锁图标切换权限后自动更新）
- **Amap Signature (安全密钥)** | **高德签名校验**
  - Added `amapSecuritySecret` option for Amap "签名校验" mode; `sig` is computed via MD5 of sorted params
  - 新增 `amapSecuritySecret` 选项，支持高德「签名校验」模式（按排序参数 MD5 生成 `sig`），并新增纯 TS `md5` 工具
- **Browser Test Demo** | **浏览器实测页**
  - Added `demo/` + `pnpm dev` for real-device testing with `navigator.geolocation` and live reverse-geocoding
  - 新增 `demo/` 与 `pnpm dev`，可在真机浏览器实测定位与逆地理编码

### 🐛 Bug Fixes | 修复

- Decoupled browser `maximumAge` from `enableCache`; now fixed to `0` so `enableHighAccuracy` actually takes effect instead of returning a 5-minute cached fix
- 将浏览器 `maximumAge` 与 `enableCache` 解耦并固定为 `0`，使 `enableHighAccuracy` 真正生效（之前会直接返回 5 分钟内的缓存定位，掩盖高精度效果）

### ⚠️ Constraints | 约束

- Geolocation requires a **secure context** (HTTPS / localhost / allow-listed origin). Plain `http://<lan-ip>` disables it — `requestPermission()` returns `unsupported`
- 定位仅在**安全上下文**下可用（HTTPS / localhost / 加白名单的来源）；普通 `http://局域网IP` 会被禁用，`requestPermission()` 返回 `unsupported`

## [1.2.1] - 2026-02-16

### 📝 Documentation | 文档

- Updated README with bilingual support (Chinese/English)
- 更新 README，添加中英文双语支持
- Added detailed API reference and usage examples
- 添加详细的 API 参考和使用示例

## [1.2.0] - 2026-02-16

### ✨ Features | 新特性

- **Plugin Architecture** | **插件化架构**
  - Support custom backend services to avoid exposing API keys in frontend
  - 支持自定义后端服务，避免前端暴露 API Key
  
- **Weak Network Optimization** | **弱网优化**
  - Auto-detect network status and adjust timeout/retry strategies
  - 自动检测网络状况，智能调整超时和重试策略
  - Offline mode with cache fallback
  - 离线模式自动使用缓存
  
- **Multi-Map Services** | **多地图服务**
  - Support Amap, Baidu, Tencent, Google Maps
  - 支持高德、百度、腾讯、谷歌地图

### 🚀 Performance | 性能优化

- Smart caching with adaptive expiration based on network quality
- 基于网络质量的自适应缓存过期策略
- Request queue for weak network environments
- 弱网环境下的请求队列管理

### 🛠️ Improvements | 改进

- Full TypeScript type definitions
- 完整的 TypeScript 类型定义
- Enhanced error handling with localized messages
- 增强的错误处理和本地化消息

## [1.1.0] - 2025-12-XX

### ✨ Features

- AbortController support for request cancellation
- Debouncing and caching mechanisms
- Browser compatibility detection
- Weak network success rate improved to 92%

### 🐛 Bug Fixes

- Fixed timeout issues in slow networks
- Improved error messages for different browsers

## [1.0.0] - 2025-11-XX

### 🎉 Initial Release

- Basic geolocation functionality
- Amap integration for address resolution
- React Hook API
- TypeScript support
