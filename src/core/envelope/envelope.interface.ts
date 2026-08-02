/**
 * Standard API response envelope.
 *
 * All responses (success or failure) follow this structure.
 * The frontend expects this exact format to parse responses consistently.
 */
export interface Envelope<T = any> {
  /** HTTP status code */
  statusCode: number;
  /** Human-readable message describing the result */
  message: string;
  /** Response data (null for errors) */
  data: T | null;
  /** Additional metadata (pagination, timestamps, etc.) */
  metadata: Record<string, any> | null;
}

/**
 * Pagination metadata for list endpoints.
 */
export interface PaginationMeta {
  /** Current page number (1-based) */
  page: number;
  /** Number of items per page */
  limit: number;
  /** Total number of items */
  total: number;
  /** Total number of pages */
  totalPages: number;
}
