// src/utils/errorHandler.ts
import axios from 'axios';

import { Language } from '../types/geolocation.js';
import { getLocaleText } from './locale.js';

/**
 * 处理地图API错误（多语言版）
 * @param err 错误对象
 * @param lang 语言类型
 * @param mapService 地图服务类型
 * @returns 格式化的多语言错误信息
 */
export const handleMapApiError = (err: unknown, lang: Language, mapService: string): string => {
  // 取消请求不提示
  if (err && (err as any).__CANCEL__) return '';

  if (axios.isAxiosError(err)) {
    const responseData = err.response?.data || {};
    const info = responseData.info || responseData.message || 'Unknown error';

    // 根据地图服务返回对应API错误文案
    switch (mapService) {
      case 'baidu':
        return getLocaleText('baidu_error', lang, { info });
      case 'tencent':
        return getLocaleText('tencent_error', lang, { info });
      default:
        return getLocaleText('amap_error', lang, { info });
    }
  }

  // 非Axios错误
  const message = err instanceof Error ? err.message : 'Unknown error';
  return getLocaleText('address_resolve_failed', lang, { message });
};

/**
 * 处理浏览器定位错误（多语言版）
 * @param error 定位错误对象
 * @param browser 浏览器类型
 * @param lang 语言类型
 * @returns 格式化的多语言错误信息
 */
export const handleGeolocationError = (error: GeolocationPositionError, browser: string, lang: Language): string => {
  switch (error.code) {
    case 1:
      if (browser.includes('360')) {
        return getLocaleText('permission_denied_360', lang);
      } else if (browser.includes('Edge')) {
        return getLocaleText('permission_denied_edge', lang);
      } else {
        return getLocaleText('permission_denied', lang, { browser });
      }
    case 2:
      return getLocaleText('position_unavailable', lang, { browser });
    case 3:
      return getLocaleText('timeout', lang);
    default:
      if (error.message.includes('HTTPS') || error.message.includes('security')) {
        return getLocaleText('https_required', lang, { browser });
      } else {
        return getLocaleText('unknown_error', lang, { message: error.message });
      }
  }
};
