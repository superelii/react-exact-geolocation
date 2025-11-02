import { AddressInfo } from '../types/geolocation.js';
/** 地址解析服务的通用配置 */
export interface ResolverConfig {
    apiKey: string;
    browser: string;
}
/** 地址解析请求参数 */
export interface ResolveParams {
    longitude: number;
    latitude: number;
    accuracy: number;
    signal: AbortSignal;
}
/** 通用地址解析接口（所有地图API必须实现此接口） */
export interface AddressResolver {
    config: ResolverConfig;
    getAddress(params: ResolveParams): Promise<AddressInfo>;
}
