import axios from 'axios';

import { AddressResolver, ResolverConfig, ResolveParams } from '../addressResolver.js';
import { AddressInfo } from '../../types/geolocation.js';
import { getBrowserCorsConfig } from '../../utils/browserDetector.js';
import { md5 } from '../../utils/md5.js';

/** 高德地图解析器 */
export class AmapResolver implements AddressResolver {
  config: ResolverConfig;

  constructor(config: ResolverConfig) {
    this.config = config;
  }

  async getAddress(params: ResolveParams): Promise<AddressInfo> {
    const { longitude, latitude, accuracy, signal } = params;
    const { apiKey, browser, securitySecret } = this.config;

    const requestParams: Record<string, string | number> = {
      key: apiKey, // 高德用key
      location: `${longitude},${latitude}`,
      radius: accuracy,
      extensions: accuracy > 100 ? 'base' : 'all',
    };

    // 高德「签名校验」模式：sig = MD5(排序拼接的所有参数 + 私钥)
    if (securitySecret) {
      const sortedKeys = Object.keys(requestParams).sort();
      const raw = sortedKeys.map((k) => `${k}=${requestParams[k]}`).join('&') + securitySecret;
      requestParams.sig = md5(raw);
    }

    const response = await axios.get('https://restapi.amap.com/v3/geocode/regeo', {
      params: requestParams,
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
