import { Language } from '../types/geolocation.js';
export declare const handleMapApiError: (err: unknown, lang: Language, mapService: string) => string;
export declare const handleGeolocationError: (error: GeolocationPositionError, browser: string, lang: Language) => string;
