// src/index.ts
// 导出核心钩子
export { default as useGetGeolocation } from './useGetGeolocation.js';

// 导出类型（方便 TypeScript 用户使用）
export type {
  PositionData,
  AddressInfo,
  UseGetGeolocationOptions,
  UseGetGeolocationResult,
  PositionCache,
  MapService,
  Language,
  CoordinateTransform,
  PositioningResult,
  PositioningProvider,
} from './types/geolocation.js';

// 导出坐标系转换工具（默认 WGS-84→GCJ-02/BD-09，企业可单独使用）
export {
  wgs84ToGcj02,
  gcj02ToWgs84,
  gcj02ToBd09,
  bd09ToGcj02,
  wgs84ToBd09,
  bd09ToWgs84,
  getCoordinateTransformForService,
} from './utils/coordinateTransform.js';

// 导出定位源 provider（默认浏览器定位 + 测试/开发用 fake）
export { createBrowserPositioningProvider, browserPositioningProvider } from './providers/browserPositioningProvider.js';
export { createFakePositioningProvider } from './providers/fakePositioningProvider.js';
