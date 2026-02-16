import { useState, useEffect, useCallback } from 'react';

import useGetGeolocation from './useGetGeolocation.js';
import { detectNetworkQuality, watchNetworkStatus } from './utils/networkDetector.js';
import { NetworkQuality } from './utils/networkDetector.js';

/**
 * 弱网优化的地理位置Hook
 * 自动检测网络状况并调整策略
 */
export const useGetGeolocationOptimized = (apiKeyOrService?: string | any, options: any = {}) => {
  const [networkQuality, setNetworkQuality] = useState<NetworkQuality | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [usingCache, setUsingCache] = useState(false);

  // 检测网络状况
  useEffect(() => {
    const checkNetwork = async () => {
      const quality = await detectNetworkQuality();
      setNetworkQuality(quality);
      setIsOffline(quality.type === 'offline');
    };

    checkNetwork();

    // 监听网络变化
    const cleanup = watchNetworkStatus(quality => {
      setNetworkQuality(quality);
      setIsOffline(quality.type === 'offline');
    });

    return cleanup;
  }, []);

  // 根据网络质量调整配置
  const optimizedOptions = useCallback(() => {
    if (!networkQuality) return options;

    const baseTimeout = options.timeout || 10000;
    const baseRetry = options.maxRetry || 2;

    return {
      ...options,
      // 弱网环境下增加超时时间
      timeout: networkQuality.type === 'poor' ? Math.max(baseTimeout, 30000) : baseTimeout,
      // 弱网环境下减少重试次数，避免浪费资源
      maxRetry: networkQuality.type === 'poor' ? Math.min(baseRetry, 1) : baseRetry,
      // 弱网环境下强制启用缓存
      enableCache: true,
      // 弱网环境下降低精度要求（更快获取）
      enableHighAccuracy: networkQuality.type === 'good' ? options.enableHighAccuracy : false,
      // 使用缓存的位置数据（5分钟内）
      maximumAge: networkQuality.type === 'poor' ? 300000 : 0,
    };
  }, [networkQuality, options]);

  // 使用基础Hook
  const geolocationResult = useGetGeolocation(apiKeyOrService, optimizedOptions());

  // 离线模式下使用缓存数据
  useEffect(() => {
    // 使用 requestAnimationFrame 避免同步 setState
    const timer = requestAnimationFrame(() => {
      if (isOffline && !geolocationResult.position) {
        setUsingCache(true);
        // 这里可以从localStorage读取缓存的位置
        const cachedPosition = localStorage.getItem('lastKnownPosition');
        if (cachedPosition) {
          try {
            const parsed = JSON.parse(cachedPosition);
            // 通知用户正在使用缓存
            // eslint-disable-next-line no-console
            console.log('使用缓存的位置数据:', parsed);
          } catch {
            console.error('解析缓存位置失败');
          }
        }
      } else {
        setUsingCache(false);
      }
    });

    return () => cancelAnimationFrame(timer);
  }, [isOffline, geolocationResult.position]);

  // 保存位置到缓存
  useEffect(() => {
    if (geolocationResult.position) {
      localStorage.setItem(
        'lastKnownPosition',
        JSON.stringify({
          position: geolocationResult.position,
          city: geolocationResult.city,
          timestamp: Date.now(),
        })
      );
    }
  }, [geolocationResult.position, geolocationResult.city]);

  return {
    ...geolocationResult,
    networkQuality,
    isOffline,
    usingCache,
    // 提供手动刷新方法（考虑网络状况）
    refresh: useCallback(async () => {
      const quality = await detectNetworkQuality();
      setNetworkQuality(quality);

      if (quality.type === 'offline') {
        console.warn('当前处于离线状态，无法刷新位置');
        return;
      }

      geolocationResult.startGeolocation();
    }, [geolocationResult]),
  };
};

export default useGetGeolocationOptimized;
