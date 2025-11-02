export const detectBrowser = () => {
    if (typeof navigator === 'undefined') {
        return '非浏览器环境';
    }
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('msie') || userAgent.includes('trident/')) {
        return 'Internet Explorer';
    }
    else if (userAgent.includes('edg') && !userAgent.includes('chrome')) {
        return 'Microsoft Edge';
    }
    else if (userAgent.includes('chrome') && userAgent.includes('edg')) {
        return 'Microsoft Edge (Chromium)';
    }
    else if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
        return 'Chrome';
    }
    else if (userAgent.includes('firefox')) {
        return 'Firefox';
    }
    else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
        return 'Safari';
    }
    else if (userAgent.includes('360se') || userAgent.includes('360ee')) {
        return '360浏览器';
    }
    else if (userAgent.includes('qqbrowser')) {
        return 'QQ浏览器';
    }
    else if (userAgent.includes('ubrowser')) {
        return 'UC浏览器';
    }
    else {
        return '未知浏览器';
    }
};
export const getBrowserLocationOptions = (browser, baseOptions) => {
    return {
        enableHighAccuracy: browser === '360浏览器' ? false : baseOptions.enableHighAccuracy,
        timeout: browser === 'Firefox' ? baseOptions.timeout + 5000 : baseOptions.timeout,
        maximumAge: baseOptions.maximumAge,
    };
};
export const getBrowserCorsConfig = (browser) => {
    return ['360浏览器', 'QQ浏览器', 'UC浏览器'].includes(browser);
};
