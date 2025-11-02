import { AddressResolver, ResolverConfig, ResolveParams } from '../addressResolver.js';
import { AddressInfo } from '../../types/geolocation.js';
export declare class BaiduResolver implements AddressResolver {
    config: ResolverConfig;
    constructor(config: ResolverConfig);
    getAddress(params: ResolveParams): Promise<AddressInfo>;
}
