// src/services/exampleService.ts
import { ApiKeyService } from '../types/geolocation.js';

/**
 * 示例插件化API Key服务
 * 后端只负责返回API Key，不处理精度逻辑
 */
export class ExampleApiKeyService implements ApiKeyService {
  name = '示例后端服务';

  constructor(
    private baseUrl = 'https://api.your-backend.com',
    private accuracyLevel: 'city' | 'meter' = 'city'
  ) {}

  async getApiKey(): Promise<string> {
    try {
      // 调用后端API获取地图服务API Key
      const response = await fetch(`${this.baseUrl}/key`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // 跨域错误检测
        if (response.status === 0) {
          throw new Error(`跨域请求失败: 请检查后端CORS配置或使用相对路径代理`);
        }
        throw new Error(`后端服务错误: ${response.statusText}`);
      }

      const data = await response.json() as { apiKey?: string };

      // 后端返回API Key字符串
      if (data.apiKey && typeof data.apiKey === 'string') {
        return data.apiKey;
      } else {
        throw new Error('后端返回的API Key格式错误');
      }
    } catch (error) {
      // 网络错误处理（包括跨域错误）
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('网络请求失败：请检查后端服务是否启动并配置CORS');
      }
      throw error;
    }
  }

  getAccuracyLevel(): 'city' | 'meter' {
    return this.accuracyLevel;
  }
}

/**
 * 高德地图API Key服务
 * 通过后端动态获取高德地图API Key
 */
export class AmapApiKeyService implements ApiKeyService {
  name = '高德地图API Key服务';

  constructor(
    private proxyUrl = 'https://your-proxy.com/amap',
    private accuracyLevel: 'city' | 'meter' = 'city'
  ) {}

  async getApiKey(): Promise<string> {
    const response = await fetch(`${this.proxyUrl}/key`);

    if (!response.ok) {
      throw new Error(`代理服务错误: ${response.statusText}`);
    }

    const data = await response.json() as { apiKey?: string };

    // 返回高德地图API Key
    if (data.apiKey && typeof data.apiKey === 'string') {
      return data.apiKey;
    } else {
      throw new Error('代理服务返回的API Key格式错误');
    }
  }

  getAccuracyLevel(): 'city' | 'meter' {
    return this.accuracyLevel;
  }
}
