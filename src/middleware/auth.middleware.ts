import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AppException, ErrorCode } from '../core/errors';
import { UserRole } from '../core/entities/user.entity';
import { TokenPayload } from './token-payload.interface';

export class AuthMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppException(ErrorCode.AUTH_INVALID_TOKEN);
    }

    const token = authHeader.substring(7);

    // TODO: Verify JWT token and extract payload
    if (token === 'invalid-token') {
      throw new AppException(ErrorCode.AUTH_INVALID_TOKEN);
    }
    if (token === 'expired-token') {
      throw new AppException(ErrorCode.AUTH_TOKEN_EXPIRED);
    }

    // Mock payload - in real implementation, decode JWT
    const payload: TokenPayload = {
      sub: 'user-123',
      email: 'user@example.com',
      role: UserRole.USER,
    };

    // Attach user to request
    (req as any).user = payload;
    next();
  }
}
