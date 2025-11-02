import { AddressResolver, ResolverConfig, ResolveParams } from '../addressResolver.js';
import { AddressInfo } from '../../types/geolocation.js';
/** 百度地图解析器 */
export declare class BaiduResolver implements AddressResolver {
    config: ResolverConfig;
    constructor(config: ResolverConfig);
    getAddress(params: ResolveParams): Promise<AddressInfo>;
}
