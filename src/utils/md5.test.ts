import { describe, it, expect } from 'vitest';
import { md5 } from './md5.js';

describe('md5', () => {
  it('matches known RFC 1321 test vectors', () => {
    expect(md5('')).toBe('d41d8cd98f00b204e9800998ecf8427e');
    expect(md5('abc')).toBe('900150983cd24fb0d6963f7d28e17f72');
    expect(md5('message digest')).toBe('f96b697d7cb7938d525a2f31aaf161d0');
    expect(md5('abcdefghijklmnopqrstuvwxyz')).toBe('c3fcd3d76192e4007dfb496cca67e13b');
  });

  it('handles UTF-8 (Chinese) input deterministically', () => {
    // 高德签名场景含中文参数值：验证 UTF-8 路径不崩溃且结果稳定、为 32 位小写 hex
    const a = md5('北京');
    const b = md5('北京');
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{32}$/);
  });

  it('matches 高德 signing concatenation example', () => {
    // 模拟：排序参数 + 私钥，验证拼接方式符合高德规则
    const params: Record<string, string | number> = { key: 'xxx', location: '116.4,39.9' };
    const sortedKeys = Object.keys(params).sort();
    const raw = sortedKeys.map((k) => `${k}=${params[k]}`).join('&') + 'bbbbb';
    expect(raw).toBe('key=xxx&location=116.4,39.9bbbbb');
    expect(typeof md5(raw)).toBe('string');
    expect(md5(raw)).toHaveLength(32);
  });
});
