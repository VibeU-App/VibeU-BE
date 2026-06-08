export interface IJwtService {
  signPayload(payload: Record<string, any>): string;
  verifyToken(token: string): Record<string, any>;
}