// src/utils/coordinateTransform.ts
// 坐标系转换：浏览器 geolocation 返回 WGS-84（GPS），国内地图需 GCJ-02（高德/腾讯）或 BD-09（百度）
// 谷歌逆地理编码使用 WGS-84，无需转换。
import type { MapService } from '../types/geolocation.js';

export type CoordinateTransform = (lat: number, lng: number) => { lat: number; lng: number };

const PI = Math.PI;
const A = 6378245.0; // 地球长半轴
const EE = 0.00669342162296594323; // 偏心率平方

const outOfChina = (lat: number, lng: number): boolean =>
  !(lng > 73.66 && lng < 135.05 && lat > 3.86 && lat < 53.55);

const transformLat = (lng: number, lat: number): number => {
  let ret =
    -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
  ret += ((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0) / 3.0;
  ret += ((20.0 * Math.sin(lat * PI) + 40.0 * Math.sin((lat / 3.0) * PI)) * 2.0) / 3.0;
  ret += ((160.0 * Math.sin((lat / 12.0) * PI) + 320 * Math.sin((lat * PI) / 30.0)) * 2.0) / 3.0;
  return ret;
};

const transformLng = (lng: number, lat: number): number => {
  let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
  ret += ((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0) / 3.0;
  ret += ((20.0 * Math.sin(lng * PI) + 40.0 * Math.sin((lng / 3.0) * PI)) * 2.0) / 3.0;
  ret += ((150.0 * Math.sin((lng / 12.0) * PI) + 300.0 * Math.sin((lng / 30.0) * PI)) * 2.0) / 3.0;
  return ret;
};

/** WGS-84 → GCJ-02（火星坐标） */
export const wgs84ToGcj02 = (lat: number, lng: number): { lat: number; lng: number } => {
  if (outOfChina(lat, lng)) return { lat, lng };
  let dLat = transformLat(lng - 105.0, lat - 35.0);
  let dLng = transformLng(lng - 105.0, lat - 35.0);
  const radLat = (lat / 180.0) * PI;
  let magic = Math.sin(radLat);
  magic = 1 - EE * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180.0) / (((A * (1 - EE)) / (magic * sqrtMagic)) * PI);
  dLng = (dLng * 180.0) / ((A / sqrtMagic) * Math.cos(radLat) * PI);
  return { lat: lat + dLat, lng: lng + dLng };
};

/** GCJ-02 → WGS-84（近似逆变换） */
export const gcj02ToWgs84 = (lat: number, lng: number): { lat: number; lng: number } => {
  const g = wgs84ToGcj02(lat, lng);
  return { lat: lat * 2 - g.lat, lng: lng * 2 - g.lng };
};

/** GCJ-02 → BD-09（百度坐标） */
export const gcj02ToBd09 = (lat: number, lng: number): { lat: number; lng: number } => {
  const x = lng;
  const y = lat;
  const z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * PI);
  const theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * PI);
  return { lat: z * Math.sin(theta), lng: z * Math.cos(theta) };
};

/** BD-09 → GCJ-02 */
export const bd09ToGcj02 = (lat: number, lng: number): { lat: number; lng: number } => {
  const x = lng;
  const y = lat;
  const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * PI);
  const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * PI);
  return { lat: z * Math.sin(theta), lng: z * Math.cos(theta) };
};

/** WGS-84 → BD-09 */
export const wgs84ToBd09 = (lat: number, lng: number): { lat: number; lng: number } => {
  const gcj = wgs84ToGcj02(lat, lng);
  return gcj02ToBd09(gcj.lat, gcj.lng);
};

/** BD-09 → WGS-84 */
export const bd09ToWgs84 = (lat: number, lng: number): { lat: number; lng: number } => {
  const gcj = bd09ToGcj02(lat, lng);
  return gcj02ToWgs84(gcj.lat, gcj.lng);
};

/** 按地图服务返回默认坐标转换（高德/腾讯→GCJ-02，百度→BD-09，谷歌→WGS-84 不转换） */
export const getCoordinateTransformForService = (mapService: MapService): CoordinateTransform => {
  switch (mapService) {
    case 'baidu':
      return wgs84ToBd09;
    case 'google':
      return (lat, lng) => ({ lat, lng }); // Google 使用 WGS-84
    case 'amap':
    case 'tencent':
    default:
      return wgs84ToGcj02;
  }
};
