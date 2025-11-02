// src/utils/cache.ts
import { AddressInfo } from '../types/geolocation.js';

/** 通用缓存工具类型 */
export type Cache<T> = {
  get: (key: string) => T | null;
  set: (key: string, data: T) => void;
  clear: () => void;
};

/**
 * 创建带过期时间的缓存实例
 * @param cacheDuration 缓存有效期（毫秒）
 * @returns 缓存操作工具
 */
export const createCache = <T>(cacheDuration: number): Cache<T> => {
  const cache = new Map<string, { data: T; timestamp: number }>();

  return {
    get: key => {
      const cached = cache.get(key);
      if (!cached) return null;
      if (Date.now() - cached.timestamp > cacheDuration) {
        cache.delete(key);
        return null;
      }
      return cached.data;
    },
    set: (key, data) => {
      cache.set(key, { data, timestamp: Date.now() });
    },
    clear: () => cache.clear(),
  };
};

// 定位专用缓存（基于通用缓存工具创建）
export const createPositionCache = (cacheDuration: number = 5 * 60 * 1000) => {
  return createCache<AddressInfo>(cacheDuration);
};
