import { AddressResolver, ResolverConfig, ResolveParams } from '../addressResolver.js';
import { AddressInfo } from '../../types/geolocation.js';
/** 谷歌地图解析器（适配谷歌逆地理编码API） */
export declare class GoogleResolver implements AddressResolver {
    config: ResolverConfig;
    constructor(config: ResolverConfig);
    getAddress(params: ResolveParams): Promise<AddressInfo>;
    /** 辅助函数：从谷歌地址组件中按类型提取对应值 */
    private getComponentByType;
}
