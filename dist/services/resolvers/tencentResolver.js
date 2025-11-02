import axios from 'axios';
import { getBrowserCorsConfig } from '../../utils/browserDetector.js';
export class TencentResolver {
    config;
    constructor(config) {
        this.config = config;
    }
    async getAddress(params) {
        const { longitude, latitude, signal } = params;
        const { apiKey, browser } = this.config;
        const response = await axios.get('https://apis.map.qq.com/ws/geocoder/v1/', {
            params: {
                key: apiKey,
                location: `${latitude},${longitude}`,
                get_poi: 0,
            },
            withCredentials: getBrowserCorsConfig(browser),
            signal,
        });
        if (response.data.status !== 0) {
            throw new Error(`腾讯API错误: ${response.data.message || '未知错误'}`);
        }
        const address = response.data.result?.address_component || {};
        return {
            country: address.nation || null,
            province: address.province || null,
            city: address.city || null,
            district: address.district || null,
            township: address.township || null,
        };
    }
}
