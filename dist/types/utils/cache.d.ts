import { AddressInfo } from '../types/geolocation.js';
/** 通用缓存工具类型 */
export type Cache<T> = {
    get: (key: string) => T | null;
    set: (key: string, data: T) => void;
    clear: () => void;
};
/**
 * 创建带过期时间的缓存实例
 * @param cacheDuration 缓存有效期（毫秒）
 * @returns 缓存操作工具
 */
export declare const createCache: <T>(cacheDuration: number) => Cache<T>;
export declare const createPositionCache: (cacheDuration?: number) => Cache<AddressInfo>;
