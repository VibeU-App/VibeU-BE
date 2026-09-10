import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenPayload } from './token-payload.interface';

/**
 * Custom parameter decorator to extract the authenticated user's token payload
 * from the HTTP request object.
 */
export const CurrentUser = createParamDecorator(
  (data: keyof TokenPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: TokenPayload = request.user;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
