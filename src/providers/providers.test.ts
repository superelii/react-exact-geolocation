// src/providers/providers.test.ts
import { describe, it, expect } from 'vitest';
import { createBrowserPositioningProvider } from './browserPositioningProvider.js';
import { createFakePositioningProvider } from './fakePositioningProvider.js';

describe('positioning providers', () => {
  it('fake provider returns configured coordinates', async () => {
    const p = createFakePositioningProvider({ latitude: 39.9, longitude: 116.4 }, 1);
    const r = await p();
    expect(r.latitude).toBe(39.9);
    expect(r.longitude).toBe(116.4);
    expect(r.accuracy).toBe(0);
  });

  it('fake provider respects abort', async () => {
    const p = createFakePositioningProvider({ latitude: 1, longitude: 2 }, 1000);
    const ac = new AbortController();
    ac.abort();
    await expect(p(ac.signal)).rejects.toThrow();
  });

  it('browser provider rejects when geolocation is unavailable', async () => {
    const p = createBrowserPositioningProvider();
    await expect(p()).rejects.toThrow('GEOLOCATION_UNSUPPORTED');
  });
});
