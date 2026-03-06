import { describe, it, expect } from 'vitest';
import { validateCuit, parseCuits } from './cuit';

describe('validateCuit', () => {
  it('accepts a valid CUIT', () => {
    expect(validateCuit('30-54667642-7')).toBe(true);
    expect(validateCuit('30546676427')).toBe(true);
  });

  it('accepts valid CUITs without dashes', () => {
    expect(validateCuit('30546676427')).toBe(true);
    expect(validateCuit('27181aborting92149')).toBe(false);
  });

  it('rejects invalid check digit', () => {
    expect(validateCuit('20123456780')).toBe(false);
  });

  it('rejects wrong length', () => {
    expect(validateCuit('2012345678')).toBe(false);
    expect(validateCuit('201234567890')).toBe(false);
  });

  it('rejects non-numeric input', () => {
    expect(validateCuit('abcdefghijk')).toBe(false);
  });

  it('rejects empty input', () => {
    expect(validateCuit('')).toBe(false);
  });
});

describe('parseCuits', () => {
  it('splits by newline', () => {
    expect(parseCuits('20123456783\n30546676427')).toEqual(['20123456783', '30546676427']);
  });

  it('splits by comma', () => {
    expect(parseCuits('20123456783,30546676427')).toEqual(['20123456783', '30546676427']);
  });

  it('strips dashes', () => {
    expect(parseCuits('20-12345678-3')).toEqual(['20123456783']);
  });

  it('handles mixed separators and whitespace', () => {
    expect(parseCuits('20123456783 , 30546676427\n27181929149')).toEqual([
      '20123456783', '30546676427', '27181929149',
    ]);
  });

  it('returns empty array for empty input', () => {
    expect(parseCuits('')).toEqual([]);
  });
});
