/**
 * OTP (One-Time Password) domain entity.
 * Used for email verification, passwordless login, and password reset.
 */
export class OtpEntity {
  constructor(
    public readonly userId: string,
    public readonly code: string,
    public readonly expiresAt: Date,
    public readonly createdAt: Date,
    public attempts: number = 0,
    public readonly maxAttempts: number = 5,
  ) {}

  /**
   * Creates a new OTP entity.
   */
  static create(props: {
    userId: string;
    code?: string;
    expiryMinutes?: number;
    maxAttempts?: number;
  }): OtpEntity {
    const code =
      props.code ?? Math.floor(100000 + Math.random() * 900000).toString();
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMinutes(expiresAt.getMinutes() + (props.expiryMinutes ?? 15)); // Default 15 minutes

    return new OtpEntity(
      props.userId,
      code,
      expiresAt,
      now,
      0, // Initial attempts
      props.maxAttempts ?? 5, // Default 5 attempts
    );
  }

  /**
   * Checks if the OTP has expired.
   */
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  /**
   * Checks if max attempts exceeded.
   */
  isMaxAttemptsReached(): boolean {
    return this.attempts >= this.maxAttempts;
  }

  /**
   * Increments attempt count.
   * Returns true if still within limit, false if exceeded.
   */
  incrementAttempts(): boolean {
    this.attempts++;
    return this.attempts <= this.maxAttempts;
  }

  /**
   * Checks if the OTP is valid (not expired and attempts not exceeded).
   */
  isValid(): boolean {
    return !this.isExpired() && !this.isMaxAttemptsReached();
  }
}
