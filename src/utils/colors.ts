// Google Charts / Google Sheets default chart color palette
const PALETTE = [
  '#3366CC',
  '#FF9900',
  '#109618',
  '#990099',
  '#0099C6',
  '#66AA00',
  '#316395',
  '#00838F',
  '#558B2F',
  '#F57F17',
  '#994499',
  '#22AA99',
  '#AAAA11',
  '#6633CC',
  '#E67300',
  '#329262',
  '#5574A6',
  '#3B3EAC',
];

export function buildColorMap(names: string[]): Map<string, string> {
  const map = new Map<string, string>();
  names.forEach((name, i) => {
    map.set(name, PALETTE[i % PALETTE.length]!);
  });
  return map;
}
