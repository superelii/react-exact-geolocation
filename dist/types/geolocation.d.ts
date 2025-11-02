import { AddressResolver } from '../services/addressResolver.js';
export type Language = 'zh-CN' | 'en-US';
export interface PositionData {
    latitude: number;
    longitude: number;
    accuracy: number;
}
export interface AddressInfo {
    country: string | null;
    province: string | null;
    city: string | null;
    district: string | null;
    township: string | null;
}
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
export type MapService = 'amap' | 'baidu' | 'tencent' | 'google';
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
export type PositionCache = {
    get: (key: string) => AddressInfo | null;
    set: (key: string, data: AddressInfo) => void;
    clear: () => void;
};
