/**
 * 网络状况检测工具
 * 用于检测当前网络质量，优化地理位置获取策略
 */

export interface NetworkQuality {
  type: 'good' | 'poor' | 'offline';
  rtt: number;
  downlink: number;
  effectiveType: string;
}

/**
 * 检测网络状况
 */
export const detectNetworkQuality = async (testUrl?: string): Promise<NetworkQuality> => {
  // 使用 Navigator.connection API (如果可用)
  const connection =
    (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

  if (connection) {
    const { effectiveType, downlink, rtt } = connection;

    // 根据网络类型判断质量
    let quality: 'good' | 'poor' | 'offline' = 'good';

    if (!(navigator as any).onLine) {
      quality = 'offline';
    } else if (effectiveType === '2g' || effectiveType === 'slow-2g' || downlink < 0.5) {
      quality = 'poor';
    } else if (effectiveType === '3g' && downlink < 1) {
      quality = 'poor';
    }

    return {
      type: quality,
      rtt: rtt || 0,
      downlink: downlink || 0,
      effectiveType: effectiveType || 'unknown',
    };
  }

  // 未提供探测地址时，仅依据 online 状态给出默认结果（避免对外部地址的强依赖，国内更友好）
  if (!testUrl) {
    return {
      type: (navigator as any).onLine === false ? 'offline' : 'good',
      rtt: 0,
      downlink: 0,
      effectiveType: 'unknown',
    };
  }

  // 通过实际请求测试网络质量
  return await testNetworkQuality(testUrl);
};

/**
 * 通过实际请求测试网络质量
 */
const testNetworkQuality = async (testUrl: string): Promise<NetworkQuality> => {
  const url = testUrl || 'https://www.google.com/generate_204'; // 204 No Content，快速响应
  const startTime = performance.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // 发送测试请求
    await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const endTime = performance.now();
    const rtt = endTime - startTime;

    let quality: 'good' | 'poor' | 'offline' = 'good';

    if (!(navigator as any).onLine) {
      quality = 'offline';
    } else if (rtt > 1000) {
      quality = 'poor';
    } else if (rtt > 300) {
      quality = 'poor';
    }

    return {
      type: quality,
      rtt,
      downlink: 0,
      effectiveType: 'unknown',
    };
  } catch {
    return {
      type: (navigator as any).onLine ? 'poor' : 'offline',
      rtt: 9999,
      downlink: 0,
      effectiveType: 'unknown',
    };
  }
};

/**
 * 根据网络质量获取推荐的超时时间
 */
export const getRecommendedTimeout = (networkQuality: NetworkQuality): number => {
  switch (networkQuality.type) {
    case 'offline':
      return 0; // 离线时不尝试请求
    case 'poor':
      return 30000; // 弱网：30秒超时
    case 'good':
    default:
      return 10000; // 正常：10秒超时
  }
};

/**
 * 根据网络质量获取推荐的重试次数
 */
export const getRecommendedRetryCount = (networkQuality: NetworkQuality): number => {
  switch (networkQuality.type) {
    case 'offline':
      return 0;
    case 'poor':
      return 1; // 弱网只重试1次，避免浪费资源
    case 'good':
    default:
      return 2; // 正常网络重试2次
  }
};

/**
 * 监听网络状态变化
 */
export const watchNetworkStatus = (
  onChange: (quality: NetworkQuality) => void,
  testUrl?: string
): (() => void) => {
  const connection =
    (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

  const handleChange = async () => {
    const quality = await detectNetworkQuality(testUrl);
    onChange(quality);
  };

  // 监听在线/离线状态
  (window as any).addEventListener('online', handleChange);
  (window as any).addEventListener('offline', handleChange);

  // 监听网络类型变化
  if (connection) {
    connection.addEventListener('change', handleChange);
  }

  // 返回清理函数
  return () => {
    (window as any).removeEventListener('online', handleChange);
    (window as any).removeEventListener('offline', handleChange);
    if (connection) {
      connection.removeEventListener('change', handleChange);
    }
  };
};
