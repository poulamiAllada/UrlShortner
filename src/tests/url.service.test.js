
import { convertToB62 } from '../services/url.service.js';

describe('convertToB62', () => {
  test('produces a non-empty string for any positive integer', () => {
    expect(typeof convertToB62(1)).toBe('string');
    expect(convertToB62(1).length).toBeGreaterThan(0);
  });

  test('is deterministic — same input always gives same output', () => {
    expect(convertToB62(42)).toBe(convertToB62(42));
    expect(convertToB62(999)).toBe(convertToB62(999));
  });

  test('produces distinct codes for different IDs', () => {
    const codes = new Set([1, 2, 3, 100, 1000].map(convertToB62));
    expect(codes.size).toBe(5);
  });

  test('OFFSET ensures codes are not trivially short', () => {
    expect(convertToB62(1).length).toBeGreaterThanOrEqual(3);
  });

  test('only uses Base62 characters', () => {
    const base62Pattern = /^[0-9a-zA-Z]+$/;
    [1, 50, 999, 100000].forEach((n) => {
      expect(convertToB62(n)).toMatch(base62Pattern);
    });
  });
});
