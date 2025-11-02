import { AddressInfo } from '../types/geolocation.js';
export interface ResolverConfig {
    apiKey: string;
    browser: string;
}
export interface ResolveParams {
    longitude: number;
    latitude: number;
    accuracy: number;
    signal: AbortSignal;
}
export interface AddressResolver {
    config: ResolverConfig;
    getAddress(params: ResolveParams): Promise<AddressInfo>;
}
