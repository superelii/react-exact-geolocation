import React, { useState } from 'react';
import useGetGeolocation from '../src/useGetGeolocation.js';
// 导入类型定义，确保类型对齐
import type { MapService, UseGetGeolocationOptions } from '../src/types/geolocation.js';

const TestPage: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  // 显式指定 options 类型为 UseGetGeolocationOptions
  const [options, setOptions] = useState<UseGetGeolocationOptions>({
    accuracy: 50,
    enableHighAccuracy: true,
    timeout: 10000,
    enableCache: false,
    maxRetry: 2,
    debounceDelay: 300,
    mapService: 'amap', // 符合 MapService 类型
    language: 'zh-CN',
  });

  const {
    loading,
    position,
    country,
    province,
    city,
    district,
    township,
    error,
    browser,
    retryCount,
    startGeolocation,
    clearCache,
  } = useGetGeolocation(apiKey, options);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Geolocation 测试页面</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #eee' }}>
        <label>
          地图服务 API Key:
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="请输入高德/百度/腾讯/谷歌地图 API Key"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #eee' }}>
        <h3>定位配置</h3>
        <div style={{ marginBottom: '10px' }}>
          <label>
            <input
              type="checkbox"
              checked={options.enableHighAccuracy}
              onChange={(e) => setOptions({ ...options, enableHighAccuracy: e.target.checked })}
            />
            启用高精度定位
          </label>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>
            超时时间（毫秒）:
            <input
              type="number"
              value={options.timeout}
              onChange={(e) => setOptions({ ...options, timeout: Number(e.target.value) })}
              style={{ width: '100px', marginLeft: '10px' }}
            />
          </label>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>
            定位精度阈值（米）:
            <input
              type="number"
              value={options.accuracy}
              onChange={(e) => setOptions({ ...options, accuracy: Number(e.target.value) })}
              style={{ width: '100px', marginLeft: '10px' }}
            />
          </label>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>
            地图服务:
            <select
              value={options.mapService}
              // 断言为 MapService 类型，避免类型拓宽
              onChange={(e) => setOptions({ ...options, mapService: e.target.value as MapService })}
              style={{ marginLeft: '10px' }}
            >
              <option value="amap">高德地图</option>
              <option value="baidu">百度地图</option>
              <option value="tencent">腾讯地图</option>
              <option value="google">谷歌地图</option>
            </select>
          </label>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>
            <input
              type="checkbox"
              checked={options.enableCache}
              onChange={(e) => setOptions({ ...options, enableCache: e.target.checked })}
            />
            启用定位缓存
          </label>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={startGeolocation}
          disabled={loading || !apiKey}
          style={{
            padding: '8px 16px',
            marginRight: '10px',
            cursor: 'pointer',
            backgroundColor: '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          {loading ? '获取中...' : '获取地理位置'}
        </button>
        <button
          onClick={clearCache}
          disabled={loading}
          style={{
            padding: '8px 16px',
            cursor: 'pointer',
            backgroundColor: '#34a853',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          清除定位缓存
        </button>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #eee' }}>
        <h3>状态信息</h3>
        <div>浏览器: {browser}</div>
        {retryCount > 0 && <div>重试次数: {retryCount}</div>}
      </div>

      {loading && (
        <div style={{ color: '#fbbc05', marginBottom: '20px' }}>
          ⏳ 正在获取地理位置...请确保已授予位置权限
        </div>
      )}

      {error && (
        <div style={{ color: '#ea4335', marginBottom: '20px', padding: '15px', border: '1px solid #f8d7da' }}>
          ❌ 错误: {error}
        </div>
      )}

      {position && (
        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #eee' }}>
          <h3>定位坐标</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(position, null, 2)}
          </pre>
        </div>
      )}

      {(country || province || city || district || township) && (
        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #eee' }}>
          <h3>解析地址</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>
            {JSON.stringify({
              country,
              province,
              city,
              district,
              township,
            }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TestPage;