import axios from 'axios';

import { AddressResolver, ResolverConfig, ResolveParams } from '../addressResolver.js';
import { AddressInfo } from '../../types/geolocation.js';
import { getBrowserCorsConfig } from '../../utils/browserDetector.js';

/** 腾讯地图解析器 */
export class TencentResolver implements AddressResolver {
  config: ResolverConfig;

  constructor(config: ResolverConfig) {
    this.config = config;
  }

  async getAddress(params: ResolveParams): Promise<AddressInfo> {
    const { longitude, latitude, signal } = params;
    const { apiKey, browser } = this.config;

    const response = await axios.get('https://apis.map.qq.com/ws/geocoder/v1/', {
      params: {
        key: apiKey, // 腾讯用key
        location: `${latitude},${longitude}`, // 腾讯是“纬度,经度”
        get_poi: 0, // 不需要POI
      },
      withCredentials: getBrowserCorsConfig(browser),
      signal,
    });

    if (response.data.status !== 0) {
      throw new Error(`腾讯API错误: ${response.data.message || '未知错误'}`);
    }

    const address = response.data.result?.address_component || {};
    return {
      country: address.nation || null, // 腾讯用nation表示国家
      province: address.province || null,
      city: address.city || null,
      district: address.district || null,
      township: address.township || null,
    };
  }
}
