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

function hashStr(s: string): number {
  let h = 0;
  for (const c of s) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

export function getEntityColor(name: string): string {
  return PALETTE[hashStr(name) % PALETTE.length]!;
}
