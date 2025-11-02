import { AddressInfo } from '../types/geolocation.js';
export type Cache<T> = {
    get: (key: string) => T | null;
    set: (key: string, data: T) => void;
    clear: () => void;
};
export declare const createCache: <T>(cacheDuration: number) => Cache<T>;
export declare const createPositionCache: (cacheDuration?: number) => Cache<AddressInfo>;
