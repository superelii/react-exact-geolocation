const localeMap = {
    geolocation_not_supported: {
        'zh-CN': '{browser}不支持地理定位功能，请升级浏览器',
        'en-US': '{browser} does not support geolocation, please update your browser',
    },
    resolver_not_initialized: {
        'zh-CN': '地址解析器未初始化',
        'en-US': 'Address resolver is not initialized',
    },
    permission_denied_360: {
        'zh-CN': '位置访问被拒绝。请点击地址栏右侧"权限"图标，允许位置访问。',
        'en-US': 'Location access denied. Please click the "Permission" icon on the right of the address bar to allow location access.',
    },
    permission_denied_edge: {
        'zh-CN': '位置访问被拒绝。请点击地址栏左侧"锁"图标，在"位置"中选择"允许"。',
        'en-US': 'Location access denied. Please click the "Lock" icon on the left of the address bar and select "Allow" for Location.',
    },
    permission_denied: {
        'zh-CN': '位置访问被拒绝。请在{browser}的设置中允许位置访问权限。',
        'en-US': 'Location access denied. Please allow location access in {browser} settings.',
    },
    position_unavailable: {
        'zh-CN': '无法获取位置信息。请确保设备已启用定位功能，且{browser}有权访问。',
        'en-US': 'Unable to retrieve location. Please ensure location services are enabled on your device and {browser} has permission.',
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
export const getLocaleText = (key, lang = 'zh-CN', params = {}) => {
    const text = localeMap[key][lang] || localeMap[key]['zh-CN'];
    return Object.entries(params).reduce((result, [paramKey, paramValue]) => {
        return result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramValue);
    }, text);
};
