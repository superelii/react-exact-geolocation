import { AddressInfo } from '../types/geolocation.js';

/** 地址解析服务的通用配置 */
export interface ResolverConfig {
  apiKey: string; // 各平台的API密钥（百度用ak，腾讯用key等，统一用apiKey传入）
  browser: string; // 浏览器类型（用于CORS适配）
}

/** 地址解析请求参数 */
export interface ResolveParams {
  longitude: number; // 经度
  latitude: number; // 纬度
  accuracy: number; // 定位精度
  signal: AbortSignal; // 中断信号
}

/** 通用地址解析接口（所有地图API必须实现此接口） */
export interface AddressResolver {
  config: ResolverConfig; // 配置信息
  getAddress(params: ResolveParams): Promise<AddressInfo>; // 核心方法：经纬度转地址
}
