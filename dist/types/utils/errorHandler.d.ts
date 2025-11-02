import { Language } from '../types/geolocation.js';
/**
 * 处理地图API错误（多语言版）
 * @param err 错误对象
 * @param lang 语言类型
 * @param mapService 地图服务类型
 * @returns 格式化的多语言错误信息
 */
export declare const handleMapApiError: (err: unknown, lang: Language, mapService: string) => string;
/**
 * 处理浏览器定位错误（多语言版）
 * @param error 定位错误对象
 * @param browser 浏览器类型
 * @param lang 语言类型
 * @returns 格式化的多语言错误信息
 */
export declare const handleGeolocationError: (error: GeolocationPositionError, browser: string, lang: Language) => string;
