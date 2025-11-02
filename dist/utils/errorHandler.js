import axios from 'axios';
import { getLocaleText } from './locale.js';
export const handleMapApiError = (err, lang, mapService) => {
    if (err && err.__CANCEL__)
        return '';
    if (axios.isAxiosError(err)) {
        const responseData = err.response?.data || {};
        const info = responseData.info || responseData.message || 'Unknown error';
        switch (mapService) {
            case 'baidu':
                return getLocaleText('baidu_error', lang, { info });
            case 'tencent':
                return getLocaleText('tencent_error', lang, { info });
            default:
                return getLocaleText('amap_error', lang, { info });
        }
    }
    const message = err instanceof Error ? err.message : 'Unknown error';
    return getLocaleText('address_resolve_failed', lang, { message });
};
export const handleGeolocationError = (error, browser, lang) => {
    switch (error.code) {
        case 1:
            if (browser.includes('360')) {
                return getLocaleText('permission_denied_360', lang);
            }
            else if (browser.includes('Edge')) {
                return getLocaleText('permission_denied_edge', lang);
            }
            else {
                return getLocaleText('permission_denied', lang, { browser });
            }
        case 2:
            return getLocaleText('position_unavailable', lang, { browser });
        case 3:
            return getLocaleText('timeout', lang);
        default:
            if (error.message.includes('HTTPS') || error.message.includes('security')) {
                return getLocaleText('https_required', lang, { browser });
            }
            else {
                return getLocaleText('unknown_error', lang, { message: error.message });
            }
    }
};
