import { AddressResolver, ResolverConfig, ResolveParams } from '../addressResolver.js';
import { AddressInfo } from '../../types/geolocation.js';
/** 高德地图解析器 */
export declare class AmapResolver implements AddressResolver {
    config: ResolverConfig;
    constructor(config: ResolverConfig);
    getAddress(params: ResolveParams): Promise<AddressInfo>;
}
