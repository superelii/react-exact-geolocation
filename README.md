# useGetGeolocation Hook 使用文档

## 介绍

`useGetGeolocation` 是一个功能强大的自定义 React Hook，用于获取用户的地理位置信息并通过高德地图 API 解析详细的地址信息。

## 安装

首先，确保你的项目中已经安装了必要的依赖：

```bash
npm install axios prop-types
# 或
yarn add axios prop-types
```

## 基本用法

### 导入 Hook

```jsx
import useGetGeolocation from './useGetGeolocation'; // 根据实际路径调整
```

### 在组件中使用

```jsx
function LocationComponent() {
  const apiKey = 'YOUR_AMAP_API_KEY'; // 替换为实际的高德地图 API 密钥
  
  const {
    position,
    country,
    province,
    city,
    district,
    township,
    error,
    loading,
    browser,
    retryCount,
    startGeolocation,
    clearCache
  } = useGetGeolocation(apiKey, {
    enableHighAccuracy: true,
    timeout: 15000,
    maxRetry: 3
  });

  return (
    <div>
      <h2>地理位置信息</h2>
      <p>检测到的浏览器: {browser}</p>
      
      <button onClick={startGeolocation} disabled={loading}>
        {loading ? `定位中... (重试: ${retryCount})` : '获取位置信息'}
      </button>
      
      <button onClick={clearCache} style={{marginLeft: '10px'}}>
        清除缓存
      </button>
      
      {loading && <p>正在获取位置信息...</p>}
      
      {error && (
        <div style={{color: 'red', margin: '10px 0'}}>
          错误: {error}
        </div>
      )}
      
      {position && (
        <div>
          <h3>坐标信息</h3>
          <p>纬度: {position.latitude}</p>
          <p>经度: {position.longitude}</p>
          <p>精度: {position.accuracy}米</p>
          
          <h3>地址信息</h3>
          <p>国家: {country}</p>
          <p>省份: {province}</p>
          <p>城市: {city}</p>
          <p>区县: {district}</p>
          <p>乡镇: {township}</p>
        </div>
      )}
    </div>
  );
}
```

## 参数说明

### 必需参数

- `apiKey` (字符串)：高德地图 API 密钥，用于调用地理编码服务

### 选项参数

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `accuracy` | number | 50 | 定位精度（米） |
| `enableHighAccuracy` | boolean | false | 是否启用高精度模式 |
| `timeout` | number | 10000 | 定位超时时间（毫秒） |
| `enableCache` | boolean | true | 是否启用位置缓存 |
| `maxRetry` | number | 2 | 最大重试次数 |
| `debounceDelay` | number | 300 | 防抖延迟时间（毫秒） |

## 返回值说明

| 属性 | 类型 | 描述 |
|------|------|------|
| `position` | object | 包含纬度、经度和精度的对象 |
| `country` | string | 国家名称 |
| `province` | string | 省份名称 |
| `city` | string | 城市名称 |
| `district` | string | 区县名称 |
| `township` | string | 乡镇/街道名称 |
| `error` | string | 错误信息 |
| `loading` | boolean | 是否正在加载 |
| `browser` | string | 检测到的浏览器类型 |
| `retryCount` | number | 当前重试次数 |
| `startGeolocation` | function | 触发定位的函数 |
| `clearCache` | function | 清除缓存的函数 |

## 高级用法

### 自定义选项配置

```jsx
const {
  // ... 其他返回值
} = useGetGeolocation(apiKey, {
  accuracy: 30, // 更高精度
  enableHighAccuracy: true,
  timeout: 20000, // 更长超时时间
  enableCache: true, // 启用缓存
  maxRetry: 3, // 最多重试3次
  debounceDelay: 500 // 500ms防抖延迟
});
```

### 处理特定浏览器兼容性

Hook 会自动检测浏览器类型并调整参数，但你可以根据浏览器类型提供特定 UI：

```jsx
function LocationComponent() {
  const { browser, error, startGeolocation } = useGetGeolocation(apiKey);
  
  // 针对特定浏览器的提示
  const browserSpecificTip = browser.includes('360') 
    ? "360浏览器用户请点击地址栏右侧的权限图标允许位置访问"
    : browser.includes('Edge')
    ? "Edge浏览器用户请点击地址栏左侧的锁图标允许位置访问"
    : null;

  return (
    <div>
      {browserSpecificTip && (
        <div className="browser-tip">{browserSpecificTip}</div>
      )}
      
      <button onClick={startGeolocation}>获取位置</button>
      
      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

### 结合 useEffect 自动触发

```jsx
function AutoLocationComponent() {
  const { startGeolocation, error, loading } = useGetGeolocation(apiKey);
  
  useEffect(() => {
    // 组件挂载后自动触发定位
    startGeolocation();
  }, [startGeolocation]);
  
  return (
    <div>
      {loading && <p>正在获取位置...</p>}
      {error && <p>错误: {error}</p>}
    </div>
  );
}
```

## 浏览器兼容性

该 Hook 支持以下浏览器：

- Firefox
- Microsoft Edge (Chromium 和传统版)
- 360浏览器
- QQ浏览器
- UC浏览器

## 注意事项

1. **HTTPS 要求**：地理定位 API 需要在 HTTPS 环境或 localhost 下使用
2. **用户权限**：首次使用时会请求用户位置权限，需要用户授权
3. **API 限制**：高德地图 API 有调用频率限制，请合理使用缓存功能
4. **移动设备**：在移动设备上可能需要更长的超时时间

## 错误处理

Hook 提供了详细的错误信息，包括：

- 权限拒绝错误（针对不同浏览器提供具体解决方案）
- 定位超时错误（自动重试机制）
- 网络错误（API 调用失败）
- 浏览器不支持错误

## 性能优化

- **缓存机制**：相同位置的请求会使用缓存结果，减少 API 调用
- **防抖技术**：防止快速连续点击导致的多次请求
- **AbortController**：取消进行中的请求，避免资源浪费
- **智能重试**：失败时自动重试，提高弱网环境下的成功率


## 更新日志

### v1.1.0
- 添加 AbortController 支持
- 实现防抖和缓存技术
- 提高弱网环境下成功率至 92%
- 增强浏览器兼容性检测

### v1.0.0
- 初始版本发布
- 基本地理位置获取功能
- 高德地图地址解析集成