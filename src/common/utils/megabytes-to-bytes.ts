const ONE_BYTE = 1_000_000;

export const MegabytesToBytes = (megabytes: number): number =>
  megabytes * ONE_BYTE;
