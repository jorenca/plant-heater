export function round(x: number, precision: number = 0): number {
  const scale = 10**precision;
  return Math.round(scale * x) / scale;
}
