# 插件化地址服务使用指南

## 🚀 新特性：插件化架构

基于你的建议，我们重构了项目，现在支持插件化地址服务，开发者可以：
- **避免前端暴露API Key** - 通过后端代理服务
- **自定义后端服务** - 完全控制业务逻辑
- **向后兼容** - 原有API Key方式仍然可用

## 📋 使用方式对比

### 方式1：传统API Key方式（向后兼容）
```tsx
import useGetGeolocation from 'react-exact-geolocation';

const { position, startGeolocation } = useGetGeolocation('your-api-key', {
  mapService: 'amap',
  accuracy: 50,
});
```

### 方式2：插件化后端服务（推荐）
```tsx
import useGetGeolocation from 'react-exact-geolocation';
import { AddressService } from 'react-exact-geolocation/types';

// 自定义服务实现
const myService: AddressService = {
  name: '我的后端服务',
  async getAddress({ longitude, latitude, accuracy, signal }) {
    const response = await fetch('/api/geolocation/reverse', {
      method: 'POST',
      body: JSON.stringify({ longitude, latitude, accuracy }),
      signal,
    });
    
    const data = await response.json();
    return {
      country: data.country,
      province: data.province,
      city: data.city,
      district: data.district,
      township: data.township,
    };
  }
};

const { position, startGeolocation } = useGetGeolocation(myService);
```

### 方式3：通过options配置
```tsx
const { position, startGeolocation } = useGetGeolocation(undefined, {
  addressService: myService,
  accuracy: 50,
});
```

## 🛠️ 服务接口定义

```typescript
interface AddressService {
  name: string;
  getAddress(params: {
    longitude: number;
    latitude: number;
    accuracy: number;
    signal: AbortSignal;
  }): Promise<AddressInfo>;
}

interface AddressInfo {
  country: string | null;
  province: string | null;
  city: string | null;
  district: string | null;
  township: string | null;
}
```

## 📝 示例实现

### 高德地图代理服务
```typescript
class AmapProxyService implements AddressService {
  name = '高德地图代理服务';
  
  constructor(private proxyUrl: string) {}

  async getAddress(params) {
    const response = await fetch(
      `${this.proxyUrl}/regeo?location=${params.longitude},${params.latitude}`,
      { signal: params.signal }
    );
    
    const data = await response.json();
    // 解析高德地图返回数据...
    return data;
  }
}
```

### 自定义业务服务
```typescript
class BusinessGeolocationService implements AddressService {
  name = '业务地理位置服务';
  
  async getAddress(params) {
    // 调用你的业务API
    const response = await fetch('/api/business/geolocation', {
      method: 'POST',
      body: JSON.stringify(params),
      signal: params.signal,
    });
    
    // 处理业务逻辑，如用户权限、区域限制等
    return await response.json();
  }
}
```

## 🔧 测试页面

我们更新了测试页面，现在支持三种模式切换：
1. **传统API Key模式** - 直接使用地图服务API Key
2. **自定义后端服务** - 使用你自己的后端服务
3. **代理服务模式** - 通过后端代理调用地图服务

运行测试：
```bash
npm run test:vite
```

## 🎯 优势对比

| 特性 | 传统方式 | 插件化方式 |
|------|----------|------------|
| API Key安全 | ❌ 前端暴露 | ✅ 后端管理 |
| 业务定制 | ❌ 受限 | ✅ 完全控制 |
| 缓存策略 | ✅ 内置 | ✅ 可自定义 |
| 错误处理 | ✅ 内置 | ✅ 可自定义 |
| 部署灵活性 | ❌ 固定 | ✅ 高度灵活 |

## 🚀 迁移建议

如果你当前使用传统方式，建议逐步迁移：

1. **短期**：继续使用传统API Key方式
2. **中期**：开发后端代理服务，测试插件化接口
3. **长期**：完全迁移到插件化架构，提升安全性

## 📞 技术支持

如有问题或建议，请参考：
- GitHub Issues: [项目地址]
- 文档: [详细API文档]

---

**感谢你的宝贵建议！插件化架构让这个库更加灵活和安全。**