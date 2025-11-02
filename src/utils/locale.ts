import { Language } from '../types/geolocation.js';
/** 多语言文案映射（key：文案标识，value：各语言对应文案） */
const localeMap = {
  // 定位功能相关
  geolocation_not_supported: {
    'zh-CN': '{browser}不支持地理定位功能，请升级浏览器',
    'en-US': '{browser} does not support geolocation, please update your browser',
  },
  resolver_not_initialized: {
    'zh-CN': '地址解析器未初始化',
    'en-US': 'Address resolver is not initialized',
  },

  // 定位错误（GeolocationPositionError）
  permission_denied_360: {
    'zh-CN': '位置访问被拒绝。请点击地址栏右侧"权限"图标，允许位置访问。',
    'en-US':
      'Location access denied. Please click the "Permission" icon on the right of the address bar to allow location access.',
  },
  permission_denied_edge: {
    'zh-CN': '位置访问被拒绝。请点击地址栏左侧"锁"图标，在"位置"中选择"允许"。',
    'en-US':
      'Location access denied. Please click the "Lock" icon on the left of the address bar and select "Allow" for Location.',
  },
  permission_denied: {
    'zh-CN': '位置访问被拒绝。请在{browser}的设置中允许位置访问权限。',
    'en-US': 'Location access denied. Please allow location access in {browser} settings.',
  },
  position_unavailable: {
    'zh-CN': '无法获取位置信息。请确保设备已启用定位功能，且{browser}有权访问。',
    'en-US':
      'Unable to retrieve location. Please ensure location services are enabled on your device and {browser} has permission.',
  },
  timeout: {
    'zh-CN': '定位超时，请检查网络后重试',
    'en-US': 'Location timeout. Please check your network and try again.',
  },
  https_required: {
    'zh-CN': '请在HTTPS环境或localhost下使用（{browser}安全限制）',
    'en-US': 'Please use in HTTPS environment or localhost ({browser} security restriction).',
  },
  unknown_error: {
    'zh-CN': '定位失败: {message}',
    'en-US': 'Location failed: {message}',
  },

  // 地图API错误
  amap_error: {
    'zh-CN': '高德API错误: {info}',
    'en-US': 'Amap API error: {info}',
  },
  baidu_error: {
    'zh-CN': '百度API错误: {info}',
    'en-US': 'Baidu API error: {info}',
  },
  tencent_error: {
    'zh-CN': '腾讯API错误: {info}',
    'en-US': 'Tencent API error: {info}',
  },
  address_resolve_failed: {
    'zh-CN': '地址解析失败: {message}',
    'en-US': 'Address resolution failed: {message}',
  },
  google_error: {
    'zh-CN': '谷歌API错误: {info}',
    'en-US': 'Google API error: {info}',
  },
};

/**
 * 获取多语言文案
 * @param key 文案标识
 * @param lang 语言类型
 * @param params 文案中的占位符参数（如{browser}、{message}）
 * @returns 格式化后的多语言文案
 */
export const getLocaleText = (
  key: keyof typeof localeMap,
  lang: Language = 'zh-CN',
  params: Record<string, string> = {}
): string => {
  // 默认中文文案
  const text = localeMap[key][lang] || localeMap[key]['zh-CN'];

  // 替换占位符（如{browser} → Chrome）
  return Object.entries(params).reduce((result, [paramKey, paramValue]) => {
    return result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramValue);
  }, text);
};
