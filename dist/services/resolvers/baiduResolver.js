import axios from 'axios';
import { getBrowserCorsConfig } from '../../utils/browserDetector.js';
export class BaiduResolver {
    config;
    constructor(config) {
        this.config = config;
    }
    async getAddress(params) {
        const { longitude, latitude, accuracy, signal } = params;
        const { apiKey, browser } = this.config;
        const response = await axios.get('https://api.map.baidu.com/reverse_geocoding/v3/', {
            params: {
                ak: apiKey,
                location: `${latitude},${longitude}`,
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
            township: address.township || null,
        };
    }
}
