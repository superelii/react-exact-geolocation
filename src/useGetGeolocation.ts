import { useState, useEffect, useCallback, useRef } from 'react';

import {
  PositionData,
  UseGetGeolocationOptions,
  UseGetGeolocationResult,
  PositionCache,
  ApiKeyService,
  PositioningProvider,
  GeolocationPermissionState,
} from './types/geolocation.js';
import { detectBrowser } from './utils/browserDetector.js';
import { createPositionCache } from './utils/cache.js';
import { AddressResolver, ResolverConfig } from './services/addressResolver.js';
import { AmapResolver } from './services/resolvers/amapResolver.js';
import { BaiduResolver } from './services/resolvers/baiduResolver.js';
import { TencentResolver } from './services/resolvers/tencentResolver.js';
import { GoogleResolver } from './services/resolvers/googleResolver.js';
import { handleMapApiError, handleGeolocationError } from './utils/errorHandler.js';
import { getLocaleText } from './utils/locale.js';
import { getCoordinateTransformForService, CoordinateTransform } from './utils/coordinateTransform.js';
import { createBrowserPositioningProvider, requestGeolocationPermission } from './providers/browserPositioningProvider.js';

const useGetGeolocation = (
  apiKeyOrService?: string | ApiKeyService,
  options: UseGetGeolocationOptions = {}
): UseGetGeolocationResult => {
  const {
    enableHighAccuracy = false,
    timeout = 10000,
    enableCache = true,
    maxRetry = 2,
    debounceDelay = 300,
    mapService = 'amap',
    customResolver,
    positioningProvider,
    apiKeyService,
    amapSecuritySecret,
    coordinateTransform,
    accuracyLevel = 'city',
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
  const [permissionState, setPermissionState] = useState<GeolocationPermissionState | null>(null);

  // 实时监听浏览器位置权限变化（地址栏锁图标里切换允许/拒绝时自动刷新 UI）
  useEffect(() => {
    // 非安全上下文（http 局域网 IP）下定位被禁用，直接标记为 unsupported
    if (typeof window !== 'undefined' && 'isSecureContext' in window && !window.isSecureContext) {
      setPermissionState('unsupported');
      return;
    }
    if (typeof navigator === 'undefined' || !navigator.permissions?.query) return;

    let statusRef: PermissionStatus | null = null;
    const update = (s: PermissionStatus) => setPermissionState(s.state as GeolocationPermissionState);

    navigator.permissions
      .query({ name: 'geolocation' })
      .then((status) => {
        statusRef = status;
        update(status);
        status.onchange = () => update(status);
      })
      .catch(() => {});

    return () => {
      if (statusRef) statusRef.onchange = null;
    };
  }, []);

  // 引用管理
  const positionCache = useRef<PositionCache>(createPositionCache()).current;
  const abortController = useRef<AbortController | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef<boolean>(true);
  const resolver = useRef<AddressResolver | null>(null);
  const service = useRef<ApiKeyService | null>(null);

  // 初始化：检测浏览器 + 初始化服务/解析器
  useEffect(() => {
    const currentBrowser = detectBrowser();
    setBrowser(currentBrowser);

    // 优先使用插件化服务
    if (typeof apiKeyOrService === 'object' && apiKeyOrService !== null && 'getApiKey' in apiKeyOrService) {
      service.current = apiKeyOrService;
    } else if (apiKeyService) {
      service.current = apiKeyService;
    } else if (typeof apiKeyOrService === 'string') {
      // 向后兼容：使用传统解析器
      const resolverConfig: ResolverConfig = {
        apiKey: apiKeyOrService,
        browser: currentBrowser,
        securitySecret: amapSecuritySecret,
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
    }

    return () => {
      isMounted.current = false;
      abortController.current?.abort();
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [apiKeyOrService, mapService, customResolver, apiKeyService, amapSecuritySecret]);

  // 生成缓存键（不变）
  const generateCacheKey = useCallback((latitude: number, longitude: number): string => {
    const lat = latitude.toFixed(4);
    const lng = longitude.toFixed(4);
    return `pos-${lat}-${lng}`;
  }, []);

  // 解析地址信息（支持插件化服务获取API key）
  const getCityInfo = useCallback(
    async (latitude: number, longitude: number, accuracy: number, signal: AbortSignal) => {
      // 检查服务或解析器是否已初始化
      if (!service.current && !resolver.current) {
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
        let addressData;
        let actualApiKey: string;

        // 优先使用插件化服务获取API key
        if (service.current) {
          actualApiKey = await service.current.getApiKey();

          // 使用获取到的API key初始化解析器
          const resolverConfig = {
            apiKey: actualApiKey,
            browser: browser,
            accuracyLevel: accuracyLevel,
            securitySecret: amapSecuritySecret,
          };

          let currentResolver: any;

          // 根据mapService创建对应的解析器
          switch (mapService) {
            case 'baidu':
              currentResolver = new BaiduResolver(resolverConfig);
              break;
            case 'tencent':
              currentResolver = new TencentResolver(resolverConfig);
              break;
            case 'google':
              currentResolver = new GoogleResolver(resolverConfig);
              break;
            default:
              currentResolver = new AmapResolver(resolverConfig);
          }

          // 使用解析器获取地址信息
          addressData = await currentResolver.getAddress({
            longitude,
            latitude,
            accuracy,
            signal,
          });
        } else if (resolver.current) {
          // 向后兼容：使用传统解析器（直接传入API key）
          addressData = await resolver.current.getAddress({
            longitude,
            latitude,
            accuracy,
            signal,
          });
        }

        if (addressData) {
          setCountry(addressData.country);
          setProvince(addressData.province);
          setCity(addressData.city);
          setDistrict(addressData.district);
          setTownship(addressData.township);

          if (enableCache) {
            positionCache.set(cacheKey, addressData);
          }
        }
      } catch (err) {
        // 多语言错误提示
        let errorMsg;
        if (service.current) {
          // 插件化服务错误
          errorMsg = getLocaleText('service_error', lang, { service: service.current.name });
        } else {
          // 传统解析器错误
          errorMsg = handleMapApiError(err, lang, mapService);
        }
        if (errorMsg) setError(errorMsg);
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    },
    [enableCache, positionCache, generateCacheKey, lang, mapService, browser, accuracyLevel, amapSecuritySecret]
  );

  // 开始定位（支持可注入的定位源 + 坐标转换）
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

      // 定位源：优先使用注入的企业级 provider，否则回退浏览器定位
      const provider: PositioningProvider =
        positioningProvider ??
        createBrowserPositioningProvider({
          enableHighAccuracy,
          timeout,
          // 每次获取都重新定位（maximumAge=0），否则浏览器返回 5 分钟内的缓存 fix，
          // 会掩盖 enableHighAccuracy 的效果；地址缓存仍由 enableCache 单独控制。
          maximumAge: 0,
        });

      const attempt = async (attemptIndex = 0) => {
        try {
          const raw = await provider(signal);
          if (signal.aborted) return;

          // 保存设备实测的原始 WGS-84 坐标
          const newPosition: PositionData = {
            latitude: raw.latitude,
            longitude: raw.longitude,
            accuracy: raw.accuracy,
          };
          setPosition(newPosition);

          // 按地图服务做坐标系转换后再逆地理编码
          const transform: CoordinateTransform = coordinateTransform ?? getCoordinateTransformForService(mapService);
          const t = transform(raw.latitude, raw.longitude);

          // 使用真实 GPS 精度作为 radius，而非选项默认值
          getCityInfo(t.lat, t.lng, raw.accuracy, signal);
        } catch (err) {
          if (signal.aborted) return;

          if (attemptIndex < maxRetry) {
            setRetryCount((prev: number) => prev + 1);
            setTimeout(() => attempt(attemptIndex + 1), 1000 * (attemptIndex + 1));
            return;
          }

          // 多语言错误提示：定位失败
          const errorMessage = handleGeolocationError(err, browser, lang);
          setError(errorMessage);
          setLoading(false);
        }
      };

      attempt();
    }, debounceDelay);
  }, [
    browser,
    enableHighAccuracy,
    timeout,
    enableCache,
    maxRetry,
    getCityInfo,
    debounceDelay,
    lang,
    positioningProvider,
    coordinateTransform,
    mapService,
  ]);

  // 主动请求位置权限（触发浏览器授权弹窗）
  const requestPermission = useCallback(async (): Promise<GeolocationPermissionState> => {
    const state = await requestGeolocationPermission();
    setPermissionState(state);
    return state;
  }, []);

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
    requestPermission,
    permissionState,
  };
};

export default useGetGeolocation;
