import { Envelope, PaginationMeta } from './envelope.interface';

/**
 * Helper functions to create standardized envelope responses.
 *
 * These ensure all responses follow the same structure:
 * { statusCode, message, data, metadata }
 */

/**
 * Creates a success response envelope.
 *
 * @param data - The response data
 * @param message - Success message (default: 'Success')
 * @param statusCode - HTTP status code (default: 200)
 * @param metadata - Optional metadata (pagination, etc.)
 */
export function success<T>(
  data: T,
  message: string = 'Success',
  statusCode: number = 200,
  metadata?: Record<string, any>,
): Envelope<T> {
  return {
    statusCode,
    message,
    data,
    metadata: metadata ?? null,
  };
}

/**
 * Creates a success response with pagination metadata.
 *
 * @param data - Array of items
 * @param pagination - Pagination information
 * @param message - Success message
 */
export function successWithPagination<T>(
  data: T[],
  pagination: PaginationMeta,
  message: string = 'Success',
): Envelope<T[]> {
  return {
    statusCode: 200,
    message,
    data,
    metadata: { pagination },
  };
}

/**
 * Creates a created (201) response envelope.
 *
 * @param data - The created resource
 * @param message - Success message (default: 'Created successfully')
 */
export function created<T>(
  data: T,
  message: string = 'Created successfully',
): Envelope<T> {
  return {
    statusCode: 201,
    message,
    data,
    metadata: null,
  };
}

/**
 * Creates a no-content (204) response envelope.
 * Used for delete operations or actions with no return data.
 */
export function noContent(
  message: string = 'Deleted successfully',
): Envelope<null> {
  return {
    statusCode: 204,
    message,
    data: null,
    metadata: null,
  };
}
