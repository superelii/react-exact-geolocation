/**
 * 检测浏览器类型
 * @returns 浏览器名称
 */
export declare const detectBrowser: () => string;
/**
 * 根据浏览器类型获取定位配置适配项
 * @param browser 浏览器名称
 * @param baseOptions 基础定位配置
 * @returns 适配后的定位配置
 */
export declare const getBrowserLocationOptions: (browser: string, baseOptions: {
    enableHighAccuracy: boolean;
    timeout: number;
    maximumAge: number;
}) => PositionOptions;
/**
 * 根据浏览器类型获取跨域配置
 * @param browser 浏览器名称
 * @returns 是否需要带凭据
 */
export declare const getBrowserCorsConfig: (browser: string) => boolean;
