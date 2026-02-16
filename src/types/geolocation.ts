// src/types/geolocation.ts
import { AddressResolver } from '../services/addressResolver.js';

// 新增：支持的语言类型
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

/** 插件化API Key服务接口 */
export interface ApiKeyService {
  /** 服务名称 */
  name: string;
  /** 获取API key的异步方法（后端只返回API key，不处理精度逻辑） */
  getApiKey(): Promise<string>;
  /** 获取服务支持的精度级别 */
  getAccuracyLevel(): 'city' | 'meter';
}

/** 定位配置选项（新增插件化服务配置） */
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
  /** 新增：插件化API Key服务，优先使用此配置 */
  apiKeyService?: ApiKeyService;
  /** 精度级别：city（城市级）或 meter（米级） */
  accuracyLevel?: 'city' | 'meter';
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
