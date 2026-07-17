/**
 * Prisma extension for caching frequently accessed queries.
 * 
 * This uses PostgreSQL's built-in caching capabilities along with
 * an application-level cache to reduce database load.
 * 
 * Caching strategy:
 * - Cache user lookups by ID and email (most frequent queries)
 * - Invalidate cache on writes (create/update)
 * - TTL-based expiration for cache entries
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

/**
 * Simple in-memory cache with TTL support.
 * For production, consider using Redis for distributed caching.
 */
export class QueryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTtl: number; // in milliseconds

  constructor(defaultTtlSeconds: number = 300) { // 5 minutes default
    this.defaultTtl = defaultTtlSeconds * 1000;
  }

  /**
   * Gets a value from cache. Returns null if expired or not found.
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Sets a value in cache with optional custom TTL.
   */
  set<T>(key: string, data: T, ttlSeconds?: number): void {
    const ttl = ttlSeconds ? ttlSeconds * 1000 : this.defaultTtl;
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl,
    });
  }

  /**
   * Deletes a specific key from cache.
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Deletes all keys matching a pattern.
   * Useful for invalidating all user-related cache entries.
   */
  deleteByPattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clears the entire cache.
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Returns cache statistics for monitoring.
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Singleton cache instance for user queries
export const userCache = new QueryCache(300); // 5 minute TTL
