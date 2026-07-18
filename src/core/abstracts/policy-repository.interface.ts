/**
 * Interface for Policy Repository.
 */
export interface IPolicyRepository {
  findValueByKey(key: string): Promise<string | null>;
}
