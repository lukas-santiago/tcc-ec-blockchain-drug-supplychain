import * as uuidgen from 'uuid'
import { Context } from 'fabric-contract-api'

import { UUID } from '../definitions/types/types'
import { IUUIDGenerator } from '../definitions/interfaces/utils.interface'

/**
 * Classe responsável por gerar UUIDs (Universally Unique Identifiers) na versão 5.
 * O namespace adotado é o MSPID (Membership Service Provider ID) provido pela HyperLedger Cotract API.
 */
export class UUIDGenerator implements IUUIDGenerator {
  /**
   * Gera um identificador único usando o contexto fornecido e a string a ser hashada.
   *
   * @param {Contexto} contexto - o objeto de contexto usado para recuperar o MSPID
   * @param {string} stringParaHash - a string a ser hashada e usada no UUID
   * @return {string} - o UUID gerado como uma string
   */
  getUUID(context: Context, stringToHash: UUID) {
    const MSPID = context.clientIdentity.getMSPID()

    return uuidgen.v5(stringToHash, MSPID)
  }

  /**
   * Valida um UUID verificando se é uma string de UUID válida e se sua versão é 5.
   *
   * @param {UUID} uuid - o UUID a ser validado
   * @return {boolean} true se o UUID for válido e sua versão for 5, false caso contrário
   */
  validateUUID(uuid: UUID): boolean {
    return uuidgen.validate(uuid) && uuidgen.version(uuid) === 5
  }
}
