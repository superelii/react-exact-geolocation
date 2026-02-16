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
export const createPositionCache = (cacheDuration: number = 30 * 60 * 1000) => {
  // 默认30分钟，弱网环境下可延长到数小时
  return createCache<AddressInfo>(cacheDuration);
};

/**
 * 智能缓存策略 - 根据网络状况调整缓存时间
 */
export const createAdaptiveCache = () => {
  const cache = new Map<string, { data: AddressInfo; timestamp: number; networkQuality: string }>();

  return {
    get: (key: string, networkQuality = 'good') => {
      const cached = cache.get(key);
      if (!cached) return null;

      // 根据网络质量动态调整缓存有效期
      const cacheDuration =
        {
          good: 5 * 60 * 1000, // 好网络：5分钟
          poor: 30 * 60 * 1000, // 差网络：30分钟
          offline: 24 * 60 * 60 * 1000, // 离线：24小时
        }[networkQuality] || 5 * 60 * 1000;

      if (Date.now() - cached.timestamp > cacheDuration) {
        cache.delete(key);
        return null;
      }
      return cached.data;
    },
    set: (key: string, data: AddressInfo, networkQuality = 'good') => {
      cache.set(key, { data, timestamp: Date.now(), networkQuality });
    },
    clear: () => cache.clear(),
  };
};
