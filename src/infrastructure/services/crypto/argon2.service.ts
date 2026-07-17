import * as argon2 from 'argon2';
import { ICryptoService } from './crypto.interface';

/**
 * Argon2id implementation of the crypto service.
 *
 * Argon2id is the recommended variant for password hashing:
 * - Resistant to GPU attacks (memory-hard)
 * - Resistant to side-channel attacks
 * - Winner of the Password Hashing Competition
 */
export class Argon2Service implements ICryptoService {
  /**
   * Hashes a plain text password using argon2id.
   * @param password - The plain text password to hash
   * @returns The hashed password string
   */
  async hash(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536, // 64 MB
      timeCost: 3,
      parallelism: 4,
    });
  }

  /**
   * Compares a plain text password against a hashed password.
   * @param password - The plain text password to check
   * @param hash - The hashed password to compare against
   * @returns true if the passwords match, false otherwise
   */
  async compare(password: string, hash: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }
}
