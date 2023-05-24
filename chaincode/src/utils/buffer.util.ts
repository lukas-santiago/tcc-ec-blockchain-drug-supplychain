import sortKeysRecursive from 'sort-keys-recursive'
import stringify from 'json-stringify-deterministic'

/**
 * Converte os dados fornecidos em um buffer Uint8Array de forma determinística após classificar suas chaves recursivamente e convertê-lo para uma string.
 *
 * @param {any} data - os dados a serem convertidos em buffer
 * @return {Uint8Array} o buffer resultante
 */
export function convertToBufferDeterministically(data: any): Uint8Array {
  return Buffer.from(stringify(sortKeysRecursive(data)))
}
