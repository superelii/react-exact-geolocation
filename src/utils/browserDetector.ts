/**
 * 检测浏览器类型
 * @returns 浏览器名称
 */
export const detectBrowser = (): string => {
  if (typeof navigator === 'undefined') {
    return '非浏览器环境';
  }

  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes('msie') || userAgent.includes('trident/')) {
    return 'Internet Explorer';
  } else if (userAgent.includes('edg') && !userAgent.includes('chrome')) {
    return 'Microsoft Edge';
  } else if (userAgent.includes('chrome') && userAgent.includes('edg')) {
    return 'Microsoft Edge (Chromium)';
  } else if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
    return 'Chrome';
  } else if (userAgent.includes('firefox')) {
    return 'Firefox';
  } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    return 'Safari';
  } else if (userAgent.includes('360se') || userAgent.includes('360ee')) {
    return '360浏览器';
  } else if (userAgent.includes('qqbrowser')) {
    return 'QQ浏览器';
  } else if (userAgent.includes('ubrowser')) {
    return 'UC浏览器';
  } else {
    return '未知浏览器';
  }
};

/**
 * 根据浏览器类型获取定位配置适配项
 * @param browser 浏览器名称
 * @param baseOptions 基础定位配置
 * @returns 适配后的定位配置
 */
export const getBrowserLocationOptions = (
  browser: string,
  baseOptions: {
    enableHighAccuracy: boolean;
    timeout: number;
    maximumAge: number;
  }
): PositionOptions => {
  // 针对不同浏览器的特殊适配
  return {
    enableHighAccuracy: browser === '360浏览器' ? false : baseOptions.enableHighAccuracy,
    timeout: browser === 'Firefox' ? baseOptions.timeout + 5000 : baseOptions.timeout,
    maximumAge: baseOptions.maximumAge,
  };
};

/**
 * 根据浏览器类型获取跨域配置
 * @param browser 浏览器名称
 * @returns 是否需要带凭据
 */
export const getBrowserCorsConfig = (browser: string): boolean => {
  return ['360浏览器', 'QQ浏览器', 'UC浏览器'].includes(browser);
};
