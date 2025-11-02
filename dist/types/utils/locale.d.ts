import { Language } from '../types/geolocation.js';
/** 多语言文案映射（key：文案标识，value：各语言对应文案） */
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
/**
 * 获取多语言文案
 * @param key 文案标识
 * @param lang 语言类型
 * @param params 文案中的占位符参数（如{browser}、{message}）
 * @returns 格式化后的多语言文案
 */
export declare const getLocaleText: (key: keyof typeof localeMap, lang?: Language, params?: Record<string, string>) => string;
export {};
