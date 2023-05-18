import { RAMO_ATIVIDADE } from '../enums/enums'

export interface IPessoaJuridica {
  cnpj: string
  nome: string
  RamoAtividade: RAMO_ATIVIDADE
  extras: string
}
