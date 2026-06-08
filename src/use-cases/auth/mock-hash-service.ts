import { IHashService } from './hash-service.interface';

export class MockHashService implements IHashService {
  async hash(password: string): Promise<string> {
    return '$2b$10$hashed_' + password;
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return hash === '$2b$10$hashed_' + password;
  }
}