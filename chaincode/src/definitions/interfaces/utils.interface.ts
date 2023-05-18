import { Context } from 'fabric-contract-api';

/**
 * Interface for UUID generator
 */

export interface IUUIDGenerator {
  getUUID(context: Context, stringToHash: string): string;
  validateUUID(uuid: string): boolean;
}
