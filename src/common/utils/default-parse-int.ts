const DEFAULT_RADIX = 10;

export const defaultParseInt = (string: string): number =>
  parseInt(string, DEFAULT_RADIX);
