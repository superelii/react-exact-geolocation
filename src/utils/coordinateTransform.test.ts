// src/utils/coordinateTransform.test.ts
import { describe, it, expect } from 'vitest';
import {
  wgs84ToGcj02,
  gcj02ToWgs84,
  wgs84ToBd09,
  bd09ToWgs84,
  getCoordinateTransformForService,
} from './coordinateTransform.js';

describe('coordinateTransform', () => {
  it('returns input unchanged for coordinates outside China', () => {
    const r = wgs84ToGcj02(51.5074, -0.1278); // London
    expect(r.lat).toBeCloseTo(51.5074, 6);
    expect(r.lng).toBeCloseTo(-0.1278, 6);
  });

  it('offsets a China coordinate (non-zero shift)', () => {
    const r = wgs84ToGcj02(39.908823, 116.39747);
    expect(Math.abs(r.lat - 39.908823)).toBeGreaterThan(0.001);
    expect(Math.abs(r.lng - 116.39747)).toBeGreaterThan(0.001);
  });

  it('round-trips WGS-84 <-> GCJ-02 within tolerance', () => {
    const g = wgs84ToGcj02(39.908823, 116.39747);
    const w = gcj02ToWgs84(g.lat, g.lng);
    expect(w.lat).toBeCloseTo(39.908823, 4);
    expect(w.lng).toBeCloseTo(116.39747, 4);
  });

  it('round-trips WGS-84 <-> BD-09 within tolerance', () => {
    const b = wgs84ToBd09(39.908823, 116.39747);
    const w = bd09ToWgs84(b.lat, b.lng);
    expect(w.lat).toBeCloseTo(39.908823, 4);
    expect(w.lng).toBeCloseTo(116.39747, 4);
  });

  it('selects correct transform per map service', () => {
    expect(getCoordinateTransformForService('amap')(1, 2)).toEqual(wgs84ToGcj02(1, 2));
    expect(getCoordinateTransformForService('tencent')(1, 2)).toEqual(wgs84ToGcj02(1, 2));
    expect(getCoordinateTransformForService('baidu')(1, 2)).toEqual(wgs84ToBd09(1, 2));
    // google 使用 WGS-84，不转换
    expect(getCoordinateTransformForService('google')(1, 2)).toEqual({ lat: 1, lng: 2 });
  });
});
