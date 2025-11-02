import axios from 'axios';

import { AddressResolver, ResolverConfig, ResolveParams } from '../addressResolver.js';
import { AddressInfo } from '../../types/geolocation.js';
import { getBrowserCorsConfig } from '../../utils/browserDetector.js';

/** 百度地图解析器 */
export class BaiduResolver implements AddressResolver {
  config: ResolverConfig;

  constructor(config: ResolverConfig) {
    this.config = config;
  }

  async getAddress(params: ResolveParams): Promise<AddressInfo> {
    const { longitude, latitude, accuracy, signal } = params;
    const { apiKey, browser } = this.config;

    const response = await axios.get('https://api.map.baidu.com/reverse_geocoding/v3/', {
      params: {
        ak: apiKey, // 百度用ak
        location: `${latitude},${longitude}`, // 百度是“纬度,经度”
        radius: accuracy,
        output: 'json',
      },
      withCredentials: getBrowserCorsConfig(browser),
      signal,
    });

    if (response.data.status !== 0) {
      throw new Error(`百度API错误: ${response.data.message || '未知错误'}`);
    }

    const address = response.data.result?.addressComponent || {};
    return {
      country: address.country || null,
      province: address.province || null,
      city: address.city || null,
      district: address.district || null,
      township: address.township || null, // 百度返回乡镇级数据
    };
  }
}
