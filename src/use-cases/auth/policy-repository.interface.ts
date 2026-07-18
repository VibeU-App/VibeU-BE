/**
 * Interface for policy repository.
 * 
 * Defines the contract to fetch application dynamic settings and policies.
 */
export interface IPolicyRepository {
  findValueByKey(key: string): Promise<string | null>;
}
