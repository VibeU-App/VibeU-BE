import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../core/entities/user.entity';
import { AppException, ErrorCode } from '../../core/errors';
import { ROLES_KEY } from './roles.decorator';
import { TokenPayload } from './token-payload.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as TokenPayload;

    if (!user) {
      throw new AppException(ErrorCode.AUTH_INVALID_TOKEN);
    }

    const hasRole = requiredRoles.some((role) => user.role === role);
    if (!hasRole) {
      throw new AppException(ErrorCode.AUTH_FORBIDDEN);
    }

    return true;
  }
}