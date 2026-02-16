# Changelog | 更新日志

All notable changes to this project will be documented in this file.

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
