import { IJwtService } from './jwt-service.interface';

export class MockJwtService implements IJwtService {
  signPayload(payload: Record<string, any>): string {
    return 'mock-jwt-token';
  }

  verifyToken(token: string): Record<string, any> {
    if (token === 'invalid-token') {
      throw new Error('Invalid token');
    }
    if (token === 'expired-token') {
      throw new Error('Token expired');
    }
    return { sub: 'user-123', email: 'user@example.com', role: 'user' };
  }
}