export declare const detectBrowser: () => string;
export declare const getBrowserLocationOptions: (browser: string, baseOptions: {
    enableHighAccuracy: boolean;
    timeout: number;
    maximumAge: number;
}) => PositionOptions;
export declare const getBrowserCorsConfig: (browser: string) => boolean;
