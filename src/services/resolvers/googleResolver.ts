import axios from 'axios';

import { AddressResolver, ResolverConfig, ResolveParams } from '../addressResolver.js';
import { AddressInfo } from '../../types/geolocation.js';
import { getBrowserCorsConfig } from '../../utils/browserDetector.js';

/** 谷歌地图解析器（适配谷歌逆地理编码API） */
export class GoogleResolver implements AddressResolver {
  config: ResolverConfig;

  constructor(config: ResolverConfig) {
    this.config = config;
  }

  async getAddress(params: ResolveParams): Promise<AddressInfo> {
    const { longitude, latitude, signal } = params;
    const { apiKey, browser } = this.config;

    // 谷歌逆地理编码API：https://developers.google.com/maps/documentation/geocoding/requests-reverse-geocoding
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        key: apiKey, // 谷歌API密钥
        latlng: `${latitude},${longitude}`, // 谷歌参数格式：纬度,经度
        language: 'zh-CN', // 谷歌支持多语言，这里默认中文（可后续扩展为配置项）
      },
      withCredentials: getBrowserCorsConfig(browser),
      signal,
    });

    // 谷歌API状态判断：成功为"OK"
    if (response.data.status !== 'OK') {
      throw new Error(`谷歌API错误: ${response.data.error_message || '未知错误'}`);
    }

    // 解析谷歌响应（谷歌返回的是数组，取第一个结果）
    const result = response.data.results[0];
    if (!result) throw new Error('谷歌API未返回地址信息');

    const addressComponents = result.address_components;
    const addressData: AddressInfo = {
      country: this.getComponentByType(addressComponents, 'country'),
      province: this.getComponentByType(addressComponents, 'administrative_area_level_1'), // 省级
      city: this.getComponentByType(addressComponents, 'locality'), // 市级（城市）
      district: this.getComponentByType(addressComponents, 'administrative_area_level_2'), // 区级
      township: this.getComponentByType(addressComponents, 'administrative_area_level_3') || null, // 乡镇级（谷歌部分地区支持）
    };

    return addressData;
  }

  /** 辅助函数：从谷歌地址组件中按类型提取对应值 */
  private getComponentByType(components: Array<{ types: string[]; long_name: string }>, type: string): string | null {
    const component = components.find(item => item.types.includes(type));
    return component ? component.long_name : null;
  }
}
