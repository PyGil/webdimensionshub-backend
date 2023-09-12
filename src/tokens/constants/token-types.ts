import { VerificationTokenTypes } from '@prisma/client';

export const TokenTypes = {
  ...VerificationTokenTypes,
  access: 'access',
  refresh: 'refresh',
} as const;
