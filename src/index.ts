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
} from './types/geolocation.js';
