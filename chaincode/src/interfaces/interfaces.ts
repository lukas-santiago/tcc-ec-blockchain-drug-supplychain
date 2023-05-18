import { Context } from 'fabric-contract-api'
import { RAMO_ATIVIDADE } from '../definitions/enums/enums'

/**
 * Interface for UUID generator
 */
export interface IUUIDGenerator {
  getUUID(context: Context, stringToHash: string): string
  validateUUID(uuid: string): boolean
}

export interface IPessoaJuridica {
  cnpj: string
  nome: string
  RamoAtividade: RAMO_ATIVIDADE
  extras: string
}
