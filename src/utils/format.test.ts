import { describe, it, expect } from 'vitest';
import { formatPeriod } from './format';

describe('formatPeriod', () => {
  it('formats YYYYMM to month abbreviation and year', () => {
    expect(formatPeriod('202501')).toBe('Ene 2025');
    expect(formatPeriod('202512')).toBe('Dic 2025');
    expect(formatPeriod('202406')).toBe('Jun 2024');
  });

  it('handles all months', () => {
    const expected = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    expected.forEach((month, i) => {
      const mm = String(i + 1).padStart(2, '0');
      expect(formatPeriod(`2025${mm}`)).toBe(`${month} 2025`);
    });
  });
});
