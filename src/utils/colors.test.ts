import { describe, it, expect } from 'vitest';
import { buildColorMap } from './colors';

describe('buildColorMap', () => {
  it('assigns unique colors to each entity', () => {
    const names = ['Bank A', 'Bank B', 'Bank C'];
    const map = buildColorMap(names);
    const colors = [...map.values()];
    expect(new Set(colors).size).toBe(3);
  });

  it('preserves order — first entity gets first palette color', () => {
    const map = buildColorMap(['Alpha', 'Beta']);
    expect(map.get('Alpha')).toBe('#3366CC');
    expect(map.get('Beta')).toBe('#FF9900');
  });

  it('wraps around when more names than palette entries', () => {
    const names = Array.from({ length: 20 }, (_, i) => `Entity ${i}`);
    const map = buildColorMap(names);
    expect(map.get('Entity 0')).toBe(map.get('Entity 18'));
  });

  it('returns empty map for empty input', () => {
    expect(buildColorMap([]).size).toBe(0);
  });
});
