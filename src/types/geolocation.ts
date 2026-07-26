// src/types/geolocation.ts
import type { AddressResolver } from '../services/addressResolver.js';
import type { GeolocationPermissionState } from '../providers/browserPositioningProvider.js';
export type { AddressResolver, GeolocationPermissionState };

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
  /** 高德「签名校验」模式私钥（安全密钥）；与 mapService='amap' 配合使用 */
  amapSecuritySecret?: string;
  /** 精度级别：city（城市级）或 meter（米级） */
  accuracyLevel?: 'city' | 'meter';
  /** 可注入的定位源（企业可接入 RTK/原生 SDK/WebBluetooth 等），默认回退浏览器定位 */
  positioningProvider?: PositioningProvider;
  /** 自定义坐标系转换（默认按 mapService 内置 WGS-84→GCJ-02/BD-09） */
  coordinateTransform?: CoordinateTransform;
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
  /** 主动请求位置权限（触发浏览器授权弹窗），返回最终权限状态 */
  requestPermission: () => Promise<GeolocationPermissionState>;
  /** 当前位置权限状态：granted / denied / prompt / unsupported / 未查询为 null */
  permissionState: GeolocationPermissionState | null;
}

/** 定位缓存工具类型 */
export type PositionCache = {
  get: (key: string) => AddressInfo | null;
  set: (key: string, data: AddressInfo) => void;
  clear: () => void;
};

/** 坐标系转换函数 */
export type CoordinateTransform = (lat: number, lng: number) => { lat: number; lng: number };

/** 定位源返回的原始坐标（WGS-84） */
export interface PositioningResult {
  latitude: number;
  longitude: number;
  accuracy: number;
}

/**
 * 可注入的定位源：返回 WGS-84 坐标，精度由实现决定。
 * 默认使用浏览器 geolocation；企业可接入 RTK / 原生 SDK / WebBluetooth 接收机等。
 */
export type PositioningProvider = (signal?: AbortSignal) => Promise<PositioningResult>;
