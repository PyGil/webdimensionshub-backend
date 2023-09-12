import { UserRole } from '@prisma/client';

export interface TokenPayload {
  sub: number;
  role: UserRole;
}
