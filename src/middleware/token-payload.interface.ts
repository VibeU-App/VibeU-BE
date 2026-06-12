import { UserRole } from '../core/entities/user.entity';

export interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}
