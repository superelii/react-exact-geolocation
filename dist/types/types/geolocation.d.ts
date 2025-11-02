import { AddressResolver } from '../services/addressResolver.js';
export type Language = 'zh-CN' | 'en-US';
/** 经纬度定位数据 */
export interface PositionData {
    latitude: number;
    longitude: number;
    accuracy: number;
}
/** 地址解析信息 */
export interface AddressInfo {
    country: string | null;
    province: string | null;
    city: string | null;
    district: string | null;
    township: string | null;
}
/** 定位配置选项（新增语言配置） */
export interface UseGetGeolocationOptions {
    accuracy?: number;
    enableHighAccuracy?: boolean;
    timeout?: number;
    enableCache?: boolean;
    maxRetry?: number;
    debounceDelay?: number;
    mapService?: MapService;
    customResolver?: AddressResolver;
    language?: Language;
}
/** 支持的地图服务类型 */
export type MapService = 'amap' | 'baidu' | 'tencent' | 'google';
/** Hook 返回结果类型 */
export interface UseGetGeolocationResult {
    position: PositionData | null;
    country: string | null;
    province: string | null;
    city: string | null;
    district: string | null;
    township: string | null;
    error: string | null;
    loading: boolean;
    browser: string;
    retryCount: number;
    startGeolocation: () => void;
    clearCache: () => void;
}
/** 定位缓存工具类型 */
export type PositionCache = {
    get: (key: string) => AddressInfo | null;
    set: (key: string, data: AddressInfo) => void;
    clear: () => void;
};
