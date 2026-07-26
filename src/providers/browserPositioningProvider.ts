// src/providers/browserPositioningProvider.ts
import type { PositioningProvider } from '../types/geolocation.js';

/** 位置权限状态 */
export type GeolocationPermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported';

/**
 * 主动请求位置权限：
 * 1. 先查询当前权限状态（granted/denied 直接返回）；
 * 2. 若为 prompt，则调用一次 getCurrentPosition 触发浏览器授权弹窗，再根据结果返回。
 * 注意：仅在「安全上下文」下（https 或 localhost，或 http 局域网 IP 已在浏览器加白名单）
 * navigator.geolocation 才可用，否则返回 'unsupported'。
 */
export const requestGeolocationPermission = (): Promise<GeolocationPermissionState> =>
  new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve('unsupported');
      return;
    }
    // 非安全上下文（如 http 局域网 IP）下浏览器会禁用定位：getCurrentPosition 永远被拒、
    // 不弹授权框。提前返回 unsupported，避免误报成 denied。
    if (typeof window !== 'undefined' && 'isSecureContext' in window && !window.isSecureContext) {
      resolve('unsupported');
      return;
    }

    const triggerPrompt = () => {
      navigator.geolocation.getCurrentPosition(
        () => resolve('granted'),
        (err) => {
          // PERMISSION_DENIED = 1；其余（定位失败/超时）不视为拒绝
          if (err.code === 1) resolve('denied');
          else resolve('prompt');
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: Infinity }
      );
    };

    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((status) => {
          if (status.state === 'granted' || status.state === 'denied') {
            resolve(status.state as GeolocationPermissionState);
            return;
          }
          triggerPrompt();
        })
        .catch(triggerPrompt);
    } else {
      triggerPrompt();
    }
  });

export interface BrowserPositioningOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

/**
 * 基于浏览器 HTML5 geolocation 的定位源（默认实现）。
 * 将回调式 getCurrentPosition 封装为 Promise，并尽量尊重 AbortSignal。
 */
export const createBrowserPositioningProvider = (
  options: BrowserPositioningOptions = {}
): PositioningProvider => {
  const { enableHighAccuracy = false, timeout = 10000, maximumAge = 0 } = options;

  return (signal?: AbortSignal) =>
    new Promise((resolve, reject) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        reject(new Error('GEOLOCATION_UNSUPPORTED'));
        return;
      }

      let settled = false;
      const onAbort = () => {
        if (settled) return;
        settled = true;
        signal?.removeEventListener('abort', onAbort);
        reject(new DOMException('Positioning aborted', 'AbortError'));
      };

      if (signal) {
        if (signal.aborted) {
          reject(new DOMException('Positioning aborted', 'AbortError'));
          return;
        }
        signal.addEventListener('abort', onAbort, { once: true });
      }

      navigator.geolocation.getCurrentPosition(
        pos => {
          if (settled) return;
          settled = true;
          signal?.removeEventListener('abort', onAbort);
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
        },
        err => {
          if (settled) return;
          settled = true;
          signal?.removeEventListener('abort', onAbort);
          reject(err);
        },
        { enableHighAccuracy, timeout, maximumAge }
      );
    });
};

/** 默认浏览器定位源实例 */
export const browserPositioningProvider = createBrowserPositioningProvider();
