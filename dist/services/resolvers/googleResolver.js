import axios from 'axios';
import { getBrowserCorsConfig } from '../../utils/browserDetector.js';
export class GoogleResolver {
    config;
    constructor(config) {
        this.config = config;
    }
    async getAddress(params) {
        const { longitude, latitude, signal } = params;
        const { apiKey, browser } = this.config;
        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                key: apiKey,
                latlng: `${latitude},${longitude}`,
                language: 'zh-CN',
            },
            withCredentials: getBrowserCorsConfig(browser),
            signal,
        });
        if (response.data.status !== 'OK') {
            throw new Error(`谷歌API错误: ${response.data.error_message || '未知错误'}`);
        }
        const result = response.data.results[0];
        if (!result)
            throw new Error('谷歌API未返回地址信息');
        const addressComponents = result.address_components;
        const addressData = {
            country: this.getComponentByType(addressComponents, 'country'),
            province: this.getComponentByType(addressComponents, 'administrative_area_level_1'),
            city: this.getComponentByType(addressComponents, 'locality'),
            district: this.getComponentByType(addressComponents, 'administrative_area_level_2'),
            township: this.getComponentByType(addressComponents, 'administrative_area_level_3') || null,
        };
        return addressData;
    }
    getComponentByType(components, type) {
        const component = components.find(item => item.types.includes(type));
        return component ? component.long_name : null;
    }
}
