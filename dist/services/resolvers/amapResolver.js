import axios from 'axios';
import { getBrowserCorsConfig } from '../../utils/browserDetector.js';
export class AmapResolver {
    config;
    constructor(config) {
        this.config = config;
    }
    async getAddress(params) {
        const { longitude, latitude, accuracy, signal } = params;
        const { apiKey, browser } = this.config;
        const response = await axios.get('https://restapi.amap.com/v3/geocode/regeo', {
            params: {
                key: apiKey,
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
