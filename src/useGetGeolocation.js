import { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

const detectBrowser = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('msie') || userAgent.includes('trident/')) {
    return 'Internet Explorer';
  } else if (userAgent.includes('edg') && !userAgent.includes('chrome')) {
    return 'Microsoft Edge';
  } else if (userAgent.includes('chrome') && userAgent.includes('edg')) {
    return 'Microsoft Edge (Chromium)';
  } else if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
    return 'Chrome';
  } else if (userAgent.includes('firefox')) {
    return 'Firefox';
  } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    return 'Safari';
  } else if (userAgent.includes('360se') || userAgent.includes('360ee')) {
    return '360浏览器';
  } else if (userAgent.includes('qqbrowser')) {
    return 'QQ浏览器';
  } else if (userAgent.includes('ubrowser')) {
    return 'UC浏览器';
  } else {
    return '未知浏览器';
  }
};

const createPositionCache = () => {
  const cache = new Map();
  const CACHE_DURATION = 5 * 60 * 1000;
  
  return {
    get: (key) => {
      const cached = cache.get(key);
      if (!cached) return null;
      
      if (Date.now() - cached.timestamp > CACHE_DURATION) {
        cache.delete(key);
        return null;
      }
      
      return cached.data;
    },
    set: (key, data) => {
      cache.set(key, {
        data,
        timestamp: Date.now()
      });
    },
    clear: () => cache.clear()
  };
};

const useGetGeolocation = (apiKey, options = {}) => {
  const {
    accuracy = 50,
    enableHighAccuracy = false,
    timeout = 10000,
    enableCache = true,
    maxRetry = 2,
    debounceDelay = 300
  } = options;

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

  useEffect(() => {
    setBrowser(detectBrowser());
    
    return () => {
      isMounted.current = false;
      if (abortController.current) {
        abortController.current.abort();
      }
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const generateCacheKey = useCallback((latitude, longitude) => {
    const lat = latitude ? latitude.toFixed(4) : 'unknown';
    const lng = longitude ? longitude.toFixed(4) : 'unknown';
    return `pos-${lat}-${lng}`;
  }, []);

  const getCityInfo = useCallback(async (latitude, longitude, accuracy, signal) => {
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
      const response = await axios.get(`https://restapi.amap.com/v3/geocode/regeo`, {
        params: {
          key: apiKey,
          location: `${longitude},${latitude}`,
          radius: accuracy,
          extensions: accuracy > 100 ? 'base' : 'all',
          roadlevel: accuracy < 100 ? 1 : 0,
        },
        withCredentials: ['360浏览器', 'QQ浏览器', 'UC浏览器'].includes(browser),
        signal
      });

      if (signal.aborted) return;

      if (response.data.status !== '1') {
        throw new Error(`高德API错误: ${response.data.info || '未知错误'}`);
      }

      const address = response.data.regeocode?.addressComponent || {};
      const addressData = {
        country: address.country || null,
        province: address.province || null,
        city: address.city || null,
        district: address.district || null,
        township: address.township || null
      };

      setCountry(addressData.country);
      setProvince(addressData.province);
      setCity(addressData.city);
      setDistrict(addressData.district);
      setTownship(addressData.township);

      if (enableCache) {
        positionCache.set(cacheKey, addressData);
      }
    } catch (error) {
      if (axios.isCancel(error)) return;
      
      const errorMessage = error.response 
        ? `地址解析失败: ${error.response.data?.info || error.message}`
        : error.message;
      setError(errorMessage);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [apiKey, browser, enableCache, positionCache, generateCacheKey]);

  const startGeolocation = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
    }
    
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
          setError(`${browser}不支持地理定位功能，请升级浏览器`);
          setLoading(false);
          return;
        }

        const locationOptions = {
          enableHighAccuracy: browser === '360浏览器' ? false : enableHighAccuracy,
          timeout: browser === 'Firefox' ? timeout + 5000 : timeout,
          maximumAge: enableCache ? 300000 : 0
        };

        const handleSuccess = (positionData) => {
          if (signal.aborted) return;
          
          const newPosition = {
            latitude: positionData.coords.latitude,
            longitude: positionData.coords.longitude,
            accuracy: positionData.coords.accuracy
          };
          
          setPosition(newPosition);
          getCityInfo(
            newPosition.latitude,
            newPosition.longitude,
            accuracy,
            signal
          );
        };

        const handleError = (error) => {
          if (signal.aborted) return;
          
          if (attempt < maxRetry) {
            setRetryCount(prev => prev + 1);
            setTimeout(() => attemptGeolocation(attempt + 1), 1000 * (attempt + 1));
            return;
          }
          
          let errorMessage = '';
          switch (error.code) {
            case 1:
              if (browser.includes('360')) {
                errorMessage = `位置访问被拒绝。请点击地址栏右侧"权限"图标，允许位置访问。`;
              } else if (browser.includes('Edge')) {
                errorMessage = `位置访问被拒绝。请点击地址栏左侧"锁"图标，在"位置"中选择"允许"。`;
              } else {
                errorMessage = `位置访问被拒绝。请在${browser}的设置中允许位置访问权限。`;
              }
              break;
            case 2:
              errorMessage = `无法获取位置信息。请确保设备已启用定位功能，且${browser}有权访问。`;
              break;
            case 3:
              errorMessage = '定位超时，请检查网络后重试';
              break;
            default:
              if (error.message.includes('HTTPS') || error.message.includes('security')) {
                errorMessage = `请在HTTPS环境或localhost下使用（${browser}安全限制）`;
              } else {
                errorMessage = `定位失败: ${error.message}`;
              }
          }

          setError(errorMessage);
          setLoading(false);
        };

        navigator.geolocation.getCurrentPosition(
          handleSuccess,
          handleError,
          locationOptions
        );
      };
      
      attemptGeolocation();
    }, debounceDelay);
  }, [apiKey, getCityInfo, accuracy, timeout, enableCache, maxRetry, browser, enableHighAccuracy, debounceDelay]);

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
    clearCache
  };
};

useGetGeolocation.propTypes = {
  apiKey: PropTypes.string.isRequired,
  options: PropTypes.shape({
    accuracy: PropTypes.number,
    enableHighAccuracy: PropTypes.bool,
    timeout: PropTypes.number,
    enableCache: PropTypes.bool,
    maxRetry: PropTypes.number,
    debounceDelay: PropTypes.number
  })
};

useGetGeolocation.defaultProps = {
  options: {}
};

export default useGetGeolocation;