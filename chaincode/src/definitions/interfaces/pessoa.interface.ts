import { DefaultType } from '.'
import { RAMO_ATIVIDADE } from '../enums/enums'

export interface IPessoaJuridica extends DefaultType {
  cnpj: string
  nome: string
  RamoAtividade: RAMO_ATIVIDADE
  extras: string
}
