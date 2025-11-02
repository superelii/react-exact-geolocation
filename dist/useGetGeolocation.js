import { useState, useEffect, useCallback, useRef } from 'react';
import { detectBrowser, getBrowserLocationOptions } from './utils/browserDetector.js';
import { createPositionCache } from './utils/cache.js';
import { AmapResolver } from './services/resolvers/amapResolver.js';
import { BaiduResolver } from './services/resolvers/baiduResolver.js';
import { TencentResolver } from './services/resolvers/tencentResolver.js';
import { GoogleResolver } from './services/resolvers/googleResolver.js';
import { handleMapApiError, handleGeolocationError } from './utils/errorHandler.js';
import { getLocaleText } from './utils/locale.js';
const useGetGeolocation = (apiKey, options = {}) => {
    const { accuracy = 50, enableHighAccuracy = false, timeout = 10000, enableCache = true, maxRetry = 2, debounceDelay = 300, mapService = 'amap', customResolver, language: lang = 'zh-CN', } = options;
    const [position, setPosition] = useState(null);
    const [country, setCountry] = useState(null);
    const [province, setProvince] = useState(null);
    const [city, setCity] = useState(null);
    const [district, setDistrict] = useState(null);
    const [township, setTownship] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [browser, setBrowser] = useState('未知');
    const [retryCount, setRetryCount] = useState(0);
    const positionCache = useRef(createPositionCache()).current;
    const abortController = useRef(null);
    const debounceTimer = useRef(null);
    const isMounted = useRef(true);
    const resolver = useRef(null);
    useEffect(() => {
        const currentBrowser = detectBrowser();
        setBrowser(currentBrowser);
        const resolverConfig = {
            apiKey,
            browser: currentBrowser,
        };
        if (customResolver) {
            resolver.current = customResolver;
        }
        else {
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
    const generateCacheKey = useCallback((latitude, longitude) => {
        const lat = latitude.toFixed(4);
        const lng = longitude.toFixed(4);
        return `pos-${lat}-${lng}`;
    }, []);
    const getCityInfo = useCallback(async (latitude, longitude, accuracy, signal) => {
        if (!resolver.current) {
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
        }
        catch (err) {
            const errorMsg = handleMapApiError(err, lang, mapService);
            if (errorMsg)
                setError(errorMsg);
        }
        finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    }, [enableCache, positionCache, generateCacheKey, accuracy, lang, mapService]);
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
                    setError(getLocaleText('geolocation_not_supported', lang, { browser }));
                    setLoading(false);
                    return;
                }
                const locationOptions = getBrowserLocationOptions(browser, {
                    enableHighAccuracy,
                    timeout,
                    maximumAge: enableCache ? 300000 : 0,
                });
                const handleSuccess = (positionData) => {
                    if (signal.aborted)
                        return;
                    const newPosition = {
                        latitude: positionData.coords.latitude,
                        longitude: positionData.coords.longitude,
                        accuracy: positionData.coords.accuracy,
                    };
                    setPosition(newPosition);
                    getCityInfo(newPosition.latitude, newPosition.longitude, accuracy, signal);
                };
                const handleError = (error) => {
                    if (signal.aborted)
                        return;
                    if (attempt < maxRetry) {
                        setRetryCount((prev) => prev + 1);
                        setTimeout(() => attemptGeolocation(attempt + 1), 1000 * (attempt + 1));
                        return;
                    }
                    const errorMessage = handleGeolocationError(error, browser, lang);
                    setError(errorMessage);
                    setLoading(false);
                };
                navigator.geolocation.getCurrentPosition(handleSuccess, handleError, locationOptions);
            };
            attemptGeolocation();
        }, debounceDelay);
    }, [browser, enableHighAccuracy, timeout, enableCache, maxRetry, accuracy, getCityInfo, debounceDelay, lang]);
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
