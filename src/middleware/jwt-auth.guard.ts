import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Inject,
} from '@nestjs/common';
import { ITokenService } from '../infrastructure/services/token/token.service';
import { AppException, ErrorCode } from '../core/errors';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject('ITokenService')
    private readonly tokenService: ITokenService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppException(ErrorCode.AUTH_INVALID_TOKEN);
    }

    const token = authHeader.substring(7);

    try {
      const payload = this.tokenService.verifyAccessToken(token);
      request.user = payload;
      return true;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AppException(ErrorCode.AUTH_TOKEN_EXPIRED);
      }
      throw new AppException(ErrorCode.AUTH_INVALID_TOKEN);
    }
  }
}
