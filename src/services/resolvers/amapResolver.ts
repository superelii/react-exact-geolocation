import axios from 'axios';

import { AddressResolver, ResolverConfig, ResolveParams } from '../addressResolver.js';
import { AddressInfo } from '../../types/geolocation.js';
import { getBrowserCorsConfig } from '../../utils/browserDetector.js';

/** 高德地图解析器 */
export class AmapResolver implements AddressResolver {
  config: ResolverConfig;

  constructor(config: ResolverConfig) {
    this.config = config;
  }

  async getAddress(params: ResolveParams): Promise<AddressInfo> {
    const { longitude, latitude, accuracy, signal } = params;
    const { apiKey, browser } = this.config;

    const response = await axios.get('https://restapi.amap.com/v3/geocode/regeo', {
      params: {
        key: apiKey, // 高德用key
        location: `${longitude},${latitude}`,
        radius: accuracy,
        extensions: accuracy > 100 ? 'base' : 'all',
      },
      withCredentials: getBrowserCorsConfig(browser),
      signal,
    });

    if (response.data.status !== '1') {
      throw new Error(`高德API错误: ${response.data.info || '未知错误'}`);
    }

    const address = response.data.regeocode?.addressComponent || {};
    return {
      country: address.country || null,
      province: address.province || null,
      city: address.city || null,
      district: address.district || null,
      township: address.township || null,
    };
  }
}
