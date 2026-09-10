/**
 * Interface for password hashing service.
 *
 * This abstraction allows the use-cases to work with any hashing implementation
 * (bcrypt, argon2, etc.) without knowing the details.
 */
export interface ICryptoService {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}
