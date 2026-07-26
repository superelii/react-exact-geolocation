// src/useGetGeolocation.test.tsx
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useGetGeolocation from './useGetGeolocation.js';
import { AddressResolver, AddressInfo } from './types/geolocation.js';
import { createFakePositioningProvider } from './providers/fakePositioningProvider.js';

const makeResolver = (capture: { params?: any }): AddressResolver => ({
  config: { apiKey: 'x', browser: 'Chrome' },
  async getAddress(params) {
    capture.params = params;
    const info: AddressInfo = {
      country: '中国',
      province: '北京',
      city: '北京',
      district: '东城',
      township: null,
    };
    return info;
  },
});

describe('useGetGeolocation', () => {
  it('applies coordinate transform before resolving address (provider seam)', async () => {
    const capture: { params?: any } = {};
    const provider = createFakePositioningProvider({ latitude: 39.908823, longitude: 116.39747 });
    const { result } = renderHook(() =>
      useGetGeolocation('test-key', {
        mapService: 'amap',
        positioningProvider: provider,
        customResolver: makeResolver(capture),
        debounceDelay: 0,
      })
    );

    await act(async () => {
      result.current.startGeolocation();
    });
    await act(async () => {
      await new Promise(r => setTimeout(r, 30));
    });

    expect(capture.params).toBeDefined();
    // 传入 resolver 的应是 GCJ-02 转换后坐标，而非原始 WGS-84
    expect(capture.params.longitude).not.toBeCloseTo(116.39747, 3);
    expect(result.current.city).toBe('北京');
    // position 保存的是设备实测原始 WGS-84 坐标
    expect(result.current.position?.latitude).toBe(39.908823);
  });

  it('falls back to browser geolocation when no provider given', async () => {
    const capture: { params?: any } = {};
    (globalThis as any).navigator.geolocation = {
      getCurrentPosition: (success: any) =>
        success({ coords: { latitude: 31.23, longitude: 121.47, accuracy: 10 } }),
    };

    const { result } = renderHook(() =>
      useGetGeolocation('test-key', {
        mapService: 'amap',
        customResolver: makeResolver(capture),
        debounceDelay: 0,
      })
    );

    await act(async () => {
      result.current.startGeolocation();
    });
    await act(async () => {
      await new Promise(r => setTimeout(r, 30));
    });

    expect(result.current.position?.latitude).toBe(31.23);
    // 浏览器坐标也应经过坐标转换再送 resolver
    expect(capture.params.longitude).not.toBeCloseTo(121.47, 3);
  });
});
