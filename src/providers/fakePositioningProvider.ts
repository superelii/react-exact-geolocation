// src/providers/fakePositioningProvider.ts
// 开发 / 测试用定位源：返回可配置的固定坐标，无需任何硬件（RTK / 原生 SDK 等）。
import type { PositioningProvider, PositioningResult } from '../types/geolocation.js';

export const createFakePositioningProvider = (
  result: Partial<PositioningResult> & { latitude: number; longitude: number },
  delay = 0
): PositioningProvider => {
  return async (signal?: AbortSignal) => {
    if (signal?.aborted) {
      throw new DOMException('Positioning aborted', 'AbortError');
    }
    if (delay > 0) {
      await new Promise<void>(resolve => setTimeout(resolve, delay));
    }
    return { accuracy: 0, ...result };
  };
};
