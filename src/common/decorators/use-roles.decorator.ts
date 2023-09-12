import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const UseRoles = (...roles: UserRole[]) => SetMetadata('roles', roles);
