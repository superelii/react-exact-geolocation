import { Language } from '../types/geolocation.js';
declare const localeMap: {
    geolocation_not_supported: {
        'zh-CN': string;
        'en-US': string;
    };
    resolver_not_initialized: {
        'zh-CN': string;
        'en-US': string;
    };
    permission_denied_360: {
        'zh-CN': string;
        'en-US': string;
    };
    permission_denied_edge: {
        'zh-CN': string;
        'en-US': string;
    };
    permission_denied: {
        'zh-CN': string;
        'en-US': string;
    };
    position_unavailable: {
        'zh-CN': string;
        'en-US': string;
    };
    timeout: {
        'zh-CN': string;
        'en-US': string;
    };
    https_required: {
        'zh-CN': string;
        'en-US': string;
    };
    unknown_error: {
        'zh-CN': string;
        'en-US': string;
    };
    amap_error: {
        'zh-CN': string;
        'en-US': string;
    };
    baidu_error: {
        'zh-CN': string;
        'en-US': string;
    };
    tencent_error: {
        'zh-CN': string;
        'en-US': string;
    };
    address_resolve_failed: {
        'zh-CN': string;
        'en-US': string;
    };
    google_error: {
        'zh-CN': string;
        'en-US': string;
    };
};
export declare const getLocaleText: (key: keyof typeof localeMap, lang?: Language, params?: Record<string, string>) => string;
export {};
