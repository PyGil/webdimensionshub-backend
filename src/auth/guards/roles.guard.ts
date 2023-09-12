import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(executionContext: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      executionContext.getHandler(),
      executionContext.getClass(),
    ]);

    if (!roles) {
      return true;
    }

    const request = executionContext.switchToHttp().getRequest();

    const { user } = request;

    if (!user) {
      return false;
    }

    return roles.includes(user.role);
  }
}
