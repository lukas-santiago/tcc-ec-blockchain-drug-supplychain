import { Property } from 'fabric-contract-api'
import { IPessoaJuridica } from '../interfaces'
import { RAMO_ATIVIDADE } from '../enums/enums'

@Object()
export class PessoaJuridica implements IPessoaJuridica {
  @Property()
  cnpj!: string
  @Property()
  nome!: string
  @Property()
  RamoAtividade!: RAMO_ATIVIDADE

  @Property()
  extras!: string
}
