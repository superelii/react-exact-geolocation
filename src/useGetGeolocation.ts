import { useState, useEffect, useCallback, useRef } from 'react';

import { PositionData, UseGetGeolocationOptions, UseGetGeolocationResult, PositionCache } from './types/geolocation.js';
import { detectBrowser, getBrowserLocationOptions } from './utils/browserDetector.js';
import { createPositionCache } from './utils/cache.js';
import { AddressResolver, ResolverConfig } from './services/addressResolver.js';
import { AmapResolver } from './services/resolvers/amapResolver.js';
import { BaiduResolver } from './services/resolvers/baiduResolver.js';
import { TencentResolver } from './services/resolvers/tencentResolver.js';
import { GoogleResolver } from './services/resolvers/googleResolver.js';
import { handleMapApiError, handleGeolocationError } from './utils/errorHandler.js';
import { getLocaleText } from './utils/locale.js';

const useGetGeolocation = (apiKey: string, options: UseGetGeolocationOptions = {}): UseGetGeolocationResult => {
  const {
    accuracy = 50,
    enableHighAccuracy = false,
    timeout = 10000,
    enableCache = true,
    maxRetry = 2,
    debounceDelay = 300,
    mapService = 'amap',
    customResolver,
    language: lang = 'zh-CN',
  } = options;

  const [position, setPosition] = useState<PositionData | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [province, setProvince] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [district, setDistrict] = useState<string | null>(null);
  const [township, setTownship] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [browser, setBrowser] = useState<string>('未知');
  const [retryCount, setRetryCount] = useState<number>(0);

  // 引用管理（不变）
  const positionCache = useRef<PositionCache>(createPositionCache()).current;
  const abortController = useRef<AbortController | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef<boolean>(true);
  const resolver = useRef<AddressResolver | null>(null);

  // 初始化：检测浏览器 + 初始化解析器（不变）
  useEffect(() => {
    const currentBrowser = detectBrowser();
    setBrowser(currentBrowser);

    const resolverConfig: ResolverConfig = {
      apiKey,
      browser: currentBrowser,
    };

    if (customResolver) {
      resolver.current = customResolver;
    } else {
      switch (mapService) {
        case 'baidu':
          resolver.current = new BaiduResolver(resolverConfig);
          break;
        case 'tencent':
          resolver.current = new TencentResolver(resolverConfig);
          break;
        case 'google':
          resolver.current = new GoogleResolver(resolverConfig);
          break;
        default:
          resolver.current = new AmapResolver(resolverConfig);
      }
    }

    return () => {
      isMounted.current = false;
      abortController.current?.abort();
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [apiKey, mapService, customResolver]);

  // 生成缓存键（不变）
  const generateCacheKey = useCallback((latitude: number, longitude: number): string => {
    const lat = latitude.toFixed(4);
    const lng = longitude.toFixed(4);
    return `pos-${lat}-${lng}`;
  }, []);

  // 解析地址信息（修改错误处理为多语言）
  const getCityInfo = useCallback(
    async (latitude: number, longitude: number, accuracy: number, signal: AbortSignal) => {
      if (!resolver.current) {
        // 多语言提示：解析器未初始化
        setError(getLocaleText('resolver_not_initialized', lang));
        setLoading(false);
        return;
      }

      const cacheKey = generateCacheKey(latitude, longitude);

      if (enableCache) {
        const cachedData = positionCache.get(cacheKey);
        if (cachedData) {
          setCountry(cachedData.country);
          setProvince(cachedData.province);
          setCity(cachedData.city);
          setDistrict(cachedData.district);
          setTownship(cachedData.township);
          setLoading(false);
          return;
        }
      }

      try {
        const addressData = await resolver.current.getAddress({
          longitude,
          latitude,
          accuracy,
          signal,
        });

        setCountry(addressData.country);
        setProvince(addressData.province);
        setCity(addressData.city);
        setDistrict(addressData.district);
        setTownship(addressData.township);

        if (enableCache) {
          positionCache.set(cacheKey, addressData);
        }
      } catch (err) {
        // 多语言错误提示：地图API错误
        const errorMsg = handleMapApiError(err, lang, mapService);
        if (errorMsg) setError(errorMsg);
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    },
    [enableCache, positionCache, generateCacheKey, accuracy, lang, mapService] // 依赖添加lang和mapService
  );

  // 开始定位（修改错误处理为多语言）
  const startGeolocation = useCallback(() => {
    abortController.current?.abort();
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      abortController.current = new AbortController();
      const signal = abortController.current.signal;

      setError(null);
      setLoading(true);
      setRetryCount(0);

      const attemptGeolocation = (attempt = 0) => {
        if (!navigator.geolocation) {
          // 多语言提示：不支持定位功能
          setError(getLocaleText('geolocation_not_supported', lang, { browser }));
          setLoading(false);
          return;
        }

        const locationOptions = getBrowserLocationOptions(browser, {
          enableHighAccuracy,
          timeout,
          maximumAge: enableCache ? 300000 : 0,
        });

        const handleSuccess = (positionData: GeolocationPosition) => {
          if (signal.aborted) return;

          const newPosition: PositionData = {
            latitude: positionData.coords.latitude,
            longitude: positionData.coords.longitude,
            accuracy: positionData.coords.accuracy,
          };

          setPosition(newPosition);
          getCityInfo(newPosition.latitude, newPosition.longitude, accuracy, signal);
        };

        const handleError = (error: GeolocationPositionError) => {
          if (signal.aborted) return;

          if (attempt < maxRetry) {
            setRetryCount((prev: number) => prev + 1);
            setTimeout(() => attemptGeolocation(attempt + 1), 1000 * (attempt + 1));
            return;
          }

          // 多语言错误提示：定位失败
          const errorMessage = handleGeolocationError(error, browser, lang);
          setError(errorMessage);
          setLoading(false);
        };

        navigator.geolocation.getCurrentPosition(handleSuccess, handleError, locationOptions);
      };

      attemptGeolocation();
    }, debounceDelay);
  }, [browser, enableHighAccuracy, timeout, enableCache, maxRetry, accuracy, getCityInfo, debounceDelay, lang]);

  // 清理缓存（不变）
  const clearCache = useCallback(() => {
    positionCache.clear();
  }, [positionCache]);

  return {
    position,
    country,
    province,
    city,
    district,
    township,
    error,
    loading,
    browser,
    retryCount,
    startGeolocation,
    clearCache,
  };
};

export default useGetGeolocation;
